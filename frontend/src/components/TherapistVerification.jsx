import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TherapistVerification = () => {
  const [pendingTherapists, setPendingTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchPendingTherapists = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try the dedicated therapists endpoint first
      const response = await axios.get('/api/therapists/pending');
      
      if (response.data.success) {
        const therapists = Array.isArray(response.data.data) 
          ? response.data.data 
          : (response.data.data ? [response.data.data] : []);
        
        setPendingTherapists(therapists);
      } else {
        setPendingTherapists([]);
      }
      
    } catch (err) {
      console.error('Error fetching pending therapists:', err);
      
      // Only set error for actual server errors, not empty results
      if (err.response?.status >= 500) {
        setError('Server error while fetching therapist applications');
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        setError('Unable to connect to server. Please check if the backend is running.');
      } else {
        // For other errors (like 404, 401), just show empty state
        setPendingTherapists([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTherapists();
  }, []);

  const handleVerification = async (therapistId, approved, rejectionReason = '') => {
    try {
      setProcessingId(therapistId);
      setError(null);

      const payload = { approved };
      if (!approved && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      const response = await axios.put(`/api/therapists/verify/${therapistId}`, payload);
      
      if (response.data.success) {
        // Remove the therapist from pending list
        setPendingTherapists(prev => prev.filter(t => t._id !== therapistId));
        
        // Show success message
        const action = approved ? 'approved' : 'rejected';
        alert(`Therapist application ${action} successfully!`);
      } else {
        throw new Error('Verification failed');
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to process verification';
      setError(errorMessage);
      console.error('Verification error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = (therapistId) => {
    if (window.confirm('Are you sure you want to approve this therapist application?')) {
      handleVerification(therapistId, true);
    }
  };

  const handleReject = (therapistId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason !== null) {
      handleVerification(therapistId, false, reason);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  if (loading) {
    return (
      <div className="admin-section">
        <div className="loading-state">
          <div className="loading-spinner">🏥</div>
          <p>Loading therapist applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-section">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Failed to Load Applications</h3>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={fetchPendingTherapists}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-header">
        <div>
          <h2>Therapist Verification</h2>
          <p>Review and approve therapist applications</p>
        </div>
        <button className="btn btn--light" onClick={fetchPendingTherapists}>
          🔄 Refresh
        </button>
      </div>
      
      {error && (
        <div className="alert alert--error" style={{ marginBottom: '16px' }}>
          <strong>⚠️ Error:</strong> {error}
          <button className="btn btn--primary btn--small" onClick={fetchPendingTherapists} style={{ marginLeft: '12px' }}>
            🔄 Retry
          </button>
        </div>
      )}

      {!error && pendingTherapists.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Pending Applications</h3>
          <p>All therapist applications have been processed. New applications will appear here when therapists sign up.</p>
        </div>
      ) : !error && (
        <div className="therapist-applications-list">
          {pendingTherapists.map((therapist) => (
            <div key={therapist._id} className="therapist-application-card">
              <div className="application-header">
                <div className="applicant-info">
                  <h3>{therapist.userId?.name || 'Unknown Applicant'}</h3>
                  <p className="applicant-email">{therapist.userId?.email}</p>
                  <p className="application-date">
                    Applied: {formatDate(therapist.createdAt)}
                  </p>
                </div>
                
                <div className="verification-actions">
                  <button
                    className="btn btn--small btn--success"
                    onClick={() => handleApprove(therapist._id)}
                    disabled={processingId === therapist._id}
                  >
                    {processingId === therapist._id ? 'Processing...' : '✓ Approve'}
                  </button>
                  <button
                    className="btn btn--small btn--danger"
                    onClick={() => handleReject(therapist._id)}
                    disabled={processingId === therapist._id}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>

              <div className="application-details">
                <div className="detail-section">
                  <h4>Professional Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>License Number:</strong>
                      <span>{therapist.licenseNumber || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Experience:</strong>
                      <span>{therapist.experience || 0} years</span>
                    </div>
                    <div className="detail-item">
                      <strong>Specializations:</strong>
                      <span>{Array.isArray(therapist.specialization) ? therapist.specialization.join(', ') : (therapist.specialization || 'Not specified')}</span>
                    </div>
                  </div>
                </div>

                {therapist.contactInfo && (
                  <div className="detail-section">
                    <h4>Contact Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>Email:</strong>
                        <span>{therapist.contactInfo.email || therapist.userId?.email}</span>
                      </div>
                      {therapist.contactInfo.phone && (
                        <div className="detail-item">
                          <strong>Phone:</strong>
                          <span>{therapist.contactInfo.phone}</span>
                        </div>
                      )}
                      {therapist.contactInfo.address?.state && (
                        <div className="detail-item">
                          <strong>Location:</strong>
                          <span>{therapist.contactInfo.address.state}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {therapist.education && (
                  <div className="detail-section">
                    <h4>Education</h4>
                    <div className="detail-grid">
                      {therapist.education.degree && (
                        <div className="detail-item">
                          <strong>Degree:</strong>
                          <span>{therapist.education.degree}</span>
                        </div>
                      )}
                      {therapist.education.institution && (
                        <div className="detail-item">
                          <strong>Institution:</strong>
                          <span>{therapist.education.institution}</span>
                        </div>
                      )}
                      {therapist.education.year && (
                        <div className="detail-item">
                          <strong>Year:</strong>
                          <span>{therapist.education.year}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {therapist.bio && (
                  <div className="detail-section">
                    <h4>Professional Bio</h4>
                    <p className="bio-text">{therapist.bio}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TherapistVerification;
