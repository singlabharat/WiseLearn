import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountCircle as AccountCircleIcon,
  MenuBook as MenuBookIcon, // Placeholder, replace with ExercisePlans icon if available
  ReceiptLong as ReceiptLongIcon, // Placeholder, replace with DietPlans icon if available
  Subscriptions as SubscriptionsIcon,
  Build as BuildIcon, // Placeholder, replace with ExtraServices icon if available
  Logout as LogoutIcon
} from '@mui/icons-material';

const Sidebar = ({ onNavigate, user }) => {
  const theme = useTheme();
  const navItems = [
    { text: 'DASHBOARD', icon: <DashboardIcon />, page: 'dashboard' },
    { text: 'ACCOUNT PROFILE', icon: <AccountCircleIcon />, page: 'profile' }, // Placeholder page
    { text: 'EXERCISE PLANS', icon: <MenuBookIcon />, page: 'exercise' }, // Placeholder page
    { text: 'DIET PLANS', icon: <ReceiptLongIcon />, page: 'diet' }, // Placeholder page
    { text: 'SUBSCRIPTION', icon: <SubscriptionsIcon />, page: 'subscription' }, // Placeholder page
    { text: 'EXTRA SERVICES', icon: <BuildIcon />, page: 'services' }, // Placeholder page
  ];

  return (
    <Paper 
      elevation={3} 
      sx={{
        height: '100vh',
        width: 280, // Fixed width for the sidebar
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff', // White background for sidebar
        borderRight: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box sx={{ p: 2.5, textAlign: 'center', mt: 2 }}>
        <Avatar 
          sx={{ 
            width: 90, 
            height: 90, 
            margin: '0 auto',
            mb: 1.5,
            bgcolor: theme.palette.primary.main // Or use an image src if available
          }}
        >
          {user.avatar || (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
        </Avatar>
        <Typography variant="h6" sx={{fontWeight: 'bold'}}>{user.name || 'User Name'}</Typography>
        <Typography variant="body2" color="text.secondary">{user.email || 'user@example.com'}</Typography>
      </Box>
      <Divider sx={{my:1}} />
      <List sx={{ flexGrow: 1, pt:0 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{display: 'block'}}>
            <ListItemButton 
              onClick={() => onNavigate(item.page)} 
              sx={{
                minHeight: 48,
                justifyContent: 'initial',
                px: 2.5,
                py: 1.2, // Increased padding for better spacing
                mb: 0.5, // Margin between items
                borderRadius: '4px',
                margin: '0 8px',
                 '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                // Add selected state style later if currentPage is passed
              }}
            >
              <ListItemIcon sx={{minWidth:0, mr: 2, justifyContent:'center', color: theme.palette.text.secondary}}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.secondary}}/>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{mt:1, mb:1}}/>
      <Box sx={{ p: 2, textAlign: 'center', mb:1 }}>
        <Button 
          variant="contained"
          color="primary"
          startIcon={<LogoutIcon />}
          onClick={() => alert('Log Out Clicked')} // Placeholder action
          sx={{ 
            width: '80%',
            borderRadius: '8px',
            backgroundColor: '#87CEEB', // Light blue from image
            color: '#fff', // White text
            '&:hover': {
                backgroundColor: theme.palette.primary.dark
            }
        }}
        >
          LOG OUT
        </Button>
      </Box>
    </Paper>
  );
};

export default Sidebar; 