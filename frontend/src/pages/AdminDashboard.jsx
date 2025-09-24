import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import UsersManagement from '../components/admin/UsersManagement.jsx';
import FlaggedPostsManagement from '../components/admin/FlaggedPostsManagement.jsx';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard.jsx';
import TherapistVerification from '../components/TherapistVerification.jsx';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert--error">
          {error}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'posts', label: 'Flagged Posts', icon: '🚩' },
    { id: 'therapists', label: 'Therapist Verification', icon: '🏥' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'users':
        return <UsersManagement />;
      case 'posts':
        return <FlaggedPostsManagement />;
      case 'therapists':
        return <TherapistVerification />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <div className="container">
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage users, moderate content, and monitor platform activity</p>
        </div>

        <div className="admin-tabs">
          <div className="tabs-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="tab-content">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
