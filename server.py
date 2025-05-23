from flask import Flask, request, jsonify, send_from_directory
import os
from content_generator import generate_content, model, extract_image_descriptor, convert_to_html
from datetime import datetime

app = Flask(__name__)

# Serve static files
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        topic = data.get('topic')
        
        if not topic:
            return jsonify({'error': 'No topic provided'}), 400
        
        # Generate the content
        response = model.generate_content(f"""
        You are an expert teacher and visual storyteller.

        ➡️ **Task**  
        Explain {topic} in a lively, analogy-driven way *with depth*.  
        Insert an image descriptor **only** where a picture will materially enhance
        understanding (e.g., a diagram, chart, or photo that clarifies the point).
        Wrap that descriptor precisely like this:

        [image_descriptor_start]
        A URL search string for an image that will help explain the topic.
        [image_descriptor_end]

        Do **not** supply links or any other text inside the brackets.
        Skip the bracket block entirely if an image would not add value.

        ➡️ **Structure**  
        1. Open with a hook-analogy.  
        2. Build the core concepts step-by-step.  
        3. Explore deeper insights + common pitfalls.  
        4. Conclude with a crisp recap and 2–3 reflective questions.
        """)
        
        output_text = response.text
        
        # Extract image descriptor and search for image
        image_descriptor = extract_image_descriptor(output_text)
        image_url = None
        if image_descriptor:
            print("\nSearching for relevant images...")
            search_terms = [image_descriptor]
            from apify import scrape_images
            image_results = scrape_images(search_terms)
            
            if image_results and len(image_results) > 0:
                image_url = image_results[0].get('imageUrl', '')
                if image_url:
                    start_marker = "[image_descriptor_start]"
                    end_marker = "[image_descriptor_end]"
                    start_idx = output_text.find(start_marker)
                    end_idx = output_text.find(end_marker) + len(end_marker)
                    
                    output_text = (
                        output_text[:start_idx] + 
                        f"\n[Image: {image_url}]\n" +
                        output_text[end_idx:]
                    )
        
        # Convert the text to HTML
        html_content = convert_to_html(output_text)
        
        return jsonify({
            'success': True,
            'content': html_content,
            'topic': topic,
            'timestamp': datetime.now().strftime("%B %d, %Y at %I:%M %p")
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 