from flask import Flask, request, jsonify
from flask_cors import CORS
from gemini_teacher import (
    teach_topic, 
    list_subtopics, 
    extract_image_captions, 
    scrape_images, 
    replace_descriptors_with_urls,
    compare_user_summary
)
import google.generativeai as genai
from config import GOOGLE_API_KEY

# Configure Google Gemini API
genai.configure(api_key=GOOGLE_API_KEY)

app = Flask(__name__)
CORS(app)

@app.route('/api/teach', methods=['POST'])
def get_lesson():
    data = request.json
    topic = data.get('topic')
    if not topic:
        return jsonify({'error': 'No topic provided'}), 400
    
    try:
        # Get subtopics
        subtopics = list_subtopics(topic, "briefly")
        
        # Get content for each subtopic
        full_text = ""
        for subtopic in subtopics:
            full_text += "\n" + teach_topic(subtopic)
        
        # Extract and process images
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
        return jsonify({'error': str(e)}), 500

@app.route('/api/compare', methods=['POST'])
def handle_comparison():
    data = request.json
    original_content = data.get('original_content')
    user_summary = data.get('user_summary')
    previous_feedback = data.get('previous_feedback')  # Get previous feedback if it exists

    if not original_content or not user_summary:
        return jsonify({'error': 'Both original content and user summary are required'}), 400

    try:
        # Pass previous feedback to the comparison function
        result = compare_user_summary(original_content, user_summary, previous_feedback)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 