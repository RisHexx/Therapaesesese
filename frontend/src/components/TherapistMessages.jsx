import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TherapistMessages = () => {
  const [contactRequests, setContactRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchContactRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/therapists/my-requests');
      
      if (response.data.success) {
        setContactRequests(response.data.data.contactRequests || []);
      } else {
        setError('Failed to fetch contact requests');
      }
    } catch (err) {
      console.error('Error fetching contact requests:', err);
      setError(err.response?.data?.message || 'Failed to fetch contact requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactRequests();
  }, []);

  const updateRequestStatus = async (requestId, status) => {
    try {
      setProcessingId(requestId);
      // Note: This endpoint might need to be implemented in the backend
      await axios.put(`/api/therapists/contact-requests/${requestId}/status`, { status });
      
      // Update local state
      setContactRequests(prev => 
        prev.map(request => 
          request._id === requestId 
            ? { ...request, status } 
            : request
        )
      );
    } catch (err) {
      console.error('Error updating request status:', err);
      alert('Failed to update request status');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'acknowledged': return '#3b82f6';
      case 'responded': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'acknowledged': return '👀';
      case 'responded': return '✅';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="admin-section">
        <div className="loading-state">
          <div className="loading-spinner">💬</div>
          <p>Loading your messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-section">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Failed to Load Messages</h3>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={fetchContactRequests}>
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
          <h2>Patient Messages</h2>
          <p>Contact requests and messages from patients</p>
        </div>
        <button className="btn btn--light" onClick={fetchContactRequests}>
          🔄 Refresh
        </button>
      </div>

      {contactRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Messages Yet</h3>
          <p>You haven't received any contact requests from patients yet.</p>
          <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--muted)' }}>
            <p>Patients can contact you through your therapist profile page.</p>
          </div>
        </div>
      ) : (
        <div className="messages-list">
          {contactRequests.map((request) => (
            <div key={request._id} className="message-card">
              <div className="message-header">
                <div className="patient-info">
                  <h3>{request.userId?.name || 'Unknown Patient'}</h3>
                  <p className="patient-email">{request.userId?.email}</p>
                  <p className="message-date">
                    Received: {formatDate(request.createdAt)}
                  </p>
                </div>
                
                <div className="message-status">
                  <span 
                    className="status-badge"
                    style={{ 
                      backgroundColor: getStatusColor(request.status),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {getStatusIcon(request.status)} {request.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="message-content">
                <h4>Message:</h4>
                <p className="message-text">{request.message}</p>
              </div>

              {request.contactInfo && (
                <div className="contact-info">
                  <h4>Contact Information:</h4>
                  <div className="contact-details">
                    {request.contactInfo.email && (
                      <div className="contact-item">
                        <strong>Email:</strong> 
                        <a href={`mailto:${request.contactInfo.email}`}>
                          {request.contactInfo.email}
                        </a>
                      </div>
                    )}
                    {request.contactInfo.phone && (
                      <div className="contact-item">
                        <strong>Phone:</strong> 
                        <a href={`tel:${request.contactInfo.phone}`}>
                          {request.contactInfo.phone}
                        </a>
                      </div>
                    )}
                    {request.contactInfo.preferredMethod && (
                      <div className="contact-item">
                        <strong>Preferred Contact:</strong> {request.contactInfo.preferredMethod}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="message-actions">
                {request.status === 'pending' && (
                  <button
                    className="btn btn--small btn--primary"
                    onClick={() => updateRequestStatus(request._id, 'acknowledged')}
                    disabled={processingId === request._id}
                  >
                    {processingId === request._id ? 'Processing...' : '👀 Mark as Seen'}
                  </button>
                )}
                {request.status === 'acknowledged' && (
                  <button
                    className="btn btn--small btn--success"
                    onClick={() => updateRequestStatus(request._id, 'responded')}
                    disabled={processingId === request._id}
                  >
                    {processingId === request._id ? 'Processing...' : '✅ Mark as Responded'}
                  </button>
                )}
                {request.status === 'responded' && (
                  <span className="responded-indicator">
                    ✅ You have responded to this message
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TherapistMessages;
