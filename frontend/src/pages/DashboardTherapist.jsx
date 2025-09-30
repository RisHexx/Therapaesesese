import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TherapistMessages from '../components/TherapistMessages.jsx';

const DashboardTherapist = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/dashboard/therapist');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="container"><div className="card">Loading...</div></div>;

  return (
    <div className="container">
      <div className="dashboard-container">
        <h1>Therapist Dashboard</h1>
        
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            💬 Patient Messages
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="card">
                <h2>Professional Information</h2>
                <p style={{ marginTop: 8 }}>{data?.message}</p>
                <div className="details" style={{ marginTop: 12 }}>
                  <div><strong>Specialization:</strong> {data?.therapist?.specialization}</div>
                  <div><strong>License Number:</strong> {data?.therapist?.licenseNumber}</div>
                  <div><strong>Experience:</strong> {data?.therapist?.experience} years</div>
                </div>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <h3>Contact Statistics</h3>
                <div className="stats" style={{ marginTop: 16 }}>
                  <div className="stat">
                    <span>Total Contact Requests</span>
                    <strong>{data?.stats?.totalContacts || 0}</strong>
                  </div>
                  <div className="stat">
                    <span>Pending Messages</span>
                    <strong>{data?.stats?.pendingMessages || 0}</strong>
                  </div>
                  <div className="stat">
                    <span>Response Rate</span>
                    <strong>{data?.stats?.responseRate || '100%'}</strong>
                  </div>
                  <div className="stat">
                    <span>Profile Views</span>
                    <strong>{data?.stats?.profileViews || 0}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <TherapistMessages />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTherapist;
