import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get quiz for a proposal
export const getQuiz = createAsyncThunk(
  'quiz/getQuiz',
  async (proposalId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/proposals/${proposalId}/quiz`);
      return res.data.quiz;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  }
);

// Submit quiz attempt
export const submitQuizAttempt = createAsyncThunk(
  'quiz/submitQuizAttempt',
  async ({ proposalId, answers }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/proposals/${proposalId}/quiz/attempts`, { answers });
      return res.data.quizAttempt;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  }
);

// Create quiz for a proposal
export const createQuiz = createAsyncThunk(
  'quiz/createQuiz',
  async ({ proposalId, quizData }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/proposals/${proposalId}/quiz`, quizData);
      return res.data.quiz;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  }
);

// Get user's quiz attempts
export const getUserQuizAttempts = createAsyncThunk(
  'quiz/getUserQuizAttempts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/users/me/quiz-attempts');
      return res.data.passedQuizzes;
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
  quiz: null,
  quizAttempt: null,
  passedQuizzes: [],
  loading: false,
  error: null
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    clearQuiz: (state) => {
      state.quiz = null;
      state.quizAttempt = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get quiz for a proposal
      .addCase(getQuiz.pending, (state) => {
        state.loading = true;
      })
      .addCase(getQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quiz = action.payload;
      })
      .addCase(getQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Submit quiz attempt
      .addCase(submitQuizAttempt.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitQuizAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.quizAttempt = action.payload;
        if (action.payload.passed) {
          state.passedQuizzes.push(state.quiz._id);
        }
      })
      .addCase(submitQuizAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create quiz for a proposal
      .addCase(createQuiz.pending, (state) => {
        state.loading = true;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quiz = action.payload;
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user's quiz attempts
      .addCase(getUserQuizAttempts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserQuizAttempts.fulfilled, (state, action) => {
        state.loading = false;
        state.passedQuizzes = action.payload;
      })
      .addCase(getUserQuizAttempts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearQuiz, clearError } = quizSlice.actions;

export default quizSlice.reducer;
