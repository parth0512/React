// store/postSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  refreshCount: 0,
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    refreshPosts: (state) => {
      state.refreshCount += 1;
    },
  },
});

export const { refreshPosts } = postSlice.actions;
export default postSlice.reducer;
