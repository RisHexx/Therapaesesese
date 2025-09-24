import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DashboardTherapist = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <div className="card">
        <h2>Therapist Dashboard</h2>
        <p style={{ marginTop: 8 }}>{data?.message}</p>
        <div className="details" style={{ marginTop: 12 }}>
          <div><strong>Specialization:</strong> {data?.therapist?.specialization}</div>
          <div><strong>License Number:</strong> {data?.therapist?.licenseNumber}</div>
          <div><strong>Experience:</strong> {data?.therapist?.experience} years</div>
        </div>
        <div className="stats" style={{ marginTop: 16 }}>
          <div className="stat"><span>Total Patients</span><strong>{data?.stats?.totalPatients}</strong></div>
          <div className="stat"><span>Today's Appointments</span><strong>{data?.stats?.todayAppointments}</strong></div>
          <div className="stat"><span>Monthly Revenue</span><strong>${data?.stats?.monthlyRevenue}</strong></div>
          <div className="stat"><span>Average Rating</span><strong>{data?.stats?.averageRating}</strong></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTherapist;
