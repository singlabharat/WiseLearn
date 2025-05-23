# ChatSnap

ChatSnap is an AI-powered educational content generator that creates engaging, visual-rich learning materials. It uses Google's Gemini AI to generate educational content and automatically finds relevant images to enhance the learning experience.

## Features

- Generate in-depth educational content on any topic
- Automatic image search and integration
- HTML output with responsive design
- Rich text formatting with support for bold text and paragraphs
- Clean, modern UI for generated content

## Requirements

- Python 3.7+
- Google Gemini API key
- Required Python packages (see requirements.txt)

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

## Usage

Run the script:
```bash
python content_generator.py
```

The program will:
1. Prompt you for a topic
2. Generate educational content using Gemini AI
3. Find relevant images
4. Create an HTML file with the formatted content

## Output

The generated content will be saved as an HTML file in the current directory with the naming format:
`learning_[topic]_[timestamp].html`

## License

MIT License 