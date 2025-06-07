import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Cast vote on a proposal
export const castVote = createAsyncThunk(
  'vote/castVote',
  async ({ proposalId, voteType }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/proposals/${proposalId}/votes`, { voteType });
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

// Create delegation for a proposal
export const createDelegation = createAsyncThunk(
  'vote/createDelegation',
  async ({ proposalId, delegateeId }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/proposals/${proposalId}/delegations`, { delegateeId });
      return res.data.delegation;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  }
);

// Revoke delegation
export const revokeDelegation = createAsyncThunk(
  'vote/revokeDelegation',
  async ({ proposalId, delegationId }, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/api/proposals/${proposalId}/delegations/${delegationId}`);
      return { delegationId, message: res.data.message };
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  }
);

// Get user's votes
export const getUserVotes = createAsyncThunk(
  'vote/getUserVotes',
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/users/me/votes?page=${page}&limit=${limit}`);
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

// Get user's delegations
export const getUserDelegations = createAsyncThunk(
  'vote/getUserDelegations',
  async ({ type = 'given', page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/users/me/delegations?type=${type}&page=${page}&limit=${limit}`);
      return { type, ...res.data };
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
  userVotes: [],
  delegationsGiven: [],
  delegationsReceived: [],
  currentVote: null,
  currentDelegation: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  },
  loading: false,
  error: null
};

const voteSlice = createSlice({
  name: 'vote',
  initialState,
  reducers: {
    clearVoteState: (state) => {
      state.currentVote = null;
      state.currentDelegation = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Cast vote
      .addCase(castVote.pending, (state) => {
        state.loading = true;
      })
      .addCase(castVote.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVote = action.payload.vote;
        state.userVotes = [action.payload.vote, ...state.userVotes];
      })
      .addCase(castVote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create delegation
      .addCase(createDelegation.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDelegation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDelegation = action.payload;
        state.delegationsGiven = [action.payload, ...state.delegationsGiven];
      })
      .addCase(createDelegation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Revoke delegation
      .addCase(revokeDelegation.pending, (state) => {
        state.loading = true;
      })
      .addCase(revokeDelegation.fulfilled, (state, action) => {
        state.loading = false;
        state.delegationsGiven = state.delegationsGiven.filter(
          delegation => delegation._id !== action.payload.delegationId
        );
        if (state.currentDelegation && state.currentDelegation._id === action.payload.delegationId) {
          state.currentDelegation = null;
        }
      })
      .addCase(revokeDelegation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user's votes
      .addCase(getUserVotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserVotes.fulfilled, (state, action) => {
        state.loading = false;
        state.userVotes = action.payload.votes;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserVotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user's delegations
      .addCase(getUserDelegations.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserDelegations.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.type === 'given') {
          state.delegationsGiven = action.payload.delegations;
        } else {
          state.delegationsReceived = action.payload.delegations;
        }
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserDelegations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearVoteState, clearError } = voteSlice.actions;

export default voteSlice.reducer;
