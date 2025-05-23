# ChatSnap

ChatSnap is an AI-powered educational content generator that creates engaging, visual-rich learning materials. It combines a Flask backend with Google's Gemini AI to generate educational content and automatically finds relevant images to enhance the learning experience.

## System Architecture

The project consists of two main components:

1. **Backend (Python/Flask)**

   - Content generation using Google's Gemini AI
   - Image search functionality
   - API endpoints for content generation
   - HTML content serving

2. **Frontend**
   - Responsive web interface
   - Real-time content updates
   - Modern UI with clean design

## Requirements

- Python 3.7+
- Google Gemini API key
- Required Python packages:
  - Flask
  - google-generativeai
  - apify-client

## Setup

1. Clone the repository:

```bash
git clone https://github.com/singlabharat/ChatSnap.git
cd ChatSnap
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up your Google API key:
   - Get your API key from Google AI Studio
   - Set it in the code or as an environment variable

## Running the Application

1. Start the Flask server:

```bash
python server.py
```

2. Open your browser and navigate to:

```
http://localhost:5000
```

The application will now be running and ready to use.

## Usage

1. Enter a topic in the input field
2. Click "Generate" to create content
3. The system will:
   - Generate educational content using Gemini AI
   - Find relevant images
   - Create an interactive HTML page
   - Display the result in your browser

## API Endpoints

- `GET /` - Serves the main application page
- `POST /generate` - Generates content for a given topic
  - Request body: `{"topic": "your topic here"}`
  - Returns: HTML content with embedded images

## Output

The generated content includes:

- Rich educational text with analogies
- Relevant images (when applicable)
- Clean, responsive layout
- Bold text and proper paragraph formatting

## License

MIT License
