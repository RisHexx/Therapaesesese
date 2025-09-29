import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingTherapistsCount, setPendingTherapistsCount] = useState(0);

  const fetchPendingTherapistsCount = async () => {
    try {
      console.log('🔍 Fetching pending therapists count for analytics...');
      
      // Try multiple endpoints to get pending therapists count
      const endpoints = [
        '/api/therapists/pending',
        '/api/admin/users?role=therapist&verified=false',
        '/api/admin/users?role=therapist&isVerified=false',
        '/api/admin/users?role=therapist'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Trying: ${endpoint}`);
          const res = await axios.get(endpoint);
          
          if (res.data.success && res.data.data) {
            let count = 0;
            
            if (endpoint === '/api/therapists/pending') {
              // Direct therapists endpoint
              const therapists = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
              count = therapists.length;
            } else {
              // Users endpoint - need to filter
              let users = [];
              if (res.data.data.users) {
                users = res.data.data.users;
              } else if (Array.isArray(res.data.data)) {
                users = res.data.data;
              }
              
              const unverifiedTherapists = users.filter(user => 
                user.role === 'therapist' && (!user.isVerified || !user.verified)
              );
              count = unverifiedTherapists.length;
            }
            
            console.log(`✅ Found ${count} pending therapists from ${endpoint}`);
            setPendingTherapistsCount(count);
            return; // Success, stop trying other endpoints
          }
        } catch (endpointErr) {
          console.log(`❌ ${endpoint} failed:`, endpointErr.response?.status);
        }
      }
      
      console.log('⚠️ All endpoints failed, setting count to 0');
      setPendingTherapistsCount(0);
    } catch (err) {
      console.error('❌ Error fetching pending therapists count:', err);
      setPendingTherapistsCount(0);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both analytics and pending therapists count
      const [analyticsPromise, pendingPromise] = await Promise.allSettled([
        axios.get('/api/admin/analytics'),
        fetchPendingTherapistsCount()
      ]);
      
      if (analyticsPromise.status === 'fulfilled') {
        setAnalytics(analyticsPromise.value.data.data);
      } else {
        console.error('Analytics fetch failed:', analyticsPromise.reason);
      }
      
      // pendingPromise handles its own state updates
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="admin-section">
        <div className="loading-state">
          <div className="loading-spinner">📊</div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-section">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Failed to Load Analytics</h3>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={fetchAnalytics}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Provide fallback data structure if analytics is incomplete
  const safeAnalytics = analytics || {};
  const overview = safeAnalytics.overview || {};
  const recentActivity = safeAnalytics.recentActivity || {};
  const alerts = safeAnalytics.alerts || {};

  const overviewCards = [
    { title: 'Total Users', value: overview.totalUsers || 0, icon: '👥', color: 'blue' },
    { title: 'Active Users', value: overview.activeUsers || 0, icon: '🟢', color: 'green' },
    { title: 'Total Posts', value: overview.totalPosts || 0, icon: '📝', color: 'purple' },
    { title: 'Flagged Posts', value: overview.flaggedPosts || 0, icon: '🚩', color: 'red' },
    { title: 'Therapists', value: overview.totalTherapists || 0, icon: '🏥', color: 'teal' },
    { 
      title: 'Pending Verifications', 
      value: pendingTherapistsCount, 
      icon: pendingTherapistsCount > 0 ? '🔔' : '⏳', 
      color: pendingTherapistsCount > 0 ? 'red' : 'orange',
      urgent: pendingTherapistsCount > 0
    }
  ];

  const activityItems = [
    { label: 'New Users Today', value: recentActivity.newUsersToday || 0 },
    { label: 'Posts Today', value: recentActivity.postsToday || 0 },
    { label: 'Reports Today', value: recentActivity.reportsToday || 0 },
    { label: 'Active Sessions', value: recentActivity.activeSessions || 0 }
  ];

  return (
    <div className="admin-section">
      <div className="admin-header">
        <div>
          <h2>Platform Analytics</h2>
          <p>Overview of platform activity and key metrics</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn--light btn--small" onClick={fetchAnalytics}>
            🔄 Refresh All
          </button>
          <button 
            className="btn btn--light btn--small" 
            onClick={() => {
              console.log('📊 Current analytics state:');
              console.log('- Analytics data:', analytics);
              console.log('- Pending therapists count:', pendingTherapistsCount);
              console.log('- Loading:', loading);
              console.log('- Error:', error);
            }}
          >
            🔍 Debug
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="analytics-grid">
        {overviewCards.map((card, index) => (
          <div 
            key={index} 
            className={`analytics-card analytics-card--${card.color} ${card.urgent ? 'analytics-card--urgent' : ''}`}
            style={card.urgent ? { 
              animation: 'pulse 2s infinite',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            } : {}}
          >
            <div className="analytics-card-icon">{card.icon}</div>
            <div className="analytics-card-content">
              <div className="analytics-card-value">
                {card.value.toLocaleString()}
                {card.urgent && <span style={{ fontSize: '12px', marginLeft: '4px' }}>!</span>}
              </div>
              <div className="analytics-card-title">{card.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="analytics-section">
        <h3>Recent Activity</h3>
        <div className="analytics-grid analytics-grid--activity">
          {activityItems.map((item, index) => (
            <div key={index} className="analytics-card analytics-card--activity">
              <div className="analytics-card-value">{item.value}</div>
              <div className="analytics-card-title">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts && Object.keys(alerts).length > 0 && (
        <div className="analytics-section">
          <h3>System Alerts</h3>
          <div className="alerts-grid">
            {alerts.highPriorityFlags && (
              <div className="alert-card">
                <div className="alert-header">
                  <h4>High Priority Flags</h4>
                  <span className="alert-count">{alerts.highPriorityFlags}</span>
                </div>
                <p>Posts requiring immediate attention</p>
              </div>
            )}
            {alerts.pendingVerifications && (
              <div className="alert-card">
                <div className="alert-header">
                  <h4>Pending Verifications</h4>
                  <span className="alert-count">{alerts.pendingVerifications}</span>
                </div>
                <p>Therapist applications awaiting review</p>
              </div>
            )}
            {alerts.systemHealth && (
              <div className="alert-card">
                <div className="alert-header">
                  <h4>System Health</h4>
                  <span className={`alert-priority ${alerts.systemHealth.toLowerCase()}`}>
                    {alerts.systemHealth}
                  </span>
                </div>
                <p>Overall platform status</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="analytics-footer">
        <span className="last-updated">
          Last updated: {new Date().toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
