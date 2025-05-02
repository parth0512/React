import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import authReducer from "./authSlice";
import postReducer from "./postSlice";

const store = configureStore({
  reducer: {
    auth: authSlice,
    auth: authReducer,
    post: postReducer,
    //TODO: add more slices here for posts
  },
});

export default store;
