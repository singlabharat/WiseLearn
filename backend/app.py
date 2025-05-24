from flask import Flask, request, jsonify
from flask_cors import CORS
from gemini_teacher import teach_topic, list_subtopics, extract_image_captions, scrape_images, replace_descriptors_with_urls
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

if __name__ == '__main__':
    app.run(debug=True) 