import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create comment on a proposal
export const createComment = createAsyncThunk(
  'comment/createComment',
  async ({ proposalId, content }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/proposals/${proposalId}/comments`, { content });
      return res.data.comment;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  }
);

// Vote on a comment
export const voteOnComment = createAsyncThunk(
  'comment/voteOnComment',
  async ({ commentId, voteType }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/comments/${commentId}/votes`, { voteType });
      return res.data.comment;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  }
);

// Integrate a comment into a proposal
export const integrateComment = createAsyncThunk(
  'comment/integrateComment',
  async ({ proposalId, commentId }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/proposals/${proposalId}/comments/${commentId}/integrate`);
      return res.data.comment;
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
  comments: [],
  currentComment: null,
  loading: false,
  error: null
};

const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    clearCommentState: (state) => {
      state.currentComment = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setComments: (state, action) => {
      state.comments = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create comment
      .addCase(createComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentComment = action.payload;
        state.comments = [action.payload, ...state.comments];
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Vote on comment
      .addCase(voteOnComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(voteOnComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.map(comment =>
          comment._id === action.payload._id ? action.payload : comment
        );
      })
      .addCase(voteOnComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Integrate comment
      .addCase(integrateComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(integrateComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.map(comment =>
          comment._id === action.payload._id ? action.payload : comment
        );
      })
      .addCase(integrateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCommentState, clearError, setComments } = commentSlice.actions;

export default commentSlice.reducer;
