import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get all proposals
export const getProposals = createAsyncThunk(
  'proposal/getProposals',
  async ({ scope, location, status, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      let query = `?page=${page}&limit=${limit}`;
      if (scope) query += `&scope=${scope}`;
      if (status) query += `&status=${status}`;
      if (location) query += `&location=${JSON.stringify(location)}`;
      
      const res = await axios.get(`/api/proposals${query}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  }
);

// Get proposal by ID
export const getProposalById = createAsyncThunk(
  'proposal/getProposalById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/proposals/${id}`);
      return res.data.proposal;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  }
);

// Create new proposal
export const createProposal = createAsyncThunk(
  'proposal/createProposal',
  async (proposalData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/proposals', proposalData);
      return res.data.proposal;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  }
);

// Update proposal
export const updateProposal = createAsyncThunk(
  'proposal/updateProposal',
  async ({ id, proposalData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/proposals/${id}`, proposalData);
      return res.data.proposal;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  }
);

// Get votes for a proposal
export const getProposalVotes = createAsyncThunk(
  'proposal/getProposalVotes',
  async ({ id, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/proposals/${id}/votes?page=${page}&limit=${limit}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  }
);

// Get comments for a proposal
export const getProposalComments = createAsyncThunk(
  'proposal/getProposalComments',
  async ({ id, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/proposals/${id}/comments?page=${page}&limit=${limit}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  }
);

const initialState = {
  proposals: [],
  proposal: null,
  votes: [],
  comments: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  },
  loading: false,
  error: null
};

const proposalSlice = createSlice({
  name: 'proposal',
  initialState,
  reducers: {
    clearProposal: (state) => {
      state.proposal = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all proposals
      .addCase(getProposals.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProposals.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals = action.payload.proposals;
        state.pagination = action.payload.pagination;
      })
      .addCase(getProposals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get proposal by ID
      .addCase(getProposalById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProposalById.fulfilled, (state, action) => {
        state.loading = false;
        state.proposal = action.payload;
      })
      .addCase(getProposalById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create new proposal
      .addCase(createProposal.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals = [action.payload, ...state.proposals];
      })
      .addCase(createProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update proposal
      .addCase(updateProposal.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.proposal = action.payload;
        state.proposals = state.proposals.map(proposal =>
          proposal._id === action.payload._id ? action.payload : proposal
        );
      })
      .addCase(updateProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get votes for a proposal
      .addCase(getProposalVotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProposalVotes.fulfilled, (state, action) => {
        state.loading = false;
        state.votes = action.payload.votes;
      })
      .addCase(getProposalVotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get comments for a proposal
      .addCase(getProposalComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProposalComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload.comments;
      })
      .addCase(getProposalComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearProposal, clearError } = proposalSlice.actions;

export default proposalSlice.reducer;
