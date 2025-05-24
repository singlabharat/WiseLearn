# ChatSnap Learning

An interactive learning platform powered by Google's Gemini AI that provides detailed lessons on any topic, complete with relevant images and structured content.

## Features

- Interactive topic-based learning
- AI-generated comprehensive lessons
- Relevant images for visual learning
- Structured content with subtopics
- Modern, responsive UI

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up your Google API key:
   ```bash
   # Windows PowerShell
   $env:GOOGLE_API_KEY = "your-api-key-here"
   
   # Windows CMD
   set GOOGLE_API_KEY=your-api-key-here
   ```

4. Run the Flask server:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
ChatSnap/
├── backend/
│   ├── app.py              # Flask application
│   ├── config.py           # Configuration settings
│   ├── gemini_teacher.py   # Gemini AI integration
│   └── requirements.txt    # Python dependencies
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js         # Main React component
        └── index.js       # React entry point
```

## Environment Variables

- `GOOGLE_API_KEY`: Your Google Gemini API key (required)

## Technologies Used

- Backend:
  - Flask
  - Google Gemini AI
  - Flask-CORS

- Frontend:
  - React
  - Material-UI
  - Axios

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 