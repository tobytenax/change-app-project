import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Divider,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { getUserBalance, getUserTransactions } from '../../slices/tokenSlice';
import { updateProfile } from '../../slices/authSlice';
import { setAlert } from '../../slices/alertSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    neighborhood: '',
    city: '',
    state: '',
    region: '',
    country: ''
  });
  
  const { user, loading: authLoading } = useSelector(state => state.auth);
  const { acentBalance, dcentBalance, transactions, loading: tokenLoading } = useSelector(state => state.token);
  
  useEffect(() => {
    dispatch(getUserBalance());
    dispatch(getUserTransactions({ page: 1, limit: 10 }));
    
    if (user) {
      setProfileData({
        name: user.name || '',
        neighborhood: user.location?.neighborhood || '',
        city: user.location?.city || '',
        state: user.location?.state || '',
        region: user.location?.region || '',
        country: user.location?.country || ''
      });
    }
  }, [dispatch, user]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleEditDialogOpen = () => {
    setEditDialogOpen(true);
  };
  
  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };
  
  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleProfileSubmit = async () => {
    try {
      const updatedProfile = {
        name: profileData.name,
        location: {
          neighborhood: profileData.neighborhood,
          city: profileData.city,
          state: profileData.state,
          region: profileData.region,
          country: profileData.country
        }
      };
      
      await dispatch(updateProfile(updatedProfile)).unwrap();
      
      dispatch(setAlert({
        type: 'success',
        message: 'Profile updated successfully!'
      }));
      
      handleEditDialogClose();
    } catch (err) {
      dispatch(setAlert({
        type: 'error',
        message: err || 'Failed to update profile. Please try again.'
      }));
    }
  };
  
  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'quiz_pass':
        return 'Quiz Passed';
      case 'vote_cast':
        return 'Vote Cast';
      case 'delegation_received':
        return 'Delegation Received';
      case 'delegation_given':
        return 'Delegation Given';
      case 'comment_vote':
        return 'Comment Vote';
      case 'proposal_creation':
        return 'Proposal Created';
      case 'comment_creation':
        return 'Comment Created';
      case 'proposal_revenue':
        return 'Proposal Revenue';
      case 'comment_revenue':
        return 'Comment Revenue';
      case 'delegation_revocation':
        return 'Delegation Revoked';
      case 'comment_integration':
        return 'Comment Integrated';
      default:
        return type;
    }
  };
  
  const loading = authLoading || tokenLoading;
  
  if (loading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>
      
      <Grid container spacing={3}>
        {/* User Info Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}>
                  {user?.name?.charAt(0) || <PersonIcon />}
                </Avatar>
                <Typography variant="h5" component="div">
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{user?.username}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Location
              </Typography>
              <Typography variant="body2" paragraph>
                {user?.location?.neighborhood && `${user.location.neighborhood}, `}
                {user?.location?.city && `${user.location.city}, `}
                {user?.location?.state && `${user.location.state}, `}
                {user?.location?.region && `${user.location.region}, `}
                {user?.location?.country}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Contact
              </Typography>
              <Typography variant="body2">
                {user?.email}
              </Typography>
              
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 3 }}
                onClick={handleEditDialogOpen}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Currency and Transactions */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ textAlign: 'center', p: 2, width: '48%', bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="h6" color="success.contrastText">Acent Balance</Typography>
                <Typography variant="h3" color="success.contrastText">{acentBalance}</Typography>
                <Typography variant="body2" color="success.contrastText">
                  Earned through competence and knowledge
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', p: 2, width: '48%', bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="h6" color="info.contrastText">Dcent Balance</Typography>
                <Typography variant="h3" color="info.contrastText">{dcentBalance}</Typography>
                <Typography variant="body2" color="info.contrastText">
                  Earned through delegation and participation
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          <Paper>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Acent Transactions" />
              <Tab label="Dcent Transactions" />
            </Tabs>
            
            {/* Acent Transactions Tab */}
            {tabValue === 0 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Acent Transaction History
                </Typography>
                
                {transactions && transactions.filter(t => t.currencyType === 'acent').length > 0 ? (
                  <List>
                    {transactions
                      .filter(t => t.currencyType === 'acent')
                      .map(transaction => (
                        <ListItem key={transaction._id} divider>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: transaction.amount > 0 ? 'success.main' : 'error.main' }}>
                              <AccountBalanceWalletIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1">
                                  {getTransactionTypeLabel(transaction.type)}
                                </Typography>
                                <Typography 
                                  variant="subtitle1" 
                                  color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                                >
                                  {transaction.amount > 0 ? '+' : ''}{transaction.amount} Acents
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" component="span">
                                  {transaction.description}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" component="div">
                                  {new Date(transaction.createdAt).toLocaleString()}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No Acent transactions found.
                  </Alert>
                )}
              </Box>
            )}
            
            {/* Dcent Transactions Tab */}
            {tabValue === 1 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Dcent Transaction History
                </Typography>
                
                {transactions && transactions.filter(t => t.currencyType === 'dcent').length > 0 ? (
                  <List>
                    {transactions
                      .filter(t => t.currencyType === 'dcent')
                      .map(transaction => (
                        <ListItem key={transaction._id} divider>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: transaction.amount > 0 ? 'success.main' : 'error.main' }}>
                              <AccountBalanceWalletIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1">
                                  {getTransactionTypeLabel(transaction.type)}
                                </Typography>
                                <Typography 
                                  variant="subtitle1" 
                                  color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                                >
                                  {transaction.amount > 0 ? '+' : ''}{transaction.amount} Dcents
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" component="span">
                                  {transaction.description}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" component="div">
                                  {new Date(transaction.createdAt).toLocaleString()}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No Dcent transactions found.
                  </Alert>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Update your profile information below.
          </DialogContentText>
          <TextField
            margin="dense"
            id="name"
            name="name"
            label="Full Name"
            type="text"
            fullWidth
            variant="standard"
            value={profileData.name}
            onChange={handleProfileChange}
          />
          <TextField
            margin="dense"
            id="neighborhood"
            name="neighborhood"
            label="Neighborhood"
            type="text"
            fullWidth
            variant="standard"
            value={profileData.neighborhood}
            onChange={handleProfileChange}
          />
          <TextField
            margin="dense"
            id="city"
            name="city"
            label="City"
            type="text"
            fullWidth
            variant="standard"
            value={profileData.city}
            onChange={handleProfileChange}
          />
          <TextField
            margin="dense"
            id="state"
            name="state"
            label="State/Province"
            type="text"
            fullWidth
            variant="standard"
            value={profileData.state}
            onChange={handleProfileChange}
          />
          <TextField
            margin="dense"
            id="region"
            name="region"
            label="Region"
            type="text"
            fullWidth
            variant="standard"
            value={profileData.region}
            onChange={handleProfileChange}
          />
          <TextField
            margin="dense"
            id="country"
            name="country"
            label="Country"
            type="text"
            fullWidth
            variant="standard"
            value={profileData.country}
            onChange={handleProfileChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleProfileSubmit}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
