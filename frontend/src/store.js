import { configureStore } from "@reduxjs/toolkit";

// Simple user reducer (you can expand later)
const userReducer = (state = null, action) => {
  switch (action.type) {
    case "SET_USER":
      return action.payload;
    case "REMOVE_USER":
      return null;
    default:
      return state;
  }
};

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store;