import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DashboardAdmin = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/dashboard/admin');
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
        <h2>Admin Dashboard</h2>
        <p style={{ marginTop: 8 }}>{data?.message}</p>
        <div className="stats" style={{ marginTop: 16 }}>
          <div className="stat"><span>Total Users</span><strong>{data?.stats?.totalUsers}</strong></div>
          <div className="stat"><span>Total Therapists</span><strong>{data?.stats?.totalTherapists}</strong></div>
          <div className="stat"><span>Total Admins</span><strong>{data?.stats?.totalAdmins}</strong></div>
          <div className="stat"><span>Total Registrations</span><strong>{data?.stats?.totalRegistrations}</strong></div>
        </div>
        <div style={{ marginTop: 16 }}>
          <h3>Recent Users</h3>
          <ul className="list">
            {data?.recentUsers?.map((u) => (
              <li key={u._id} className="list__item">
                <span>{u.name} - {u.email}</span>
                <span className={`badge badge--${u.role}`}>{u.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
