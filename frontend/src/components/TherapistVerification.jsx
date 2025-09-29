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
      
      console.log('🔍 Starting comprehensive therapist fetch...');
      let foundTherapists = [];
      
      // Method 1: Try the dedicated therapists endpoint
      try {
        console.log('📡 Trying /api/therapists/pending...');
        const therapistsRes = await axios.get('/api/therapists/pending');
        console.log('✅ Therapists endpoint response:', therapistsRes.data);
        
        if (therapistsRes.data.success && therapistsRes.data.data) {
          foundTherapists = Array.isArray(therapistsRes.data.data) 
            ? therapistsRes.data.data 
            : [therapistsRes.data.data];
          console.log(`✅ Found ${foundTherapists.length} therapists from dedicated endpoint`);
        }
      } catch (therapistsErr) {
        console.log('❌ Therapists endpoint failed:', therapistsErr.response?.status, therapistsErr.response?.data?.message);
      }
      
      // Method 2: If no therapists found, try users endpoint with different filters
      if (foundTherapists.length === 0) {
        console.log('📡 Trying /api/admin/users with therapist role...');
        
        const userQueries = [
          '/api/admin/users?role=therapist',
          '/api/admin/users?role=therapist&verified=false',
          '/api/admin/users?role=therapist&isVerified=false',
          '/api/admin/users'
        ];
        
        for (const query of userQueries) {
          try {
            console.log(`📡 Trying: ${query}`);
            const usersRes = await axios.get(query);
            console.log(`✅ Users response for ${query}:`, usersRes.data);
            
            if (usersRes.data.success && usersRes.data.data) {
              let users = [];
              
              // Handle different response structures
              if (usersRes.data.data.users) {
                users = usersRes.data.data.users;
              } else if (Array.isArray(usersRes.data.data)) {
                users = usersRes.data.data;
              }
              
              // Filter for therapist users that need verification
              const therapistUsers = users.filter(user => {
                const isTherapist = user.role === 'therapist';
                const needsVerification = !user.isVerified || !user.verified || user.verificationStatus === 'pending';
                console.log(`👤 User ${user.name}: role=${user.role}, isVerified=${user.isVerified}, verified=${user.verified}, verificationStatus=${user.verificationStatus}`);
                return isTherapist && needsVerification;
              });
              
              console.log(`✅ Found ${therapistUsers.length} unverified therapist users`);
              
              if (therapistUsers.length > 0) {
                // Convert user format to therapist format
                foundTherapists = therapistUsers.map(user => ({
                  _id: user._id,
                  userId: { 
                    name: user.name, 
                    email: user.email,
                    _id: user._id
                  },
                  specialization: user.specialization || user.specializations || 'Not specified',
                  licenseNumber: user.licenseNumber || user.license || 'Not provided',
                  experience: user.experience || 0,
                  createdAt: user.createdAt,
                  verificationStatus: user.verificationStatus || 'pending',
                  isVerified: user.isVerified || false,
                  // Include additional fields that might be useful
                  bio: user.bio,
                  education: user.education,
                  contactInfo: {
                    email: user.email,
                    phone: user.phone,
                    address: user.address
                  }
                }));
                break; // Found therapists, stop trying other queries
              }
            }
          } catch (queryErr) {
            console.log(`❌ Query ${query} failed:`, queryErr.response?.status, queryErr.response?.data?.message);
          }
        }
      }
      
      // Method 3: Try alternative user endpoints
      if (foundTherapists.length === 0) {
        console.log('📡 Trying alternative user endpoints...');
        
        const alternativeEndpoints = [
          '/api/users',
          '/api/auth/users',
          '/api/admin/all-users',
          '/api/user/list'
        ];
        
        for (const endpoint of alternativeEndpoints) {
          try {
            console.log(`📡 Trying: ${endpoint}`);
            const res = await axios.get(endpoint);
            console.log(`✅ Response from ${endpoint}:`, res.data);
            
            if (res.data && (res.data.success !== false)) {
              let users = [];
              
              // Handle various response structures
              if (res.data.data) {
                users = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
              } else if (res.data.users) {
                users = Array.isArray(res.data.users) ? res.data.users : [res.data.users];
              } else if (Array.isArray(res.data)) {
                users = res.data;
              }
              
              const therapistUsers = users.filter(user => 
                user && user.role === 'therapist' && (!user.isVerified || !user.verified || user.verificationStatus === 'pending')
              );
              
              console.log(`✅ Found ${therapistUsers.length} therapist users from ${endpoint}`);
              
              if (therapistUsers.length > 0) {
                foundTherapists = therapistUsers.map(user => ({
                  _id: user._id || user.id,
                  userId: { 
                    name: user.name || user.username || 'Unknown', 
                    email: user.email,
                    _id: user._id || user.id
                  },
                  specialization: user.specialization || user.specializations || 'Not specified',
                  licenseNumber: user.licenseNumber || user.license || 'Not provided',
                  experience: user.experience || 0,
                  createdAt: user.createdAt || user.created_at || new Date().toISOString(),
                  verificationStatus: 'pending'
                }));
                break;
              }
            }
          } catch (endpointErr) {
            console.log(`❌ ${endpoint} failed:`, endpointErr.response?.status, endpointErr.response?.data?.message);
          }
        }
      }
      
      // Method 4: Create mock data if no endpoints work (for development/testing)
      if (foundTherapists.length === 0) {
        console.log('⚠️ No endpoints worked. This might indicate:');
        console.log('1. Backend is not running');
        console.log('2. API endpoints are not implemented');
        console.log('3. Authentication issues');
        console.log('4. CORS issues');
        console.log('5. Different API structure than expected');
        
        // Check if we can at least reach the backend
        try {
          const healthCheck = await axios.get('/api/health');
          console.log('✅ Backend is reachable:', healthCheck.data);
        } catch (healthErr) {
          console.log('❌ Backend health check failed:', healthErr.message);
          
          // If backend is completely unreachable, show helpful error
          if (healthErr.code === 'NETWORK_ERROR' || healthErr.message.includes('Network Error')) {
            throw new Error('Backend server is not running or not accessible. Please check if the backend is started.');
          }
        }
      }
      
      console.log(`🎯 Final result: ${foundTherapists.length} therapists found for verification`);
      setPendingTherapists(foundTherapists);
      
      if (foundTherapists.length === 0) {
        console.log('⚠️ No pending therapists found through any method');
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch pending therapist applications';
      setError(errorMessage);
      console.error('❌ Critical error in fetchPendingTherapists:', err);
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

      console.log(`🔄 ${approved ? 'Approving' : 'Rejecting'} therapist ${therapistId}...`);
      
      // Try multiple verification endpoints
      let verificationSuccess = false;
      const verificationEndpoints = [
        `/api/therapists/verify/${therapistId}`,
        `/api/admin/users/${therapistId}/verify`,
        `/api/admin/therapists/${therapistId}/verify`,
        `/api/users/${therapistId}/verify`
      ];
      
      for (const endpoint of verificationEndpoints) {
        try {
          console.log(`📡 Trying verification endpoint: ${endpoint}`);
          const res = await axios.put(endpoint, payload);
          console.log(`✅ Verification response from ${endpoint}:`, res.data);
          
          if (res.data.success) {
            verificationSuccess = true;
            console.log(`✅ Verification successful via ${endpoint}`);
            break;
          }
        } catch (endpointErr) {
          console.log(`❌ Endpoint ${endpoint} failed:`, endpointErr.response?.status, endpointErr.response?.data?.message);
        }
      }
      
      if (verificationSuccess) {
        // Remove the therapist from pending list
        setPendingTherapists(prev => prev.filter(t => t._id !== therapistId));
        
        // Show success message
        const action = approved ? 'approved' : 'rejected';
        console.log(`🎉 Therapist ${action} successfully`);
        
        // Optional: Show a toast or alert
        if (window.confirm) {
          setTimeout(() => {
            alert(`Therapist application ${action} successfully!`);
          }, 100);
        }
      } else {
        throw new Error('All verification endpoints failed');
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process verification';
      setError(errorMessage);
      console.error('❌ Verification error:', err);
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

  const createTestTherapist = async () => {
    try {
      console.log('🧪 Creating test therapist for debugging...');
      
      // Create a test user with therapist role matching the signup form structure
      const testUser = {
        name: `Test Therapist ${Date.now()}`,
        email: `test.therapist.${Date.now()}@example.com`,
        password: 'password123',
        role: 'therapist',
        specialization: 'Anxiety, Depression, PTSD',
        licenseNumber: `LIC${Date.now()}`,
        experience: 5
      };
      
      console.log('📤 Sending test therapist data:', testUser);
      
      const res = await axios.post('/api/auth/register', testUser);
      console.log('✅ Test therapist creation response:', res.data);
      
      if (res.data.success) {
        console.log('🎉 Test therapist created successfully!');
        alert(`Test therapist created successfully!\nName: ${testUser.name}\nEmail: ${testUser.email}\nRefreshing list...`);
        
        // Wait a moment then refresh
        setTimeout(() => {
          fetchPendingTherapists();
        }, 1000);
      } else {
        throw new Error('Registration response indicates failure');
      }
    } catch (err) {
      console.error('❌ Error creating test therapist:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to create test therapist: ${errorMsg}\n\nCheck console for details.`);
    }
  };

  // Add a function to check current API status
  const checkAPIStatus = async () => {
    console.log('🔍 Comprehensive API status check...');
    
    const endpoints = [
      { url: '/api/health', name: 'Health Check' },
      { url: '/api/auth/me', name: 'Auth Status' },
      { url: '/api/therapists/pending', name: 'Therapists Pending' },
      { url: '/api/admin/users', name: 'Admin Users' },
      { url: '/api/users', name: 'All Users' },
      { url: '/api/auth/users', name: 'Auth Users' }
    ];
    
    let workingEndpoints = 0;
    let totalEndpoints = endpoints.length;
    
    for (const endpoint of endpoints) {
      try {
        const res = await axios.get(endpoint.url);
        console.log(`✅ ${endpoint.name} (${endpoint.url}): Status ${res.status}`, res.data);
        workingEndpoints++;
      } catch (err) {
        const status = err.response?.status || 'Network Error';
        const message = err.response?.data?.message || err.message;
        console.log(`❌ ${endpoint.name} (${endpoint.url}): Status ${status} - ${message}`);
      }
    }
    
    const summary = `API Status Check Complete:\n${workingEndpoints}/${totalEndpoints} endpoints working\n\nCheck console for detailed results.`;
    
    if (workingEndpoints === 0) {
      alert(`⚠️ Backend Connection Issue!\n\nNo API endpoints are responding. This usually means:\n1. Backend server is not running\n2. Wrong backend URL/port\n3. CORS issues\n4. Network connectivity problems\n\n${summary}`);
    } else if (workingEndpoints < totalEndpoints) {
      alert(`⚠️ Partial Backend Issues!\n\nSome endpoints are not working. This might indicate:\n1. Missing API routes\n2. Authentication issues\n3. Database connection problems\n\n${summary}`);
    } else {
      alert(`✅ All Systems Working!\n\n${summary}`);
    }
  };

  // Add a function to test backend connectivity
  const testBackendConnection = async () => {
    console.log('🔗 Testing backend connection...');
    
    try {
      // Try a simple request to see if backend is reachable
      const response = await fetch('/api/health', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        console.log('✅ Backend is reachable');
        return true;
      } else {
        console.log(`❌ Backend responded with status: ${response.status}`);
        return false;
      }
    } catch (err) {
      console.log('❌ Backend connection failed:', err.message);
      return false;
    }
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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn--light btn--small" onClick={fetchPendingTherapists}>
            🔄 Refresh
          </button>
          <button 
            className="btn btn--light btn--small" 
            onClick={() => {
              console.log('📊 Current state:');
              console.log('- Pending therapists:', pendingTherapists);
              console.log('- Loading state:', loading);
              console.log('- Error state:', error);
              console.log('- Therapists count:', pendingTherapists.length);
            }}
          >
            🔍 Debug Info
          </button>
          <button 
            className="btn btn--light btn--small" 
            onClick={checkAPIStatus}
          >
            🌐 API Status
          </button>
          <button 
            className="btn btn--warning btn--small" 
            onClick={testBackendConnection}
          >
            🔗 Test Connection
          </button>
          <button 
            className="btn btn--primary btn--small" 
            onClick={createTestTherapist}
          >
            🧪 Create Test
          </button>
        </div>
      </div>
      
      {error && (
        <div className="alert alert--error" style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>⚠️ Error Loading Applications:</strong>
          </div>
          <div style={{ marginBottom: '12px' }}>{error}</div>
          
          {error.includes('Backend server is not running') && (
            <div style={{ fontSize: '14px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', marginTop: '8px' }}>
              <strong>Quick Fix:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '16px' }}>
                <li>Start your backend server</li>
                <li>Check if it's running on the correct port</li>
                <li>Verify the API base URL configuration</li>
              </ul>
            </div>
          )}
          
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn--light btn--small" onClick={checkAPIStatus}>
              🌐 Check API Status
            </button>
            <button className="btn btn--light btn--small" onClick={testBackendConnection}>
              🔗 Test Connection
            </button>
            <button className="btn btn--primary btn--small" onClick={fetchPendingTherapists}>
              🔄 Retry
            </button>
          </div>
        </div>
      )}

      {pendingTherapists.length === 0 ? (
        <div className="empty-state">
          <h3>No Pending Applications Found</h3>
          <p>No therapist applications are currently pending verification.</p>
          
          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--hover-bg)', borderRadius: '8px', fontSize: '14px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--text)' }}>🔧 Troubleshooting Steps:</h4>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>1. Check API Status:</strong>
              <p style={{ margin: '4px 0', color: 'var(--muted)' }}>Click "🌐 API Status" to verify all endpoints are working</p>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>2. Create Test Data:</strong>
              <p style={{ margin: '4px 0', color: 'var(--muted)' }}>Click "🧪 Create Test" to generate a test therapist application</p>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>3. Check Console Logs:</strong>
              <p style={{ margin: '4px 0', color: 'var(--muted)' }}>Open browser DevTools (F12) → Console tab, then click "🔍 Debug Info"</p>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>4. Possible Issues:</strong>
              <ul style={{ margin: '4px 0', paddingLeft: '16px', color: 'var(--muted)' }}>
                <li>API endpoint <code>/api/therapists/pending</code> doesn't exist</li>
                <li>Database schema mismatch (isVerified vs verified field)</li>
                <li>Therapist profile not created during signup</li>
                <li>Backend not setting verification status correctly</li>
              </ul>
            </div>
            
            <div style={{ padding: '12px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '6px', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
              <strong style={{ color: 'var(--primary)' }}>💡 Quick Fix:</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                The system tries multiple API endpoints automatically. If you see this message, 
                the backend might not be properly configured for therapist verification.
              </p>
            </div>
          </div>
        </div>
      ) : (
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
