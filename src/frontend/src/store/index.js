import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import proposalReducer from './slices/proposalSlice';
import quizReducer from './slices/quizSlice';
import commentReducer from './slices/commentSlice';
import tokenReducer from './slices/tokenSlice';
import alertReducer from './slices/alertSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    proposal: proposalReducer,
    quiz: quizReducer,
    comment: commentReducer,
    token: tokenReducer,
    alert: alertReducer
  }
});

export default store;
