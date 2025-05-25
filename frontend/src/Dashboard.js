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
import { School, Book, BarChart, LocalFireDepartment, History } from '@mui/icons-material';

function Dashboard({ onNavigateToChat }) {
  const user = {
    name: 'Alex Johnson',
    avatar: 'AJ', // Placeholder for avatar, could be an image URL
    school: 'Innovation High School',
    class: 'Grade 11',
    subjects: ['Physics', 'Calculus', 'Literature'],
    streak: 15, // days
    avgSummaryScore: 88, // percentage
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
                  {/* Placeholder for previous topics list */}
                  <List dense>
                    <ListItem>
                      <ListItemIcon sx={{minWidth: 'auto', mr: 1.5}}><Book fontSize="small" color="action"/></ListItemIcon>
                      <ListItemText primary="Placeholder Topic 1" secondary="Last reviewed: 2 days ago" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{minWidth: 'auto', mr: 1.5}}><Book fontSize="small" color="action"/></ListItemIcon>
                      <ListItemText primary="Placeholder Topic 2" secondary="Last reviewed: 5 days ago" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{minWidth: 'auto', mr: 1.5}}><Book fontSize="small" color="action"/></ListItemIcon>
                      <ListItemText primary="Another Interesting Subject" secondary="Last reviewed: 1 week ago" />
                    </ListItem>
                  </List>
                   <Box sx={{mt: 2, textAlign: 'right'}}>
                     <Button size="small" variant="outlined" onClick={() => alert('Browse all revisions - coming soon!')}>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard; 