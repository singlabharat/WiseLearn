import google.generativeai as genai
import os
import json
from apify import scrape_images
import re
from datetime import datetime

# Configure the API key
# Make sure to set your GOOGLE_API_KEY environment variable
genai.configure(api_key="AIzaSyCdDcfNJFkJMM8OEE_VZOQJwUMg_gmIA3s")

# Set up the model
generation_config = {
    "temperature": 0.7,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 9000,
}

safety_settings = [
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
]

model = genai.GenerativeModel(model_name="gemini-1.5-flash-latest",
                              generation_config=generation_config,
                              safety_settings=safety_settings)

def extract_image_descriptor(text):
    """Extract the image descriptor from the Gemini response."""
    start_marker = "[image_descriptor_start]"
    end_marker = "[image_descriptor_end]"
    
    start_idx = text.find(start_marker)
    end_idx = text.find(end_marker)
    
    if start_idx != -1 and end_idx != -1:
        descriptor = text[start_idx + len(start_marker):end_idx].strip()
        return descriptor
    return None

def convert_to_html(text):
    """Convert the text to HTML format with proper paragraph tags."""
    # Remove any remaining image descriptors
    start_marker = "[image_descriptor_start]"
    end_marker = "[image_descriptor_end]"
    while start_marker in text and end_marker in text:
        start_idx = text.find(start_marker)
        end_idx = text.find(end_marker) + len(end_marker)
        text = text[:start_idx].strip() + text[end_idx:].strip()
    
    # Split into paragraphs
    paragraphs = text.split('\n\n')
    html_content = []
    
    for para in paragraphs:
        if para.strip():
            # Check for image tags
            if '[Image:' in para:
                url = re.search(r'\[Image: (.*?)\]', para)
                if url:
                    html_content.append(f'<img src="{url.group(1)}" alt="Topic illustration">')
            else:
                # Handle normal paragraphs, including bold text
                clean_para = para.strip()
                if clean_para:
                    # Convert **text** to <strong>text</strong>
                    clean_para = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', clean_para)
                    html_content.append(f'<p>{clean_para}</p>')
    
    return '\n'.join(html_content)

def teach_topic(topic: str):
    """
    Generates an engaging, analogy-rich lesson on `topic` and creates
    an HTML page with the content and any relevant images.
    """
    prompt = f"""
    You are an expert teacher and visual storyteller.

    ➡️ **Task**  
    Explain the topic below in a lively, analogy-driven way *with depth*.  
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

    Now teach me about **{topic}**.
    """

    try:
        response = model.generate_content(prompt)
        output_text = response.text
        
        image_descriptor = extract_image_descriptor(output_text)
        if image_descriptor:
            print("\nSearching for relevant images...")
            search_terms = [image_descriptor]
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
        
        # Generate the full HTML page
        timestamp = datetime.now().strftime("%B %d, %Y at %I:%M %p")
        html_page = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learning About {topic.title()} - Learning Journey</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
        }}
        img {{
            max-width: 100%;
            height: auto;
            display: block;
            margin: 20px auto;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        p {{
            margin-bottom: 1.2em;
            font-size: 1.1em;
        }}
        strong {{
            color: #2c3e50;
            font-weight: bold;
        }}
        .timestamp {{
            text-align: center;
            color: #666;
            font-size: 0.9em;
            margin-top: 20px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Learning About {topic.title()}</h1>
        {html_content}
        <div class="timestamp">Generated on {timestamp}</div>
    </div>
</body>
</html>"""
        
        # Save the HTML file
        filename = f"learning_{topic.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_page)
            
        print(f"\nHTML file generated successfully: {filename}")
            
    except Exception as e:
        print(f"Error: {e}\nCheck your API key and network connection.")

def list_subtopics(topic: str, depth: str = "briefly"):
    """
    Ask Gemini for an array of sub-topics tailored to the requested depth.

    depth:
        "briefly"  -> 3 sub-topics
        "thorough" -> 7 sub-topics
        "advanced" -> 10 sub-topics
    Returns a Python list of strings.
    """
    depth_map = {"briefly": 3, "thorough": 7, "advanced": 10}
    n = depth_map.get(depth.lower(), 3)   # default to 3 if unknown

    prompt = f"""
    You are a curriculum architect.
    • Task: Break the broad topic **{topic}** into **{n}** logically sequenced sub-topics.
    • Audience: Learners moving from basic to expert understanding.
    • Output rules (very important):
        1. Respond **only** with a valid JSON array of strings.
        2. No numbering, no extra prose, just something like:
           ["Sub-topic A", "Sub-topic B", ...]
    """

    try:
        response = model.generate_content(prompt)
        print(f"Raw API response for subtopics: {response.text}") # To inspect
        
        text_to_parse = response.text.strip()
        
        if text_to_parse.startswith("```json"):
            # Find the first newline after ```json
            first_newline = text_to_parse.find('\n')
            if first_newline != -1:
                text_to_parse = text_to_parse[first_newline+1:]
            else: # Should not happen if format is ```json\n...
                text_to_parse = text_to_parse[len("```json"):]

        if text_to_parse.endswith("```"):
            text_to_parse = text_to_parse[:-3]
            
        text_to_parse = text_to_parse.strip() # Clean any extra whitespace

        subtopics = json.loads(text_to_parse)
        return subtopics
    except Exception as e:
        print(f"Error: {e}")
        return []
    

def generate_content(topic):
    """Generate content for a given topic and return the filename."""
    try:
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
        if image_descriptor:
            print("\nSearching for relevant images...")
            search_terms = [image_descriptor]
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
        
        # Generate the full HTML page
        timestamp = datetime.now().strftime("%B %d, %Y at %I:%M %p")
        html_page = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learning About {topic.title()} - Learning Journey</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
        }}
        img {{
            max-width: 100%;
            height: auto;
            display: block;
            margin: 20px auto;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        p {{
            margin-bottom: 1.2em;
            font-size: 1.1em;
        }}
        strong {{
            color: #2c3e50;
            font-weight: bold;
        }}
        .timestamp {{
            text-align: center;
            color: #666;
            font-size: 0.9em;
            margin-top: 20px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Learning About {topic.title()}</h1>
        {html_content}
        <div class="timestamp">Generated on {timestamp}</div>
    </div>
</body>
</html>"""
        
        # Save the HTML file
        filename = f"learning_{topic.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_page)
            
        return filename
            
    except Exception as e:
        raise Exception(f"Error generating content: {str(e)}")

if __name__ == "__main__":
    # Get user input for the topic
    topic = input("What topic would you like to learn about today? ").strip()
    if not topic:
        print("No topic provided.")
        exit()
        
    print(f"Generating content about {topic}...")
    
    try:
        filename = generate_content(topic)
        print(f"\nHTML file generated successfully: {filename}")
    except Exception as e:
        print(f"Error: {str(e)}\nCheck your API key and network connection.") 