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
      
      // First try to get pending therapists
      let res = await axios.get('/api/therapists/pending');
      console.log('Pending therapists response:', res.data);
      
      // If no pending therapists, try to get debug info to see what's in the system
      if (!res.data.data || res.data.data.length === 0) {
        console.log('No pending therapists found, checking debug endpoint...');
        try {
          const debugRes = await axios.get('/api/therapists/debug/all');
          console.log('Debug therapists info:', debugRes.data);
          
          // Show unverified therapists from debug data
          const unverifiedTherapists = debugRes.data.data.therapists.filter(t => !t.verified);
          console.log('Unverified therapists found:', unverifiedTherapists);
          
          if (unverifiedTherapists.length > 0) {
            // Convert debug format to expected format
            const formattedTherapists = unverifiedTherapists.map(t => ({
              _id: t.id,
              userId: { name: t.name, email: t.email },
              specialization: t.specialization,
              verificationStatus: t.verificationStatus,
              createdAt: t.createdAt
            }));
            setPendingTherapists(formattedTherapists);
          }
        } catch (debugErr) {
          console.error('Debug endpoint error:', debugErr);
        }
      } else {
        setPendingTherapists(res.data.data);
      }
      
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending therapist applications');
      console.error('Fetch pending therapists error:', err);
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

      const res = await axios.put(`/api/therapists/verify/${therapistId}`, payload);

      if (res.data.success) {
        // Remove the therapist from pending list
        setPendingTherapists(prev => prev.filter(t => t._id !== therapistId));
        
        // Show success message (you could add a toast notification here)
        alert(`Therapist application ${approved ? 'approved' : 'rejected'} successfully!`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process verification');
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
    if (reason !== null) { // User didn't cancel
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

  const createTestTherapist = async () => {
    try {
      console.log('Creating test therapist...');
      const res = await axios.post('/api/therapists/debug/create-test');
      console.log('Test therapist response:', res.data);
      if (res.data.success) {
        alert('Test therapist created successfully!');
        fetchPendingTherapists(); // Refresh the list
      }
    } catch (err) {
      console.error('Create test therapist error:', err);
      alert(err.response?.data?.message || 'Failed to create test therapist');
    }
  };

  const createSimpleTestTherapist = async () => {
    try {
      console.log('Creating simple test therapist...');
      const res = await axios.post('/api/therapists/debug/create-simple');
      console.log('Simple test therapist response:', res.data);
      if (res.data.success) {
        alert('Simple test therapist created successfully!');
        fetchPendingTherapists(); // Refresh the list
      }
    } catch (err) {
      console.error('Create simple test therapist error:', err);
      alert(err.response?.data?.message || 'Failed to create simple test therapist');
    }
  };

  const createMissingProfiles = async () => {
    try {
      console.log('Creating missing therapist profiles...');
      const res = await axios.post('/api/therapists/debug/create-missing-profiles');
      console.log('Missing profiles response:', res.data);
      if (res.data.success) {
        alert(`Created ${res.data.data.createdProfiles} missing therapist profiles!\nTotal therapist users: ${res.data.data.totalTherapistUsers}\nExisting profiles: ${res.data.data.existingProfiles}\nNew profiles: ${res.data.data.createdProfiles}`);
        fetchPendingTherapists(); // Refresh the list
      }
    } catch (err) {
      console.error('Create missing profiles error:', err);
      alert(err.response?.data?.message || 'Failed to create missing profiles');
    }
  };

  const debugInfo = async () => {
    try {
      console.log('Fetching debug info...');
      const res = await axios.get('/api/therapists/debug/all');
      console.log('Debug info response:', res.data);
      alert(`Total therapists: ${res.data.data.total}, Verified: ${res.data.data.verified}, Pending: ${res.data.data.pending}`);
    } catch (err) {
      console.error('Debug info error:', err);
      alert('Failed to fetch debug info: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h3>Therapist Verification</h3>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading pending applications...
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>Therapist Verification</h3>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn--light btn--small" 
            onClick={debugInfo}
            style={{ fontSize: '11px' }}
          >
            🔍 Debug
          </button>
          <button 
            className="btn btn--primary btn--small" 
            onClick={createMissingProfiles}
            style={{ fontSize: '11px' }}
          >
            🔧 Fix Missing
          </button>
          <button 
            className="btn btn--light btn--small" 
            onClick={createSimpleTestTherapist}
            style={{ fontSize: '11px' }}
          >
            🧪 Simple
          </button>
          <button 
            className="btn btn--light btn--small" 
            onClick={createTestTherapist}
            style={{ fontSize: '11px' }}
          >
            👤 Full
          </button>
        </div>
      </div>
      
      {error && (
        <div className="alert alert--error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {pendingTherapists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>
          <h4>No pending therapist applications</h4>
          <p>This could mean:</p>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>No therapists have registered yet</li>
            <li>All therapists are already verified</li>
            <li>There's an issue with the API call</li>
          </ul>
          <div style={{ marginTop: '16px' }}>
            <p><strong>Troubleshooting steps:</strong></p>
            <ol style={{ textAlign: 'left', display: 'inline-block' }}>
              <li>Click "🔍 Debug Info" to see all therapists in the system</li>
              <li>Click "🧪 Create Test" to create a test therapist application</li>
              <li>Check browser console for error messages</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="verification-list">
          {pendingTherapists.map((therapist) => (
            <div key={therapist._id} className="verification-item">
              <div className="therapist-application">
                <div className="application-header">
                  <div className="applicant-info">
                    <h4>{therapist.userId?.name}</h4>
                    <p className="applicant-email">{therapist.userId?.email}</p>
                    <p className="application-date">
                      Applied: {formatDate(therapist.createdAt)}
                    </p>
                  </div>
                  
                  <div className="verification-actions">
                    <button
                      className="btn btn--small btn--primary"
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
                    <h5>Professional Information</h5>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>License Number:</strong>
                        <span>{therapist.licenseNumber}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Experience:</strong>
                        <span>{therapist.experience} years</span>
                      </div>
                      <div className="detail-item">
                        <strong>Specializations:</strong>
                        <span>{therapist.specialization?.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h5>Contact Information</h5>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>Email:</strong>
                        <span>{therapist.contactInfo?.email}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Phone:</strong>
                        <span>{therapist.contactInfo?.phone}</span>
                      </div>
                      {therapist.contactInfo?.address && (
                        <div className="detail-item">
                          <strong>Location:</strong>
                          <span>
                            {therapist.contactInfo.address.state || 'Not specified'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {therapist.education && (
                    <div className="detail-section">
                      <h5>Education</h5>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <strong>Degree:</strong>
                          <span>{therapist.education.degree}</span>
                        </div>
                        <div className="detail-item">
                          <strong>Institution:</strong>
                          <span>{therapist.education.institution}</span>
                        </div>
                        <div className="detail-item">
                          <strong>Year:</strong>
                          <span>{therapist.education.year}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {therapist.bio && (
                    <div className="detail-section">
                      <h5>Bio</h5>
                      <p className="bio-text">{therapist.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TherapistVerification;
