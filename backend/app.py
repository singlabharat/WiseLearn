from flask import Flask, request, jsonify
from flask_cors import CORS
from gemini_teacher import (
    teach_topic, 
    list_subtopics, 
    extract_image_captions, 
    scrape_images, 
    replace_descriptors_with_urls,
    compare_user_summary,
    extract_text_from_pdf,
    list_subtopics_from_text,
    teach_topic_from_text
)
import google.generativeai as genai
from config import GOOGLE_API_KEY
import os
from werkzeug.utils import secure_filename

# Configure Google Gemini API
genai.configure(api_key=GOOGLE_API_KEY)

app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/teach', methods=['POST'])
def get_lesson():
    data = request.form if request.files else request.json
    topic = data.get('topic', '')  # Make topic optional, default to empty string
    
    if not topic and not request.files:
        return jsonify({'error': 'Please provide either a topic or a PDF file'}), 400
    
    try:
        # Check if PDF file is provided
        if request.files and 'pdf_file' in request.files:
            pdf_file = request.files['pdf_file']
            if pdf_file and allowed_file(pdf_file.filename):
                # Save PDF file
                filename = secure_filename(pdf_file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                print(f"Saving PDF to: {filepath}")
                pdf_file.save(filepath)
                
                # Extract text from PDF
                text_content = extract_text_from_pdf(filepath)
                if not text_content:
                    os.remove(filepath)
                    return jsonify({'error': 'Could not extract text from the PDF. The file might be empty, password-protected, or image-based.'}), 400
                
                print(f"Successfully extracted {len(text_content)} characters from PDF")
                
                # Get subtopics from PDF content
                subtopics = list_subtopics_from_text(text_content, topic, "briefly")
                if not subtopics:
                    os.remove(filepath)
                    return jsonify({'error': 'Could not identify subtopics from the PDF content'}), 400
                
                print(f"Generated {len(subtopics)} subtopics from PDF content")
                
                # Generate content for each subtopic using PDF content
                full_text = ""
                for subtopic in subtopics:
                    full_text += "\n" + teach_topic_from_text(subtopic, text_content)
                
                # Clean up the PDF file
                os.remove(filepath)
            else:
                return jsonify({'error': 'Invalid file type. Please upload a PDF.'}), 400
        else:
            # Regular topic-based workflow
            if not topic:
                return jsonify({'error': 'Topic is required when no PDF is provided'}), 400
                
            subtopics = list_subtopics(topic, "briefly")
            full_text = ""
            for subtopic in subtopics:
                full_text += "\n" + teach_topic(subtopic)
        
        # Process images (same for both workflows)
        captions = extract_image_captions(full_text)
        image_urls = []
        for caption in captions:
            url = scrape_images([caption])
            if url:
                image_urls.append(url)
        
        # Replace descriptors with actual URLs
        final_text = replace_descriptors_with_urls(full_text, image_urls)
        
        return jsonify({
            'subtopics': subtopics,
            'content': final_text,
            'images': image_urls
        })
    except Exception as e:
        # Clean up PDF file if it exists
        if 'filepath' in locals():
            try:
                os.remove(filepath)
            except:
                pass
        
        import traceback
        print(f"Error in get_lesson: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'error': f'An error occurred while processing your request: {str(e)}'}), 500

@app.route('/api/compare', methods=['POST'])
def handle_comparison():
    data = request.json
    original_content = data.get('original_content')
    user_summary = data.get('user_summary')
    previous_feedback = data.get('previous_feedback')

    if not original_content or not user_summary:
        return jsonify({'error': 'Both original content and user summary are required'}), 400

    try:
        result = compare_user_summary(original_content, user_summary, previous_feedback)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 