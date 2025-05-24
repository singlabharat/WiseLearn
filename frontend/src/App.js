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
  Stack,
  Grid,
  CardMedia,
  CardActions,
  Collapse,
  Tabs,
  Tab
} from '@mui/material';
import { 
  School as SchoolIcon, 
  Lightbulb as LightbulbIcon,
  CompareArrows as CompareArrowsIcon,
  CheckCircleOutline as CheckIcon,
  ErrorOutline as ErrorIcon,
  Psychology as PsychologyIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  MenuBook as MenuBookIcon,
  QuestionAnswer as QuestionAnswerIcon
} from '@mui/icons-material';
import axios from 'axios';

function App() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState(null);
  const [userSummary, setUserSummary] = useState('');
  const [comparison, setComparison] = useState(null);
  const [previousFeedback, setPreviousFeedback] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [showVideos, setShowVideos] = useState(false);
  const [learningPreference, setLearningPreference] = useState('reading');
  const [activeTab, setActiveTab] = useState('content');
  const theme = useTheme();

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
              color: theme.palette.text.primary
            }}
          >
            {part.slice(2, -2)}
          </Box>
        );
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setContent(null);
    setComparison(null);
    setPreviousFeedback(null);
    setUserSummary('');

    // Validate that either topic or PDF is provided
    if (!topic && !pdfFile) {
      setError('Please either enter a topic or upload a PDF file.');
      setLoading(false);
      return;
    }

    try {
      let response;
      if (pdfFile) {
        // If PDF file is provided, use FormData
        const formData = new FormData();
        formData.append('topic', topic || ''); // Send empty string if no topic
        formData.append('pdf_file', pdfFile);
        formData.append('learning_preference', learningPreference);
        
        response = await axios.post('http://localhost:5000/api/teach', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Regular topic-only request
        response = await axios.post('http://localhost:5000/api/teach', { 
          topic,
          learning_preference: learningPreference 
        });
      }
      setContent(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while fetching the content.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else if (file) {
      setError('Please upload a PDF file.');
      e.target.value = null;
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

  const renderContentTab = () => {
    if (!content) return null;

    // If video learning is selected and videos are available
    if (learningPreference === 'video' && content.videos && content.videos.length > 0) {
      const bestVideo = content.videos.reduce((prev, current) => 
        (prev.viewCount > current.viewCount) ? prev : current
      );

      return (
        <Box mt={2}>
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
                <iframe
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                  src={bestVideo.url.replace('watch?v=', 'embed/')}
                  title={bestVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Box>
              <Typography variant="h6" sx={{ mt: 2 }}>
                {bestVideo.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {bestVideo.viewCount.toLocaleString()} views • {bestVideo.duration}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      );
    }

    // For reading preference, show the original content
    const paragraphs = content.content.split('\n').filter(p => p.trim());
    
    return (
      <Box mt={2}>
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
              sx={{
                color: theme.palette.text.primary,
                lineHeight: 1.8,
                fontSize: '1.1rem',
                textAlign: 'justify'
              }}
            >
              {processBoldText(paragraph)}
            </Typography>
          );
        })}
      </Box>
    );
  };

  const renderSummaryTab = () => {
    return (
      <Box mt={2}>
        <Card 
          elevation={3}
          sx={{ 
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
                mt: 3,
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
    );
  };

  const renderContent = () => {
    if (!content) return null;

    return (
      <Fade in={true} timeout={1000}>
        <Box mt={4}>
          {/* Key Topics Card */}
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

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1rem',
                  minHeight: 48,
                }
              }}
            >
              <Tab 
                icon={learningPreference === 'reading' ? <MenuBookIcon /> : <PlayCircleOutlineIcon />}
                iconPosition="start"
                label={learningPreference === 'reading' ? "Reading" : "Video"}
                value="content"
              />
              <Tab 
                icon={<QuestionAnswerIcon />}
                iconPosition="start"
                label="Summary"
                value="summary"
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          {activeTab === 'content' && renderContentTab()}
          {activeTab === 'summary' && renderSummaryTab()}
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
                label={pdfFile ? "What aspect of the PDF would you like to focus on? (Optional)" : "What would you like to learn about?"}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                variant="outlined"
                disabled={loading}
                required={!pdfFile}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    '&.Mui-focused fieldset': {
                      borderWidth: 2
                    }
                  }
                }}
              />
              
              <Box mb={3}>
                <input
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  id="pdf-file-input"
                  type="file"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <label htmlFor="pdf-file-input">
                  <Button
                    component="span"
                    variant="outlined"
                    color="primary"
                    disabled={loading}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                  >
                    {pdfFile ? pdfFile.name : 'Upload PDF (Optional)'}
                  </Button>
                </label>
                {pdfFile && (
                  <Button
                    size="small"
                    onClick={() => setPdfFile(null)}
                    sx={{ ml: 1 }}
                  >
                    Clear
                  </Button>
                )}
              </Box>

              {/* Add Learning Preference Selection */}
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                  How would you like to learn?
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant={learningPreference === 'reading' ? 'contained' : 'outlined'}
                    onClick={() => setLearningPreference('reading')}
                    startIcon={<MenuBookIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3
                    }}
                  >
                    Reading
                  </Button>
                  <Button
                    variant={learningPreference === 'video' ? 'contained' : 'outlined'}
                    onClick={() => setLearningPreference('video')}
                    startIcon={<PlayCircleOutlineIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3
                    }}
                  >
                    Video
                  </Button>
                </Stack>
              </Box>

              <Box mt={3} display="flex" justifyContent="center">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={(!topic && !pdfFile) || loading}
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