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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getProposals } from '../../slices/proposalSlice';

const Proposals = () => {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    scope: '',
    status: '',
    location: {}
  });
  const [page, setPage] = useState(1);
  
  const { proposals, pagination, loading, error } = useSelector(state => state.proposal);
  
  useEffect(() => {
    dispatch(getProposals({ ...filters, page }));
  }, [dispatch, filters, page]);
  
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setPage(1); // Reset to first page when filters change
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'closed':
        return 'error';
      case 'escalated':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const getScopeLabel = (scope) => {
    switch (scope) {
      case 'neighborhood':
        return 'Neighborhood';
      case 'city':
        return 'City';
      case 'state':
        return 'State/Province';
      case 'region':
        return 'Region';
      case 'country':
        return 'Country';
      case 'global':
        return 'Global';
      default:
        return scope;
    }
  };
  
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Proposals
      </Typography>
      
      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="scope-label">Scope</InputLabel>
              <Select
                labelId="scope-label"
                id="scope"
                name="scope"
                value={filters.scope}
                label="Scope"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Scopes</MenuItem>
                <MenuItem value="neighborhood">Neighborhood</MenuItem>
                <MenuItem value="city">City</MenuItem>
                <MenuItem value="state">State/Province</MenuItem>
                <MenuItem value="region">Region</MenuItem>
                <MenuItem value="country">Country</MenuItem>
                <MenuItem value="global">Global</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                name="status"
                value={filters.status}
                label="Status"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="escalated">Escalated</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="contained" 
              color="primary" 
              component={Link} 
              to="/proposals/create"
              fullWidth
              sx={{ height: '56px' }}
            >
              Create New Proposal
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {/* Proposals List */}
      {!loading && proposals && proposals.length === 0 && (
        <Alert severity="info">
          No proposals found matching your criteria.
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {proposals && proposals.map(proposal => (
          <Grid item xs={12} key={proposal._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h5" component="div">
                    {proposal.title}
                  </Typography>
                  <Box>
                    <Chip 
                      label={proposal.status} 
                      color={getStatusColor(proposal.status)} 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={getScopeLabel(proposal.scope)} 
                      variant="outlined" 
                      size="small" 
                    />
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {proposal.content.length > 200 
                    ? `${proposal.content.substring(0, 200)}...` 
                    : proposal.content}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      By: {proposal.author?.username || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Location: {proposal.location?.city}, {proposal.location?.country}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Votes: {proposal.yesVotes + proposal.noVotes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Comments: {proposal.comments?.length || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <Divider />
              <CardActions>
                <Button 
                  size="small" 
                  color="primary" 
                  component={Link} 
                  to={`/proposals/${proposal._id}`}
                >
                  View Details
                </Button>
                {proposal.quiz && (
                  <Button 
                    size="small" 
                    color="secondary" 
                    component={Link} 
                    to={`/proposals/${proposal._id}/quiz`}
                  >
                    Take Quiz
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={pagination.pages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}
    </Container>
  );
};

export default Proposals;
