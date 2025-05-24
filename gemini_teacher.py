import google.generativeai as genai
import os
import json
from apify_client import ApifyClient
from datetime import datetime
import re
from typing import List, Union
import html
from pathlib import Path
import wave
# Configure the API key
# Make sure to set your GOOGLE_API_KEY environment variable
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

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

# def teach_topic(topic: str):
#     """
#     Uses the Gemini API to generate an explanation for a given topic.
#     """
#     prompt = f"""
#     You are an expert teacher and storyteller.  
#     Explain the topic below in a way that is **thorough yet lively**, using vivid real-world analogies and examples.  
#     **Depth:** Cover both fundamentals and advanced nuances—don't oversimplify.  
#     **Engagement:** Keep paragraphs short, conversational, and analogy-rich so a sleepy learner stays hooked.  
#     **Structure:** 
#     1. Hook me with a quick, relatable analogy.  
#     2. Build the core concepts step-by-step.  
#     3. Dive into deeper insights and common pitfalls.  
#     4. Finish with a concise recap and 2–3 reflective questions I can explore next.  
    
#     Now teach me about **{topic}**.
#     """
#     try:
#         response = model.generate_content(prompt)
#         print(f"Gemini says:\n{response.text}")
#     except Exception as e:
#         print(f"An error occurred: {e}")
#         print("Please ensure your API key is set correctly and you have an internet connection.")

def scrape_images(search_queries):
    # Initialize the ApifyClient with your API token
    client = ApifyClient("apify_api_2jl6c2awATe6fMg94mKpo0hMfvVxdT24SlaY")

    try:
        # Prepare the Actor input
        run_input = {
            "queries": search_queries,
            "maxResultsPerQuery": 1,
            "saveImages": False,  # We'll just get the image URLs
            "customDataFunction": """async ({ input, $, request, response, html }) => {
                return {
                    url: request.url,
                    loadedUrl: response.url,
                    timestamp: new Date().toISOString(),
                };
            }""",
        }

        print(f"Starting image search for queries: {search_queries}")
        
        # Run the Google Images Scraper actor
        run = client.actor("tnudF2IxzORPhg4r8").call(run_input=run_input)

        # Create a directory for storing results if it doesn't exist
        os.makedirs("results", exist_ok=True)
        
        # Prepare results storage
        results = []
        
        # Fetch and process results
        print("Processing results...")
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            results.append(item)
            # Print both the image URL and title if available
            image_url = item.get('imageUrl', 'No image URL found')
            
            if image_url != 'No image URL found':
                # Regex to find common image extensions and capture the URL up to that point
                match = re.search(r"(.*?(\.jpe?g|\.png|\.gif|\.bmp|\.webp|\.svg))", image_url, re.IGNORECASE)
                if match:
                    image_url = match.group(1)  # Use the first captured group which is the URL up to and including the extension
            
            title = item.get('title', 'No title available')
            print(f"Found image: {image_url}")
            print(f"Title: {title}\n")


        # Save results to a JSON file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"results/image_results_{timestamp}.json"
        
        with open(output_file, "w") as f:
            json.dump(results, f, indent=2)
            
        print(f"\nSearch completed! Found {len(results)} images.")
        print(f"Results saved to: {output_file}")
        

        return image_url

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return None

def teach_topic(topic: str) -> str:
    """
    Generates an engaging, analogy-rich lesson on `topic` and—where it genuinely
    boosts clarity—inserts an image description between the markers
    [image_descriptor_start] … [image_descriptor_end].

    Your downstream code can scan for those markers and fetch/overlay
    suitable images automatically.
    """
    prompt = f"""
    You are an expert teacher and visual storyteller.

    ➡️ **Task**  
    Explain the topic below in a lively, analogy-driven way *with depth*.  
    Insert an image descriptor **only** where a picture will materially enhance
    understanding (e.g., a diagram, chart, or photo that clarifies the point). But
    you must use that image to explain the topic and weave it into the explanation.
    Wrap that descriptor precisely like this:

    [image_descriptor_start]
    A URL search string for an image that will help explain the topic. 
    This description should be only 5 words or less. 
    Make it an easy diagram to be found and not something that is niche or super specific. 
    [image_descriptor_end]

    Do **not** supply links or any other text inside the brackets.
    Skip the bracket block entirely if an image would not add value.

    You can also use multiple images to explain the topic better.

    ➡️ **Structure**  
    1. Open with a hook-analogy.  
    2. Build the core concepts step-by-step.  
    3. Explore deeper insights + common pitfalls.  

    Now teach me about **{topic}**.
    """

    try:
        response = model.generate_content(prompt)
        return response.text
        #print("Gemini says:\n", response.text)
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
    
def extract_image_captions(text: str) -> List[str]:
    """
    Return a list of image captions found between
    [image_descriptor_start] … [image_descriptor_end] blocks.
    """
    pattern = re.compile(
        r"\[image_descriptor_start\](.*?)\[image_descriptor_end\]",
        flags=re.DOTALL | re.IGNORECASE,
    )
    # Grab the inner text, strip whitespace on each caption
    return [cap.strip() for cap in pattern.findall(text)]

