import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  TextField, 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { createProposal } from '../../slices/proposalSlice';
import { setAlert } from '../../slices/alertSlice';

const CreateProposal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    scope: 'neighborhood',
    neighborhood: '',
    city: '',
    state: '',
    region: '',
    country: ''
  });
  
  const { loading, error } = useSelector(state => state.proposal);
  const { acentBalance } = useSelector(state => state.token);
  
  const { 
    title, 
    content, 
    scope, 
    neighborhood, 
    city, 
    state, 
    region, 
    country 
  } = formData;
  
  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    
    if (acentBalance < 5) {
      dispatch(setAlert({
        type: 'error',
        message: 'Insufficient Acent balance. Creating a proposal requires 5 Acents.'
      }));
      return;
    }
    
    try {
      const proposalData = {
        title,
        content,
        scope,
        location: {
          neighborhood,
          city,
          state,
          region,
          country
        }
      };
      
      const result = await dispatch(createProposal(proposalData)).unwrap();
      
      dispatch(setAlert({
        type: 'success',
        message: 'Proposal created successfully! 5 Acents have been deducted from your balance.'
      }));
      
      navigate(`/proposals/${result._id}`);
    } catch (err) {
      dispatch(setAlert({
        type: 'error',
        message: err || 'Failed to create proposal. Please try again.'
      }));
    }
  };
  
  return (
    <Container>
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Proposal
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Creating a proposal costs 5 Acents. Your current balance: {acentBalance} Acents.
        </Alert>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Proposal Title"
                name="title"
                value={title}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={10}
                label="Proposal Content"
                name="content"
                value={content}
                onChange={handleChange}
                placeholder="Describe your proposal in detail..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="subtitle1">Scope & Location</Typography>
              </Divider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="scope-label">Scope</InputLabel>
                <Select
                  labelId="scope-label"
                  id="scope"
                  name="scope"
                  value={scope}
                  label="Scope"
                  onChange={handleChange}
                >
                  <MenuItem value="neighborhood">Neighborhood</MenuItem>
                  <MenuItem value="city">City</MenuItem>
                  <MenuItem value="state">State/Province</MenuItem>
                  <MenuItem value="region">Region</MenuItem>
                  <MenuItem value="country">Country</MenuItem>
                  <MenuItem value="global">Global</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Neighborhood"
                name="neighborhood"
                value={neighborhood}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="City"
                name="city"
                value={city}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State/Province"
                name="state"
                value={state}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Region"
                name="region"
                value={region}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Country"
                name="country"
                value={country}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/proposals')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || acentBalance < 5}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Proposal'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateProposal;
