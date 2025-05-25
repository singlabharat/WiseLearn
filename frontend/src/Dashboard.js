import React from 'react';
import {
  Button,
  Typography,
  Container,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { School, Book, BarChart, LocalFireDepartment, History, EmojiEvents as EmojiEventsIcon, DeleteSweep as DeleteSweepIcon } from '@mui/icons-material';

function Dashboard({ onNavigateToChat, revisionTopics, navigateToChatWithState, clearRevisionTopics }) {
  const user = {
    name: 'Alex Johnson',
    avatar: 'AJ', // Placeholder for avatar, could be an image URL
    school: 'Innovation High School',
    class: 'Grade 11',
    subjects: ['Physics', 'Calculus', 'Literature'],
    streak: 15, // days
    avgSummaryScore: 88, // percentage
  };

  const topLearners = [
    { id: 1, name: 'Sarah V.', streak: 25, avatar: 'SV' },
    { id: 2, name: 'Mike L.', streak: 22, avatar: 'ML' },
    { id: 3, name: 'Chloe R.', streak: 19, avatar: 'CR' },
  ];

  const getRankColor = (index) => {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    if (index === 2) return '#CD7F32'; // Bronze
    return 'action';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 8 }, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Left Half - New Topic / Call to Action & Revision Zone */}
        <Grid item xs={12} md={6}>
          <Grid container direction="column" spacing={3}>
            <Grid item>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: { xs: 3, sm: 4 }, 
                  textAlign: 'center', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  // height: '100%', // Adjusted for two cards in this column
                  borderRadius: 3
                }}
              >
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Welcome Back!
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
                  Ready to dive into a new subject or continue your learning adventure?
                </Typography>
                <Box>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    onClick={onNavigateToChat}
                    startIcon={<School />}
                    sx={{ 
                      py: 1.5,
                      px: 5,
                      fontSize: '1.1rem',
                      borderRadius: '8px'
                    }}
                  >
                    Start New Topic
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Revision Zone Card */}
            <Grid item>
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2, color: 'primary.dark' }}>
                    <History sx={{ mr: 1.5 }} /> Revision Zone
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2}}>
                    Revisit your previously learned topics to reinforce your knowledge.
                  </Typography>
                  {revisionTopics && revisionTopics.length > 0 ? (
                    <List dense>
                      {revisionTopics.map((revision) => (
                        <ListItem 
                          key={revision.id} 
                          button 
                          onClick={() => navigateToChatWithState(revision.chatState)}
                          sx={{ 
                            mb: 1, 
                            borderRadius: '4px', 
                            '&:hover': { backgroundColor: 'action.hover' }
                          }}
                        >
                          <ListItemIcon sx={{minWidth: 'auto', mr: 1.5}}>
                            <Book fontSize="small" color="action"/>
                          </ListItemIcon>
                          <ListItemText 
                            primary={revision.name} 
                            secondary={`Reviewed: ${revision.date}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{mt: 2, textAlign: 'center'}}>
                      No revision topics yet. Start a new chat and summarize it!
                    </Typography>
                  )}
                   <Box sx={{mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                     <Button 
                        size="small" 
                        variant="outlined" 
                        color="error" 
                        startIcon={<DeleteSweepIcon />} 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to clear all revision topics?')) {
                            clearRevisionTopics();
                          }
                        }}
                        disabled={!revisionTopics || revisionTopics.length === 0}
                      >
                       Clear All Revisions
                     </Button>
                     <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => alert('Browse all revisions - coming soon!')}
                      >
                       View All Revisions
                     </Button>
                   </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Half - User Profile & Stats */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 60, height: 60, mr: 2, fontSize: '1.8rem' }}>
                  {user.avatar}
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {user.school}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.class}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main'}}>
                <Book sx={{ mr: 1 }} /> Subjects
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {user.subjects.map((subject) => (
                  <Chip key={subject} label={subject} variant="outlined" color="primary" />
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'secondary.main'}}>
                <BarChart sx={{ mr: 1 }} /> Learning Stats
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', backgroundColor: 'action.hover', borderRadius: '8px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'warning.main'}}>
                      <LocalFireDepartment sx={{ fontSize: '2rem', mr: 0.5 }}/> 
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold'}}>{user.streak}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">Day Streak</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', backgroundColor: 'action.hover', borderRadius: '8px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'success.main'}}>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>{user.avgSummaryScore}%</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">Avg. Summary Score</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'info.main'}}>
                <EmojiEventsIcon sx={{ mr: 1 }} /> Top Learners
              </Typography>
              <List dense>
                {topLearners.map((learner, index) => (
                  <ListItem key={learner.id} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
                      <EmojiEventsIcon sx={{ color: getRankColor(index) }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${index + 1}. ${learner.name}`}
                      secondary={`Day Streak: ${learner.streak}`}
                    />
                    <Avatar sx={{ bgcolor: 'transparent', color: getRankColor(index), fontWeight: 'bold' }}>{/* Can also use learner.avatar */}</Avatar>
                  </ListItem>
                ))}
              </List>

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard; 