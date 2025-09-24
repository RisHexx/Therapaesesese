import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container">
      <div className="card card--center">
        <h1>Welcome to Therapease</h1>
        <p style={{ marginTop: 12 }}>
          A simple MERN app demonstrating authentication with role-based access
          for Normal Users, Therapists, and Admins.
        </p>
        <div className="row" style={{ marginTop: 20 }}>
          <Link to="/signup" className="btn btn--primary">Get Started</Link>
          <Link to="/login" className="btn btn--light" style={{ marginLeft: 10 }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
