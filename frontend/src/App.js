import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress, 
  Paper,
  Card,
  CardContent,
  Fade,
  useTheme,
  alpha,
  Divider,
  IconButton,
  Chip,
  Alert,
  Stack
} from '@mui/material';
import { 
  School as SchoolIcon, 
  Lightbulb as LightbulbIcon,
  CompareArrows as CompareArrowsIcon,
  CheckCircleOutline as CheckIcon,
  ErrorOutline as ErrorIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import axios from 'axios';

// Helper function to process text with bold markers
const processBoldText = (text) => {
  if (!text) return [];
  
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove the ** markers and return the text with bold style
      return (
        <Box
          key={index}
          component="span"
          sx={{ 
            fontWeight: 700,
            color: (theme) => theme.palette.text.primary
          }}
        >
          {part.slice(2, -2)}
        </Box>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

function App() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState(null);
  const [userSummary, setUserSummary] = useState('');
  const [comparison, setComparison] = useState(null);
  const [previousFeedback, setPreviousFeedback] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setContent(null);
    setComparison(null);
    setPreviousFeedback(null);
    setUserSummary('');

    try {
      const response = await axios.post('http://localhost:5000/api/teach', { topic });
      setContent(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while fetching the content.');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarySubmit = async () => {
    if (!userSummary.trim()) return;
    
    setSummaryLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/compare', {
        original_content: content.content,
        user_summary: userSummary,
        previous_feedback: previousFeedback
      });
      setComparison(response.data);
      setPreviousFeedback(response.data);  // Store the feedback for next comparison
    } catch (err) {
      setError('Failed to compare summaries. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const renderContent = () => {
    if (!content) return null;

    const paragraphs = content.content.split('\n').filter(p => p.trim());
    
    return (
      <Fade in={true} timeout={1000}>
        <Box mt={4}>
          <Card 
            elevation={3}
            sx={{
              mb: 4,
              background: alpha(theme.palette.primary.main, 0.03),
              borderRadius: 2
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <LightbulbIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h5" component="h2" color="primary">
                  Key Topics
                </Typography>
              </Box>
              <Box 
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  mb: 2
                }}
              >
                {content.subtopics.map((subtopic, index) => (
                  <Chip
                    key={index}
                    label={subtopic}
                    sx={{
                      background: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          <Typography 
            variant="h5" 
            gutterBottom
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 500,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              '&::after': {
                content: '""',
                flex: 1,
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                marginLeft: 2
              }
            }}
          >
            Detailed Lesson
          </Typography>

          {paragraphs.map((paragraph, index) => {
            if (content.images.includes(paragraph.trim())) {
              return (
                <Card 
                  key={index} 
                  sx={{ 
                    my: 3,
                    overflow: 'hidden',
                    borderRadius: 2,
                    boxShadow: theme.shadows[2]
                  }}
                >
                  <Box 
                    component="img"
                    src={paragraph.trim()}
                    alt="Topic illustration"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.02)'
                      }
                    }}
                  />
                </Card>
              );
            }
            return (
              <Typography 
                key={index} 
                paragraph
                component="div"
                sx={{
                  color: theme.palette.text.secondary,
                  lineHeight: 1.7,
                  fontSize: '1.1rem',
                  textAlign: 'justify'
                }}
              >
                {processBoldText(paragraph)}
              </Typography>
            );
          })}

          {/* Understanding Check Section */}
          <Card 
            elevation={3}
            sx={{ 
              mt: 6,
              mb: 4,
              borderRadius: 2,
              background: `linear-gradient(45deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <PsychologyIcon 
                  sx={{ 
                    fontSize: 40,
                    color: theme.palette.secondary.main
                  }} 
                />
                <Box>
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{
                      color: theme.palette.secondary.main,
                      fontWeight: 600,
                      mb: 0.5
                    }}
                  >
                    Test Your Understanding
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Summarize the key points in your own words to check your understanding
                  </Typography>
                </Box>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Write your summary here..."
                value={userSummary}
                onChange={(e) => setUserSummary(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    '&:hover fieldset': {
                      borderColor: alpha(theme.palette.secondary.main, 0.5),
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.secondary.main,
                    }
                  }
                }}
              />
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={!userSummary.trim() || summaryLoading}
                  onClick={handleSummarySubmit}
                  startIcon={<CompareArrowsIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}
                >
                  {summaryLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Check Understanding'
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Comparison Results */}
          {comparison && (
            <Fade in={true} timeout={800}>
              <Card 
                elevation={3}
                sx={{ 
                  mb: 4,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <CardContent>
                  <Stack spacing={3}>
                    {/* Well Understood Points */}
                    {comparison.correct_points.length > 0 && (
                      <Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: theme.palette.success.main,
                            fontWeight: 600,
                            mb: 2
                          }}
                        >
                          <CheckIcon /> Well Understood Concepts
                        </Typography>
                        <Stack spacing={1}>
                          {comparison.correct_points.map((point, index) => (
                            <Alert 
                              key={index}
                              severity="success"
                              icon={<CheckIcon />}
                              sx={{ 
                                backgroundColor: alpha(theme.palette.success.main, 0.05),
                                '& .MuiAlert-message': {
                                  color: theme.palette.success.dark
                                }
                              }}
                            >
                              {point}
                            </Alert>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Points to Review */}
                    {comparison.missing_points.length > 0 && (
                      <Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: theme.palette.warning.main,
                            fontWeight: 600,
                            mb: 2
                          }}
                        >
                          <ErrorIcon /> Points to Review
                        </Typography>
                        <Stack spacing={1}>
                          {comparison.missing_points.map((point, index) => (
                            <Alert 
                              key={index}
                              severity="warning"
                              icon={<ErrorIcon />}
                              sx={{ 
                                backgroundColor: alpha(theme.palette.warning.main, 0.05),
                                '& .MuiAlert-message': {
                                  color: theme.palette.warning.dark
                                }
                              }}
                            >
                              {point}
                            </Alert>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          )}
        </Box>
      </Fade>
    );
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        py: 4
      }}
    >
      <Container maxWidth="md">
        <Box 
          sx={{
            textAlign: 'center',
            mb: 6
          }}
        >
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            mb={2}
          >
            <SchoolIcon 
              sx={{ 
                fontSize: 40, 
                color: theme.palette.primary.main,
                mr: 2
              }} 
            />
            <Typography 
              variant="h3" 
              component="h1"
              sx={{
                fontWeight: 600,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              ChatSnap Learning
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            color="textSecondary"
            sx={{ 
              maxWidth: 600, 
              mx: 'auto',
              mb: 4,
              fontWeight: 300
            }}
          >
            Explore any topic with AI-powered interactive lessons
          </Typography>
        </Box>
        
        <Paper 
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            background: '#fff',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)'
            }
          }}
        >
          <Box p={4}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="What would you like to learn about?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                variant="outlined"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    '&.Mui-focused fieldset': {
                      borderWidth: 2
                    }
                  }
                }}
              />
              <Box mt={3} display="flex" justifyContent="center">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!topic || loading}
                  size="large"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Start Learning'
                  )}
                </Button>
              </Box>
            </form>

            {error && (
              <Typography 
                color="error" 
                mt={2} 
                align="center"
                sx={{
                  background: alpha(theme.palette.error.main, 0.1),
                  borderRadius: 1,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {error}
              </Typography>
            )}
          </Box>
        </Paper>

        {renderContent()}
      </Container>
    </Box>
  );
}

export default App; 