import { legacy_createStore as createStore } from 'redux';

// 1. Define an initial state
const initialState = {
  user: null,
};

// 2. Define a reducer to handle the "SET_USER" action you called in App.js
const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

// 3. Create the store
const store = createStore(userReducer);

export default store;