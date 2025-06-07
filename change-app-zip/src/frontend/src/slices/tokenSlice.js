import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get user's coin balance
export const getUserBalance = createAsyncThunk(
  'token/getUserBalance',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/users/me/balance');
      return {
        acentBalance: res.data.acentBalance,
        dcentBalance: res.data.dcentBalance
      };
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  }
);

// Get user's transaction history
export const getUserTransactions = createAsyncThunk(
  'token/getUserTransactions',
  async ({ page = 1, limit = 20, type, currencyType }, { rejectWithValue }) => {
    try {
      let query = `?page=${page}&limit=${limit}`;
      if (type) query += `&type=${type}`;
      if (currencyType) query += `&currencyType=${currencyType}`;
      
      const res = await axios.get(`/api/users/me/transactions${query}`);
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
  acentBalance: 0,
  dcentBalance: 0,
  transactions: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  },
  loading: false,
  error: null
};

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get user's coin balance
      .addCase(getUserBalance.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.acentBalance = action.payload.acentBalance;
        state.dcentBalance = action.payload.dcentBalance;
      })
      .addCase(getUserBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user's transaction history
      .addCase(getUserTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = tokenSlice.actions;

export default tokenSlice.reducer;
