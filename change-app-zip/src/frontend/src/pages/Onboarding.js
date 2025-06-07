import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Tabs, 
  Tab,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import SchoolIcon from '@mui/icons-material/School';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArticleIcon from '@mui/icons-material/Article';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import QuizIcon from '@mui/icons-material/Quiz';
import CommentIcon from '@mui/icons-material/Comment';
import PersonIcon from '@mui/icons-material/Person';

// Import tutorial content
import tutorialContent from '../../docs/onboarding_tutorial.md';

const Onboarding = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tutorialText, setTutorialText] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  
  useEffect(() => {
    // In a real implementation, we would fetch the markdown content
    // For now, we'll use the imported content directly
    setTutorialText(tutorialContent);
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleReset = () => {
    setActiveStep(0);
  };
  
  const tutorialSteps = [
    {
      label: 'Welcome to Change App',
      description: `Welcome to the Change App! This tutorial will guide you through the key features of the platform and help you get started.`,
      icon: <SchoolIcon />
    },
    {
      label: 'Understanding the Dual-Currency System',
      description: `The Change App uses two types of digital tokens: Acents and Dcents. Acents are earned through demonstrating competence, while Dcents are earned through delegation and participation.`,
      icon: <AccountBalanceWalletIcon />
    },
    {
      label: 'Browsing and Voting on Proposals',
      description: `Learn how to find proposals that interest you and how to cast your vote. Remember, you'll need to pass a quiz first or delegate your vote.`,
      icon: <HowToVoteIcon />
    },
    {
      label: 'Taking Quizzes',
      description: `Quizzes ensure that voters understand the proposal before voting directly. Pass a quiz to earn Acents and gain the ability to vote directly.`,
      icon: <QuizIcon />
    },
    {
      label: 'The Delegation System',
      description: `If you haven't passed a quiz, you can delegate your vote to someone who has. You'll earn Dcents for delegating, and they'll earn Dcents for receiving your delegation.`,
      icon: <PersonIcon />
    },
    {
      label: 'Commenting System',
      description: `Engage in discussions through comments. If you've passed the quiz, your comments are free and marked as "competent." Otherwise, comments cost 3 Dcents.`,
      icon: <CommentIcon />
    },
    {
      label: 'Next Steps',
      description: `Congratulations! You now understand the basics of the Change App. Explore the platform, participate in discussions, and make your voice heard!`,
      icon: <CheckCircleIcon />
    },
  ];
  
  const videoTutorials = [
    {
      title: "Getting Started with Change App",
      description: "Learn the basics of creating an account and navigating the platform.",
      duration: "5:30",
      thumbnail: "/assets/video-thumbnails/getting-started.jpg"
    },
    {
      title: "The Dual-Currency System Explained",
      description: "Understand how Acents and Dcents work in the Change App ecosystem.",
      duration: "9:45",
      thumbnail: "/assets/video-thumbnails/dual-currency.jpg"
    },
    {
      title: "Browsing and Voting on Proposals",
      description: "Discover how to find and vote on proposals that matter to you.",
      duration: "8:15",
      thumbnail: "/assets/video-thumbnails/proposals.jpg"
    },
    {
      title: "Quizzes and Competence Verification",
      description: "Learn how to take quizzes and demonstrate your understanding of proposals.",
      duration: "7:45",
      thumbnail: "/assets/video-thumbnails/quizzes.jpg"
    },
    {
      title: "Understanding Delegation",
      description: "Explore how to delegate your vote and earn Dcents in the process.",
      duration: "8:30",
      thumbnail: "/assets/video-thumbnails/delegation.jpg"
    },
    {
      title: "Creating Effective Proposals",
      description: "Learn how to create compelling proposals that engage the community.",
      duration: "9:00",
      thumbnail: "/assets/video-thumbnails/create-proposals.jpg"
    },
    {
      title: "Engaging Through Comments",
      description: "Discover how to participate in discussions and potentially convert Dcents to Acents.",
      duration: "10:00",
      thumbnail: "/assets/video-thumbnails/comments.jpg"
    },
    {
      title: "Profile and Transaction Management",
      description: "Learn how to manage your profile and track your currency transactions.",
      duration: "8:00",
      thumbnail: "/assets/video-thumbnails/profile.jpg"
    }
  ];
  
  const quickStartItems = [
    {
      title: "Create Your Account",
      description: "Sign up with your email, username, and location information."
    },
    {
      title: "Browse Proposals",
      description: "Explore proposals in your area or on topics that interest you."
    },
    {
      title: "Take a Quiz",
      description: "Demonstrate your understanding of a proposal to vote directly."
    },
    {
      title: "Vote or Delegate",
      description: "Cast your vote if you passed the quiz, or delegate to someone who did."
    },
    {
      title: "Join the Conversation",
      description: "Comment on proposals and engage with the community."
    }
  ];
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Welcome to Change App
      </Typography>
      
      <Typography variant="h6" paragraph align="center" color="text.secondary">
        Your guide to direct democracy with competence verification
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<SchoolIcon />} label="Interactive Tutorial" />
          <Tab icon={<PlayCircleOutlineIcon />} label="Video Tutorials" />
          <Tab icon={<ArticleIcon />} label="Written Guide" />
          <Tab icon={<HelpOutlineIcon />} label="Quick Start" />
        </Tabs>
        
        {/* Interactive Tutorial Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Interactive Tutorial
            </Typography>
            <Typography paragraph color="text.secondary">
              Follow this step-by-step guide to learn how to use the Change App effectively.
            </Typography>
            
            <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 3 }}>
              {tutorialSteps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box sx={{ mr: 1, color: index === activeStep ? 'primary.main' : 'text.disabled' }}>
                        {step.icon}
                      </Box>
                    )}
                  >
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Typography>{step.description}</Typography>
                    <Box sx={{ mb: 2, mt: 2 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          {index === tutorialSteps.length - 1 ? 'Finish' : 'Continue'}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Back
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            
            {activeStep === tutorialSteps.length && (
              <Paper square elevation={0} sx={{ p: 3 }}>
                <Typography>Tutorial completed - you&apos;re ready to use Change App!</Typography>
                <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                  Restart Tutorial
                </Button>
              </Paper>
            )}
          </Box>
        )}
        
        {/* Video Tutorials Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Video Tutorials
            </Typography>
            <Typography paragraph color="text.secondary">
              Watch these videos to learn about different aspects of the Change App.
            </Typography>
            
            <Grid container spacing={3}>
              {videoTutorials.map((video, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="div"
                      sx={{
                        pt: '56.25%', // 16:9 aspect ratio
                        bgcolor: 'grey.300',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <PlayCircleOutlineIcon sx={{ fontSize: 60, color: 'white' }} />
                    </CardMedia>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h2">
                        {video.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {video.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duration: {video.duration}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {/* Written Guide Tab */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Written Guide
            </Typography>
            <Typography paragraph color="text.secondary">
              A comprehensive written guide to all features of the Change App.
            </Typography>
            
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
              {tutorialText ? (
                <ReactMarkdown>{tutorialText}</ReactMarkdown>
              ) : (
                <Typography>Loading tutorial content...</Typography>
              )}
            </Paper>
          </Box>
        )}
        
        {/* Quick Start Tab */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Quick Start Guide
            </Typography>
            <Typography paragraph color="text.secondary">
              Get started with Change App in just a few steps.
            </Typography>
            
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Five Steps to Get Started
                </Typography>
                
                <List>
                  {quickStartItems.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Box sx={{ 
                          width: 28, 
                          height: 28, 
                          borderRadius: '50%', 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </Box>
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.title} 
                        secondary={item.description} 
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Understanding the Dual-Currency System
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Acents
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Competence-based tokens earned through:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon sx={{ color: 'success.contrastText' }} />
                        </ListItemIcon>
                        <ListItemText primary="Passing quizzes (1 Acent)" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon sx={{ color: 'success.contrastText' }} />
                        </ListItemIcon>
                        <ListItemText primary="Voting after passing a quiz (1 Acent)" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon sx={{ color: 'success.contrastText' }} />
                        </ListItemIcon>
                        <ListItemText primary="Having comments integrated into proposals" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon sx={{ color: 'success.contrastText' }} />
                        </ListItemIcon>
                        <ListItemText primary="Receiving 'yes' votes on your proposals" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Dcents
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Delegation-based tokens earned through:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon sx={{ color: 'info.contrastText' }} />
                        </ListItemIcon>
                        <ListItemText primary="Delegating your vote (1 Dcent)" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon sx={{ color: 'info.contrastText' }} />
                        </ListItemIcon>
                        <ListItemText primary="Receiving delegated votes (1 Dcent per delegation)" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon sx={{ color: 'info.contrastText' }} />
                        </ListItemIcon>
                        <ListItemText primary="Voting on comments (1 Dcent per vote)" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon sx={{ color: 'info.contrastText' }} />
                        </ListItemIcon>
                        <ListItemText primary="Receiving upvotes on your comments" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button variant="contained" size="large">
                Start Using Change App
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Onboarding;
