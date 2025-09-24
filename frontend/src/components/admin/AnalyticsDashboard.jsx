import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/analytics');
      setAnalytics(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
      console.error('Fetch analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard">
        <div className="alert alert--error">
          {error}
          <button 
            className="btn btn--small btn--light" 
            onClick={fetchAnalytics}
            style={{ marginLeft: '12px' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { overview, recentActivity, alerts } = analytics;

  const overviewCards = [
    { title: 'Total Users', value: overview.totalUsers, icon: '👥', color: 'blue' },
    { title: 'Active Users', value: overview.activeUsers, icon: '✅', color: 'green' },
    { title: 'Banned Users', value: overview.bannedUsers, icon: '🚫', color: 'red' },
    { title: 'Total Posts', value: overview.totalPosts, icon: '📝', color: 'purple' },
    { title: 'Active Posts', value: overview.activePosts, icon: '📄', color: 'blue' },
    { title: 'Flagged Posts', value: overview.flaggedPosts, icon: '🚩', color: 'orange' },
    { title: 'Total Journals', value: overview.totalJournals, icon: '📔', color: 'teal' },
    { title: 'Total Therapists', value: overview.totalTherapists, icon: '🏥', color: 'indigo' },
    { title: 'Verified Therapists', value: overview.verifiedTherapists, icon: '✅', color: 'green' },
    { title: 'Pending Verifications', value: overview.pendingTherapists, icon: '⏳', color: 'yellow' }
  ];

  const activityCards = [
    { title: 'New Users (30d)', value: recentActivity.newUsersLast30Days, icon: '👤' },
    { title: 'New Posts (30d)', value: recentActivity.newPostsLast30Days, icon: '📝' },
    { title: 'New Journals (30d)', value: recentActivity.newJournalsLast30Days, icon: '📔' },
    { title: 'New Therapists (30d)', value: recentActivity.newTherapistsLast30Days, icon: '🏥' }
  ];

  return (
    <div className="analytics-dashboard">
      <div className="analytics-section">
        <h2>Platform Overview</h2>
        <div className="analytics-grid">
          {overviewCards.map((card, index) => (
            <div key={index} className={`analytics-card analytics-card--${card.color}`}>
              <div className="analytics-card-icon">{card.icon}</div>
              <div className="analytics-card-content">
                <div className="analytics-card-value">{card.value.toLocaleString()}</div>
                <div className="analytics-card-title">{card.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-section">
        <h2>Recent Activity (Last 30 Days)</h2>
        <div className="analytics-grid analytics-grid--activity">
          {activityCards.map((card, index) => (
            <div key={index} className="analytics-card analytics-card--activity">
              <div className="analytics-card-icon">{card.icon}</div>
              <div className="analytics-card-content">
                <div className="analytics-card-value">{card.value.toLocaleString()}</div>
                <div className="analytics-card-title">{card.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-section">
        <h2>Alerts & Quick Actions</h2>
        <div className="alerts-grid">
          {/* Pending Therapist Verifications */}
          <div className="alert-card">
            <div className="alert-header">
              <h3>⏳ Pending Verifications</h3>
              <span className="alert-count">{alerts.pendingVerifications}</span>
            </div>
            <p>Therapist applications waiting for review</p>
            {alerts.pendingVerifications > 0 && (
              <div className="alert-action">
                <span className="alert-priority">Requires attention</span>
              </div>
            )}
          </div>

          {/* Banned Users */}
          <div className="alert-card">
            <div className="alert-header">
              <h3>🚫 Banned Users</h3>
              <span className="alert-count">{alerts.bannedUsers}</span>
            </div>
            <p>Currently banned user accounts</p>
          </div>

          {/* Top Flagged Posts */}
          <div className="alert-card alert-card--wide">
            <div className="alert-header">
              <h3>🚩 Most Flagged Posts</h3>
              <span className="alert-count">{alerts.topFlaggedPosts.length}</span>
            </div>
            {alerts.topFlaggedPosts.length > 0 ? (
              <div className="flagged-posts-preview">
                {alerts.topFlaggedPosts.map((post) => (
                  <div key={post._id} className="flagged-post-item">
                    <div className="flagged-post-content">
                      <span className="flagged-post-text">
                        {post.content.length > 100 
                          ? `${post.content.substring(0, 100)}...` 
                          : post.content
                        }
                      </span>
                      <div className="flagged-post-meta">
                        <span>By: {post.authorId?.name || 'Unknown'}</span>
                        <span className="flagged-post-flags">{post.flagCount} flags</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No flagged posts requiring attention</p>
            )}
          </div>
        </div>
      </div>

      <div className="analytics-footer">
        <button 
          className="btn btn--light" 
          onClick={fetchAnalytics}
        >
          🔄 Refresh Data
        </button>
        <span className="last-updated">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
