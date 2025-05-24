import React, { useState } from 'react';
import { Container, Box, TextField, Button, Typography, CircularProgress, Paper } from '@mui/material';
import axios from 'axios';

function App() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setContent(null);

    try {
      const response = await axios.post('http://localhost:5000/api/teach', { topic });
      setContent(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while fetching the content.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!content) return null;

    const paragraphs = content.content.split('\n').filter(p => p.trim());
    
    return (
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Subtopics:
        </Typography>
        <Box mb={3}>
          {content.subtopics.map((subtopic, index) => (
            <Typography key={index} variant="body1">
              • {subtopic}
            </Typography>
          ))}
        </Box>
        
        <Typography variant="h5" gutterBottom>
          Lesson Content:
        </Typography>
        {paragraphs.map((paragraph, index) => {
          // Check if the paragraph is an image URL
          if (content.images.includes(paragraph.trim())) {
            return (
              <Box key={index} my={2} display="flex" justifyContent="center">
                <img 
                  src={paragraph.trim()} 
                  alt="Topic illustration" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>
            );
          }
          return (
            <Typography key={index} paragraph>
              {paragraph}
            </Typography>
          );
        })}
      </Box>
    );
  };

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          ChatSnap Learning
        </Typography>
        
        <Paper elevation={3}>
          <Box p={3}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="What would you like to learn about?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                variant="outlined"
                disabled={loading}
              />
              <Box mt={2} display="flex" justifyContent="center">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!topic || loading}
                  size="large"
                >
                  {loading ? <CircularProgress size={24} /> : 'Teach Me'}
                </Button>
              </Box>
            </form>

            {error && (
              <Typography color="error" mt={2} align="center">
                {error}
              </Typography>
            )}

            {renderContent()}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default App; 