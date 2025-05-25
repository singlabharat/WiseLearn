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
import Dashboard from './Dashboard'; // Import the Dashboard component

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' or 'chat'
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

  // Function to navigate to the chat page
  const navigateToChat = () => {
    setCurrentPage('chat');
  };

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
    if (!content) return null;
    return (
      <Box mt={2}>
        <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
          <PsychologyIcon sx={{ mr: 1 }} /> Your Summary & Feedback
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          placeholder="Write your summary of the content here..."
          value={userSummary}
          onChange={(e) => setUserSummary(e.target.value)}
          sx={{
            mb: 2,
            mt: 1,
            bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: theme.palette.grey[400],
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.light,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        />
        <Button 
          variant="contained" 
          onClick={handleSummarySubmit} 
          disabled={summaryLoading || !userSummary.trim()}
          startIcon={summaryLoading ? <CircularProgress size={20} color="inherit" /> : <CompareArrowsIcon />}
          sx={{ 
            bgcolor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
            '&:hover': {
              bgcolor: theme.palette.secondary.dark
            }
          }}
        >
          {summaryLoading ? 'Analyzing...' : 'Compare Summary'}
        </Button>

        {comparison && (
          <Fade in={true} timeout={500}>
            <Card sx={{ mt: 3, borderRadius: 2, boxShadow: theme.shadows[3] }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>Comparison Results:</Typography>
                {comparison.correct_points && comparison.correct_points.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle1" sx={{ color: theme.palette.success.dark, display: 'flex', alignItems: 'center'}}>
                      <CheckIcon sx={{ mr: 0.5, color: theme.palette.success.main }} /> Well Understood:
                    </Typography>
                    <Stack spacing={0.5} sx={{ pl: 2}}>
                      {comparison.correct_points.map((point, index) => (
                        <Chip 
                          key={index} 
                          label={point} 
                          size="small"
                          sx={{ 
                            bgcolor: alpha(theme.palette.success.light, 0.3),
                            color: theme.palette.success.dark,
                            justifyContent: 'flex-start',
                            paddingLeft: '8px',
                            height: 'auto',
                            '& .MuiChip-label': {
                              whiteSpace: 'normal',
                              textOverflow: 'clip'
                            }
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
                {comparison.missing_points && comparison.missing_points.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: theme.palette.error.dark, display: 'flex', alignItems: 'center' }}>
                      <ErrorIcon sx={{ mr: 0.5, color: theme.palette.error.main }} /> Areas to Improve:
                    </Typography>
                    <Stack spacing={0.5} sx={{ pl: 2}}>
                      {comparison.missing_points.map((point, index) => (
                        <Chip 
                          key={index} 
                          label={point} 
                          size="small"
                          sx={{ 
                            bgcolor: alpha(theme.palette.error.light, 0.3),
                            color: theme.palette.error.dark,
                            justifyContent: 'flex-start',
                            paddingLeft: '8px',
                            height: 'auto',
                            '& .MuiChip-label': {
                              whiteSpace: 'normal',
                              textOverflow: 'clip'
                            }
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
                {comparison.correct_points?.length === 2 && comparison.correct_points[0].startsWith("Excellent work!") && (
                     <Alert severity="success" sx={{ mt: 2 }}>
                        Congratulations! You've mastered this section. Feel free to explore another topic or dive deeper!
                    </Alert>
                )}
                 {comparison.correct_points?.length === 2 && comparison.correct_points[0].startsWith("Excellent understanding!") && (
                     <Alert severity="success" sx={{ mt: 2 }}>
                        Great job! Your summary is complete and accurate. Ready for the next challenge?
                    </Alert>
                )}
              </CardContent>
            </Card>
          </Fade>
        )}
      </Box>
    );
  };

  const renderVideoTab = () => {
    if (!content || !content.videos || content.videos.length === 0) return null;

    return (
      <Box mt={2}>
        <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
            <PlayArrowIcon sx={{ mr: 1 }} /> Recommended Videos
        </Typography>
        <Grid container spacing={2}>
          {content.videos.map((video, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Fade in={true} timeout={500 + index * 200}>
                <Card 
                  elevation={2} 
                  sx={{
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[6]
                    }
                  }}
                >
                  {video.thumbnailUrl && (
                    <CardMedia
                      component="img"
                      image={video.thumbnailUrl}
                      alt={video.title}
                      sx={{ height: 180, objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {video.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {video.duration} • {video.viewCount ? video.viewCount.toLocaleString() : 'N/A'} views
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {video.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-start', p: 2, pt: 0}}>
                    <Button 
                      size="small" 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      startIcon={<PlayCircleOutlineIcon />}
                    >
                      Watch Video
                    </Button>
                  </CardActions>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderTabs = () => {
    if (!content) return null;
    return (
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(event, newValue) => setActiveTab(newValue)} 
          aria-label="content tabs"
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab 
            label="Learning Content" 
            value="content" 
            icon={<MenuBookIcon />} 
            iconPosition="start"
            sx={{ fontWeight: activeTab === 'content' ? 'bold' : 'normal' }}
          />
          <Tab 
            label="Summarize & Compare" 
            value="summary" 
            icon={<QuestionAnswerIcon />} 
            iconPosition="start"
            sx={{ fontWeight: activeTab === 'summary' ? 'bold' : 'normal' }}
            disabled={learningPreference === 'video' || !content || !content.content} 
          />
          {content.videos && content.videos.length > 0 && (
            <Tab 
              label="Watch Videos" 
              value="video"
              icon={<PlayArrowIcon />}
              iconPosition="start"
              sx={{ fontWeight: activeTab === 'video' ? 'bold' : 'normal' }}
            />
          )}
        </Tabs>
      </Box>
    );
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'content':
        return renderContentTab();
      case 'summary':
        return renderSummaryTab();
      case 'video':
        return renderVideoTab();
      default:
        return renderContentTab();
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading your personalized lesson...</Typography>
        </Box>
      );
    }

    if (error && !content) { // Only show main error if no content is loaded yet
      return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    if (!content && !loading && !error) { // Initial state, before any search
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <SchoolIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h5" color="text.secondary">
                    Ready to learn something new?
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Enter a topic or upload a PDF to get started.
                </Typography>
            </Box>
        );
    }

    if (content) {
      return (
        <Fade in={true} timeout={800}>
          <Box>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                color: theme.palette.primary.dark,
                fontWeight: 'bold',
                textAlign: 'center',
                mb: 3
              }}
            >
              {content.main_topic || topic}{pdfFile ? ` (from ${pdfFile.name})` : ''}
            </Typography>

            {renderTabs()}
            {renderActiveTabContent()}

            {content.audio_path && (
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                 <Typography variant="subtitle1" sx={{ mb:1, color: theme.palette.text.secondary}}>Listen to this lesson:</Typography>
                <audio controls src={`http://localhost:5000${content.audio_path}`} style={{ width: '100%', maxWidth: '500px'}}>
                  Your browser does not support the audio element.
                </audio>
              </Box>
            )}
          </Box>
        </Fade>
      );
    }
    return null; // Should not be reached if logic is correct
  };

  // Conditional rendering based on currentPage
  if (currentPage === 'dashboard') {
    return <Dashboard onNavigateToChat={navigateToChat} />;
  }

  // Existing chat page content (now part of the 'chat' page view)
  return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: alpha(theme.palette.background.default, 0.95) }}>
      <Paper 
        elevation={5} 
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          boxShadow: `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold', 
              color: theme.palette.primary.main,
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <SchoolIcon sx={{ fontSize: '2.8rem', mr: 1.5, color: theme.palette.secondary.main }} /> 
            Personalized Learning Studio
          </Typography>
          <Button 
            variant="outlined"
            onClick={() => setCurrentPage('dashboard')}
            sx={{ 
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            Back to Dashboard
          </Button>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={pdfFile ? 6 : 8}>
              <TextField
                fullWidth
                label="Enter a topic to learn..."
                variant="outlined"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={pdfFile ? 3 : 2}>
                <Button 
                    fullWidth 
                    component="label" 
                    variant="outlined"
                    sx={{ height: '56px', borderRadius: '8px' }}
                >
                    {pdfFile ? pdfFile.name : "Or Upload PDF"}
                    <input type="file" hidden onChange={handleFileChange} accept=".pdf" />
                </Button>
            </Grid>
            {pdfFile && (
                 <Grid item xs={12} md={3}>
                    <Button 
                        fullWidth 
                        variant="text" 
                        onClick={() => {setPdfFile(null); document.querySelector('input[type="file"]').value = ''}}
                        sx={{ height: '56px', borderRadius: '8px' }}
                    >
                        Clear PDF
                    </Button>
                </Grid>
            )}
             <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                label="Learn by"
                value={learningPreference}
                onChange={(e) => setLearningPreference(e.target.value)}
                SelectProps={{ native: true }}
                variant="outlined"
                sx={{ height: '56px', borderRadius: '8px', '& .MuiSelect-select': {height: '100% !important', paddingTop:0, paddingBottom:0} }}
              >
                <option value="reading">Reading</option>
                <option value="video">Video</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                disabled={loading || (!topic.trim() && !pdfFile)}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LightbulbIcon />}
                sx={{ 
                  height: '56px', 
                  borderRadius: '8px', 
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                {loading ? 'Teaching...' : 'Teach Me'}
              </Button>
            </Grid>
          </Grid>
        </form>

        {renderContent()}
        
      </Paper>
    </Container>
  );
}

export default App; 