def replace_descriptors_with_urls(text: str, urls: List[str]) -> str:
    """
    Replace every [image_descriptor_start] … [image_descriptor_end] block
    with the corresponding URL, wrapped in blank lines for readability.

    Parameters
    ----------
    text : str
        The original text that contains image-descriptor blocks.
    urls : List[str]
        URLs to insert, in the exact order the descriptors appear.

    Returns
    -------
    str
        The text with descriptors replaced by newline-padded URLs.
    """
    url_iter = iter(urls)

    def _repl(_: re.Match) -> str:
        try:
            url = next(url_iter)
            # Surround each URL with a leading and trailing newline.
            return f"\n{url}\n"
        except StopIteration:
            # If we run out of URLs, remove the descriptor block entirely.
            return ""

    pattern = re.compile(
        r"\[image_descriptor_start\](.*?)\[image_descriptor_end\]",
        flags=re.DOTALL | re.IGNORECASE,
    )

    new_text = pattern.sub(_repl, text)

    # (Optional) If you still want to verify that every URL was consumed:
    # if next(url_iter, None) is not None:
    #     raise ValueError("More URLs provided than descriptors in text")

    return new_text

def write_html_from_story(
    story: str,
    outfile: Union[str, Path] = "solar_system.html",
    title: str = "Solar-System Walk-Through",
) -> Path:
    URL_RE = re.compile(r'https?://\S+', re.I)
    """
    Convert `story` (the plain-text narrative you showed) into a minimal HTML file.

    Lines that *contain only* an image URL are embedded as <img src="...">.
    Everything else becomes a <p> block, with **bold** kept as <strong>.
    Returns the Path to the file written.
    """
    outfile = Path(outfile)

    def convert_line(line: str) -> str:
        stripped = line.strip()
        if not stripped:
            return ""  # blank line => slight vertical gap
        # Pure image line?
        if URL_RE.fullmatch(stripped):
            return f'<img src="{stripped}" alt="illustration" style="max-width:100%;">'
        # Otherwise treat as prose: escape HTML, then convert **bold**
        escaped = html.escape(stripped)
        escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
        return f"<p>{escaped}</p>"

    body_html = "\n".join(convert_line(l) for l in story.splitlines())

    html_doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{html.escape(title)}</title>
  <style>
    body {{ font-family: sans-serif; line-height: 1.45; max-width: 50rem; margin: 2rem auto; }}
    img  {{ display: block; margin: 1rem auto; }}
  </style>
</head>
<body>
{body_html}
</body>
</html>"""

    outfile.write_text(html_doc, encoding="utf-8")
    return outfile

def gemini_tts(text: str, outfile: str = "speech.wav",
               model_id: str = "gemini-2.0-flash-exp") -> str:
    """
    Turn `text` into a spoken-word WAV file via Gemini's TTS capability.

    Parameters
    ----------
    text : str
        The text you want Gemini to read aloud.
    outfile : str, default "speech.wav"
        Where to save the resulting audio (16-bit, 24 kHz, mono WAV).
    model_id : str, default "gemini-2.0-flash-exp"
        Any model that supports AUDIO response (e.g. gemini-2.5-flash).

    Returns
    -------
    str
        Path to the created WAV file.

    Environment
    -----------
    Requires env var `GEMINI_API_KEY` or pass `api_key=` when you
    instantiate `genai.Client` below.
    """
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

    response = client.models.generate_content(
        model=model_id,
        contents=text,
        generation_config={"response_modalities": ["AUDIO"]},
    )

    audio_bytes = response.candidates[0].data  # raw PCM (mono, 24 kHz, 16-bit)

    with wave.open(outfile, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)        # 2 bytes = 16 bits
        wav.setframerate(24_000)
        wav.writeframes(audio_bytes)

    return os.path.abspath(outfile)

if __name__ == "__main__":
    # Example usage:
    # You can replace "Quantum Physics" with any topic you want to learn about.
    # Or, you can modify this to take input from the command line.

    # search_terms = ["cute cats", "puppies"]
    # results = scrape_images(search_terms)
    # print(results)
    # user_topic = input("What topic would you like to learn about today? ")
    # if user_topic:
    #     teach_topic(user_topic)

    # else:
    #     print("No topic provided.")
    user_topic = input("What topic would you like to learn about today? ")
    subtopics = list_subtopics(user_topic, "briefly")
    print(f"Subtopics: {subtopics}")
    text = ""
    for subtopic in subtopics:
        print(f"Subtopic: {subtopic}")
        text += "\n" + teach_topic(subtopic)
    #print(text)
    print(extract_image_captions(text))
    image_urls = []
    for caption in extract_image_captions(text):
        image_urls.append(scrape_images([caption]))
    print(image_urls)
    text = replace_descriptors_with_urls(text, image_urls)
    print(text)
    write_html_from_story(text)

   
    # path = gemini_tts("Hello from Gemini!")
    # print(f"Saved TTS audio → {path}")