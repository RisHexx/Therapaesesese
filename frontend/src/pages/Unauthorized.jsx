import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="container">
      <div className="card card--center">
        <h2>Unauthorized</h2>
        <p style={{ marginTop: 10 }}>You do not have permission to view this page.</p>
        <Link to="/" className="btn btn--primary" style={{ marginTop: 16 }}>Go Home</Link>
      </div>
    </div>
  );
};

export default Unauthorized;
