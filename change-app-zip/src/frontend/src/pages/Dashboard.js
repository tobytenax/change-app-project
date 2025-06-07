import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { getUserBalance, getUserTransactions } from '../../slices/tokenSlice';
import { getUserVotes } from '../../slices/voteSlice';
import { getUserDelegations } from '../../slices/voteSlice';
import { getUserQuizAttempts } from '../../slices/quizSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  
  const { user } = useSelector(state => state.auth);
  const { acentBalance, dcentBalance, loading: tokenLoading } = useSelector(state => state.token);
  const { userVotes, delegationsGiven, delegationsReceived, loading: voteLoading } = useSelector(state => state.vote);
  const { passedQuizzes, loading: quizLoading } = useSelector(state => state.quiz);
  
  useEffect(() => {
    dispatch(getUserBalance());
    dispatch(getUserVotes({ page: 1, limit: 5 }));
    dispatch(getUserDelegations({ type: 'given', page: 1, limit: 5 }));
    dispatch(getUserDelegations({ type: 'received', page: 1, limit: 5 }));
    dispatch(getUserQuizAttempts());
  }, [dispatch]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const loading = tokenLoading || voteLoading || quizLoading;
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* User Info Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="div">
                  Welcome, {user?.name}!
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Username: {user?.username}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Location: {user?.location?.city}, {user?.location?.country}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Currency Balance Cards */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="h6" component="div">
                Acent Balance
              </Typography>
              <Typography variant="h3" component="div" sx={{ mt: 2 }}>
                {acentBalance}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Earned through competence and knowledge
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="inherit" variant="outlined">
                View Acent Transactions
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Typography variant="h6" component="div">
                Dcent Balance
              </Typography>
              <Typography variant="h3" component="div" sx={{ mt: 2 }}>
                {dcentBalance}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Earned through delegation and participation
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="inherit" variant="outlined">
                View Dcent Transactions
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Activity Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Recent Votes" />
              <Tab label="Delegations Given" />
              <Tab label="Delegations Received" />
              <Tab label="Passed Quizzes" />
            </Tabs>
            
            {/* Recent Votes Tab */}
            {tabValue === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Your Recent Votes
                </Typography>
                {userVotes && userVotes.length > 0 ? (
                  userVotes.map((vote, index) => (
                    <Box key={vote._id || index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">
                        {vote.proposal?.title || 'Proposal'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label={vote.voteType === 'yes' ? 'Voted Yes' : 'Voted No'} 
                          color={vote.voteType === 'yes' ? 'success' : 'error'} 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(vote.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))
                ) : (
                  <Alert severity="info">You haven't cast any votes yet.</Alert>
                )}
                {userVotes && userVotes.length > 0 && (
                  <Button variant="text" sx={{ mt: 1 }}>
                    View All Votes
                  </Button>
                )}
              </Box>
            )}
            
            {/* Delegations Given Tab */}
            {tabValue === 1 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Delegations You've Given
                </Typography>
                {delegationsGiven && delegationsGiven.length > 0 ? (
                  delegationsGiven.map((delegation, index) => (
                    <Box key={delegation._id || index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">
                        Delegated to: {delegation.delegatee?.username || 'User'}
                      </Typography>
                      <Typography variant="body2">
                        Proposal: {delegation.proposal?.title || 'Proposal'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label={delegation.status} 
                          color={delegation.status === 'active' ? 'success' : 'default'} 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(delegation.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))
                ) : (
                  <Alert severity="info">You haven't delegated any votes yet.</Alert>
                )}
                {delegationsGiven && delegationsGiven.length > 0 && (
                  <Button variant="text" sx={{ mt: 1 }}>
                    View All Delegations
                  </Button>
                )}
              </Box>
            )}
            
            {/* Delegations Received Tab */}
            {tabValue === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Delegations You've Received
                </Typography>
                {delegationsReceived && delegationsReceived.length > 0 ? (
                  delegationsReceived.map((delegation, index) => (
                    <Box key={delegation._id || index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">
                        Delegated from: {delegation.delegator?.username || 'User'}
                      </Typography>
                      <Typography variant="body2">
                        Proposal: {delegation.proposal?.title || 'Proposal'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label={delegation.status} 
                          color={delegation.status === 'active' ? 'success' : 'default'} 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(delegation.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))
                ) : (
                  <Alert severity="info">You haven't received any delegations yet.</Alert>
                )}
                {delegationsReceived && delegationsReceived.length > 0 && (
                  <Button variant="text" sx={{ mt: 1 }}>
                    View All Received Delegations
                  </Button>
                )}
              </Box>
            )}
            
            {/* Passed Quizzes Tab */}
            {tabValue === 3 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quizzes You've Passed
                </Typography>
                {passedQuizzes && passedQuizzes.length > 0 ? (
                  passedQuizzes.map((quiz, index) => (
                    <Box key={quiz._id || index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">
                        {quiz.title || `Quiz #${index + 1}`}
                      </Typography>
                      <Typography variant="body2">
                        Related to proposal: {quiz.proposal?.title || 'Proposal'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label="Passed" 
                          color="success" 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {quiz.passedDate ? new Date(quiz.passedDate).toLocaleDateString() : 'Date not available'}
                        </Typography>
                      </Box>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))
                ) : (
                  <Alert severity="info">You haven't passed any quizzes yet.</Alert>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
