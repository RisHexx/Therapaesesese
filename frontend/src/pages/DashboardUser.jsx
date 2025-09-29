import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard.jsx';

const DashboardUser = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);

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

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      setPostsError(null);
      const res = await axios.get('/api/posts/my-posts');
      setUserPosts(res.data.data.posts || []);
    } catch (err) {
      setPostsError(err.response?.data?.message || 'Failed to fetch your posts');
      console.error('Fetch user posts error:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'posts' && userPosts.length === 0) {
      fetchUserPosts();
    }
  };

  const handlePostUpdated = (updatedPost) => {
    setUserPosts(userPosts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const handlePostDeleted = (postId) => {
    setUserPosts(userPosts.filter(post => post._id !== postId));
  };

  if (loading) return <div className="container"><div className="card">Loading...</div></div>;

  return (
    <div className="container">
      <div className="card">
        <h2>User Dashboard</h2>
        <p style={{ marginTop: 8 }}>{data?.message}</p>
        
        {/* Tab Navigation */}
        <div className="tabs-nav" style={{ marginTop: '24px' }}>
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-label">Overview</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => handleTabChange('posts')}
          >
            <span className="tab-icon">📝</span>
            <span className="tab-label">My Posts</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{ marginTop: '24px' }}>
            <div className="stats">
              <div className="stat"><span>Total Sessions</span><strong>{data?.stats?.totalSessions}</strong></div>
              <div className="stat"><span>Upcoming Appointments</span><strong>{data?.stats?.upcomingAppointments}</strong></div>
              <div className="stat"><span>Completed Sessions</span><strong>{data?.stats?.completedSessions}</strong></div>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div style={{ marginTop: '24px' }}>
            <div className="posts-header">
              <h3>My Posts</h3>
              <p className="muted">View and manage all your community posts</p>
            </div>

            {postsError && (
              <div className="alert alert--error" style={{ marginBottom: '20px' }}>
                {postsError}
              </div>
            )}

            {postsLoading ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                Loading your posts...
              </div>
            ) : userPosts.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <h4>No posts yet</h4>
                <p className="muted">You haven't created any posts yet. Visit the Community Posts page to share your thoughts!</p>
                <a href="/posts" className="btn btn--primary" style={{ marginTop: '16px' }}>
                  Go to Community
                </a>
              </div>
            ) : (
              <div className="posts-feed">
                {userPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onPostUpdated={handlePostUpdated}
                    onPostDeleted={handlePostDeleted}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardUser;
