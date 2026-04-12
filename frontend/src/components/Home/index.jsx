import React, { Component } from 'react';
import Feed from '../Feed';
import Header from '../Header';
import './index.css';

class Home extends Component {
  // The render method is required for class components to return JSX
  render() {
    return (
      <>
        <Header />
        <Feed />
      </>
    );
  }
}

export default Home;