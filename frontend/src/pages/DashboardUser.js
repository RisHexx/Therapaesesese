import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DashboardUser = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/dashboard/user');
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
      <div className="card">
        <h2>User Dashboard</h2>
        <p style={{ marginTop: 8 }}>{data?.message}</p>
        <div className="stats">
          <div className="stat"><span>Total Sessions</span><strong>{data?.stats?.totalSessions}</strong></div>
          <div className="stat"><span>Upcoming Appointments</span><strong>{data?.stats?.upcomingAppointments}</strong></div>
          <div className="stat"><span>Completed Sessions</span><strong>{data?.stats?.completedSessions}</strong></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardUser;
