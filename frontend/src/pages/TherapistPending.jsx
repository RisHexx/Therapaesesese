import React from 'react';
import { Link } from 'react-router-dom';

const TherapistPending = () => {
  return (
    <div className="auth-container-centered">
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>
      
      <div className="auth-card-minimal" style={{ maxWidth: '500px' }}>
        <div className="verification-status-header">
          <div className="status-icon">⏳</div>
          <h2>Application Under Review</h2>
          <p>Your therapist application has been submitted successfully</p>
        </div>

        <div className="verification-status-content">
          <div className="status-message">
            <h3>What happens next?</h3>
            <div className="verification-steps">
              <div className="verification-step">
                <div className="step-icon">✅</div>
                <div className="step-content">
                  <h4>Application Submitted</h4>
                  <p>Your therapist registration has been received</p>
                </div>
              </div>
              
              <div className="verification-step">
                <div className="step-icon">🔍</div>
                <div className="step-content">
                  <h4>Under Review</h4>
                  <p>Our admin team is reviewing your credentials and qualifications</p>
                </div>
              </div>
              
              <div className="verification-step pending">
                <div className="step-icon">📧</div>
                <div className="step-content">
                  <h4>Notification</h4>
                  <p>You'll receive an email once your application is approved</p>
                </div>
              </div>
              
              <div className="verification-step pending">
                <div className="step-icon">🎉</div>
                <div className="step-content">
                  <h4>Access Granted</h4>
                  <p>Login to your therapist dashboard and start helping clients</p>
                </div>
              </div>
            </div>
          </div>

          <div className="verification-info">
            <div className="info-card">
              <h4>📋 What we're reviewing</h4>
              <ul>
                <li>Professional license verification</li>
                <li>Educational credentials</li>
                <li>Experience and specializations</li>
                <li>Professional background</li>
              </ul>
            </div>

            <div className="info-card">
              <h4>⏰ Review Timeline</h4>
              <p>Applications are typically reviewed within <strong>2-3 business days</strong>. You'll receive an email notification once the review is complete.</p>
            </div>

            <div className="info-card">
              <h4>❓ Questions?</h4>
              <p>If you have any questions about your application status, please contact our support team at <strong>support@therapease.com</strong></p>
            </div>
          </div>
        </div>

        <div className="verification-actions">
          <Link to="/login" className="btn btn--primary">
            Try Login Later
          </Link>
          <Link to="/" className="btn btn--light">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TherapistPending;
