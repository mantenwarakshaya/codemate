import { legacy_createStore as createStore } from 'redux';

// 1. Define an initial state
const initialState = {
  user: null,
};

// 2. Define a reducer to handle actions
const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
      
    case "LOGOUT_USER":
      // ✅ This resets the user field back to null when an auth error occurs
      return { ...state, user: null };
      
    default:
      return state;
  }
};

// 3. Create the store
const store = createStore(userReducer);

export default store;