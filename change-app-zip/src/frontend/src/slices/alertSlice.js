import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  alerts: []
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setAlert: (state, action) => {
      state.alerts.push({
        id: Date.now(),
        ...action.payload
      });
    },
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    }
  }
});

export const { setAlert, removeAlert } = alertSlice.actions;

export default alertSlice.reducer;
