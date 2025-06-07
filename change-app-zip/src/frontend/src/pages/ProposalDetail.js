import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
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
  TextField,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getProposalById, getProposalVotes, getProposalComments } from '../../slices/proposalSlice';
import { castVote, createDelegation } from '../../slices/voteSlice';
import { createComment, voteOnComment, integrateComment } from '../../slices/commentSlice';
import { getQuiz } from '../../slices/quizSlice';
import { setAlert } from '../../slices/alertSlice';

const ProposalDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [commentContent, setCommentContent] = useState('');
  const [delegateDialogOpen, setDelegateDialogOpen] = useState(false);
  const [delegateeId, setDelegateeId] = useState('');
  
  const { proposal, votes, comments, loading, error } = useSelector(state => state.proposal);
  const { user } = useSelector(state => state.auth);
  const { quiz } = useSelector(state => state.quiz);
  const { passedQuizzes } = useSelector(state => state.quiz);
  
  const hasPassedQuiz = quiz && passedQuizzes.includes(quiz._id);
  
  useEffect(() => {
    dispatch(getProposalById(id));
    dispatch(getProposalVotes({ id }));
    dispatch(getProposalComments({ id }));
    dispatch(getQuiz(id));
  }, [dispatch, id]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleVote = async (voteType) => {
    try {
      if (!hasPassedQuiz) {
        dispatch(setAlert({
          type: 'warning',
          message: 'You must pass the quiz before voting directly. Take the quiz or delegate your vote.'
        }));
        return;
      }
      
      await dispatch(castVote({ proposalId: id, voteType })).unwrap();
      dispatch(setAlert({
        type: 'success',
        message: `Your ${voteType} vote has been recorded. You earned 1 Acent.`
      }));
      dispatch(getProposalById(id));
    } catch (err) {
      dispatch(setAlert({
        type: 'error',
        message: err || 'Failed to cast vote. Please try again.'
      }));
    }
  };
  
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentContent.trim()) {
      dispatch(setAlert({
        type: 'warning',
        message: 'Comment cannot be empty.'
      }));
      return;
    }
    
    try {
      const result = await dispatch(createComment({ proposalId: id, content: commentContent })).unwrap();
      setCommentContent('');
      dispatch(setAlert({
        type: 'success',
        message: result.isCompetent 
          ? 'Your comment has been posted.' 
          : 'Your comment has been posted. 3 Dcents have been deducted from your balance.'
      }));
      dispatch(getProposalComments({ id }));
    } catch (err) {
      dispatch(setAlert({
        type: 'error',
        message: err || 'Failed to post comment. Please try again.'
      }));
    }
  };
  
  const handleCommentVote = async (commentId, voteType) => {
    try {
      await dispatch(voteOnComment({ commentId, voteType })).unwrap();
      dispatch(setAlert({
        type: 'success',
        message: `You voted ${voteType} on the comment. You earned 1 Dcent.`
      }));
      dispatch(getProposalComments({ id }));
    } catch (err) {
      dispatch(setAlert({
        type: 'error',
        message: err || 'Failed to vote on comment. Please try again.'
      }));
    }
  };
  
  const handleIntegrateComment = async (commentId) => {
    try {
      await dispatch(integrateComment({ proposalId: id, commentId })).unwrap();
      dispatch(setAlert({
        type: 'success',
        message: 'Comment has been integrated into the proposal.'
      }));
      dispatch(getProposalComments({ id }));
    } catch (err) {
      dispatch(setAlert({
        type: 'error',
        message: err || 'Failed to integrate comment. Please try again.'
      }));
    }
  };
  
  const handleDelegateDialogOpen = () => {
    setDelegateDialogOpen(true);
  };
  
  const handleDelegateDialogClose = () => {
    setDelegateDialogOpen(false);
    setDelegateeId('');
  };
  
  const handleDelegateSubmit = async () => {
    try {
      await dispatch(createDelegation({ proposalId: id, delegateeId })).unwrap();
      dispatch(setAlert({
        type: 'success',
        message: 'Your vote has been delegated successfully. You earned 1 Dcent.'
      }));
      handleDelegateDialogClose();
    } catch (err) {
      dispatch(setAlert({
        type: 'error',
        message: err || 'Failed to delegate vote. Please try again.'
      }));
    }
  };
  
  const isUserProposalAuthor = proposal && user && proposal.author && proposal.author._id === user._id;
  
  if (loading && !proposal) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }
  
  if (!proposal) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 2 }}>
          Proposal not found.
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {proposal.title}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip 
            label={proposal.status} 
            color={
              proposal.status === 'active' ? 'success' : 
              proposal.status === 'closed' ? 'error' : 'warning'
            } 
          />
          <Chip 
            label={proposal.scope} 
            variant="outlined" 
          />
          <Chip 
            label={`${proposal.location?.city}, ${proposal.location?.country}`} 
            variant="outlined" 
          />
        </Box>
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {proposal.content}
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                By: {proposal.author?.username || 'Unknown'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(proposal.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
        
        {/* Voting Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Voting
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: 'success.light',
                    color: 'success.contrastText'
                  }}
                >
                  <Typography variant="h4">
                    {proposal.yesVotes || 0}
                  </Typography>
                  <Typography variant="subtitle1">
                    Yes Votes
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: 'error.light',
                    color: 'error.contrastText'
                  }}
                >
                  <Typography variant="h4">
                    {proposal.noVotes || 0}
                  </Typography>
                  <Typography variant="subtitle1">
                    No Votes
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            {proposal.status === 'active' && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => handleVote('yes')}
                  disabled={!hasPassedQuiz}
                >
                  Vote Yes
                </Button>
                <Button 
                  variant="contained" 
                  color="error" 
                  onClick={() => handleVote('no')}
                  disabled={!hasPassedQuiz}
                >
                  Vote No
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleDelegateDialogOpen}
                  disabled={hasPassedQuiz}
                >
                  Delegate Vote
                </Button>
              </Box>
            )}
            
            {!hasPassedQuiz && quiz && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Alert severity="info" sx={{ display: 'inline-flex' }}>
                  You must pass the quiz to vote directly.{' '}
                  <Button 
                    color="primary" 
                    size="small" 
                    onClick={() => navigate(`/proposals/${id}/quiz`)}
                  >
                    Take Quiz
                  </Button>
                </Alert>
              </Box>
            )}
            
            {proposal.votingDeadline && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                Voting deadline: {new Date(proposal.votingDeadline).toLocaleDateString()}
              </Typography>
            )}
          </CardContent>
        </Card>
        
        {/* Tabs for Comments and Votes */}
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Comments" />
            <Tab label="Votes" />
          </Tabs>
          
          {/* Comments Tab */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              {/* Comment Form */}
              <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Add a comment"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {hasPassedQuiz 
                      ? 'You have passed the quiz. Your comment will be marked as competent.' 
                      : 'You have not passed the quiz. Creating a comment will cost 3 Dcents.'}
                  </Typography>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                  >
                    Post Comment
                  </Button>
                </Box>
              </Box>
              
              {/* Comments List */}
              {comments && comments.length > 0 ? (
                comments.map(comment => (
                  <Card key={comment._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ mr: 1 }}>
                            {comment.author?.username || 'Unknown'}
                          </Typography>
                          {comment.isCompetent && (
                            <Chip 
                              label="Competent" 
                              color="success" 
                              size="small" 
                              icon={<CheckCircleIcon />} 
                            />
                          )}
                        </Box>
                        {comment.isIntegrated && (
                          <Chip 
                            label="Integrated" 
                            color="primary" 
                            size="small" 
                          />
                        )}
                      </Box>
                      
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {comment.content}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleCommentVote(comment._id, 'up')}
                            disabled={comment.author?._id === user?._id}
                          >
                            <ThumbUpIcon />
                          </IconButton>
                          <Typography variant="body2" sx={{ mr: 2 }}>
                            {comment.upvotes || 0}
                          </Typography>
                          <IconButton 
                            color="error" 
                            onClick={() => handleCommentVote(comment._id, 'down')}
                            disabled={comment.author?._id === user?._id}
                          >
                            <ThumbDownIcon />
                          </IconButton>
                          <Typography variant="body2">
                            {comment.downvotes || 0}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                    
                    {isUserProposalAuthor && !comment.isIntegrated && (
                      <CardActions>
                        <Button 
                          size="small" 
                          color="primary" 
                          onClick={() => handleIntegrateComment(comment._id)}
                        >
                          Integrate Comment
                        </Button>
                      </CardActions>
                    )}
                  </Card>
                ))
              ) : (
                <Alert severity="info">
                  No comments yet. Be the first to comment!
                </Alert>
              )}
            </Box>
          )}
          
          {/* Votes Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              {votes && votes.length > 0 ? (
                <List>
                  {votes.map(vote => (
                    <ListItem key={vote._id} divider>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ mr: 1 }}>
                              {vote.voter?.username || 'Unknown'}
                            </Typography>
                            <Chip 
                              label={vote.voteType === 'yes' ? 'Yes' : 'No'} 
                              color={vote.voteType === 'yes' ? 'success' : 'error'} 
                              size="small" 
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {new Date(vote.createdAt).toLocaleDateString()}
                            </Typography>
                            {vote.delegatedBy && vote.delegatedBy.length > 0 && (
                              <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                                Delegated by: {vote.delegatedBy.map(d => d.username).join(', ')}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  No votes yet.
                </Alert>
              )}
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Delegation Dialog */}
      <Dialog open={delegateDialogOpen} onClose={handleDelegateDialogClose}>
        <DialogTitle>Delegate Your Vote</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can delegate your vote to someone who has passed the quiz for this proposal.
            You will earn 1 Dcent for delegating your vote.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="delegateeId"
            label="Delegatee ID"
            type="text"
            fullWidth
            variant="standard"
            value={delegateeId}
            onChange={(e) => setDelegateeId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelegateDialogClose}>Cancel</Button>
          <Button onClick={handleDelegateSubmit}>Delegate</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProposalDetail;
