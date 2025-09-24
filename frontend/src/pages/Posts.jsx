import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreatePost from '../components/CreatePost.jsx';
import PostCard from '../components/PostCard.jsx';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/posts/getAll?page=${page}&limit=10`);
      setPosts(res.data.data.posts);
      setPagination(res.data.data.pagination);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch posts');
      console.error('Fetch posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreatePost(false);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchPosts(page);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Loading posts...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="posts-header">
        <h1>Community Posts</h1>
        <button 
          className="btn btn--primary"
          onClick={() => setShowCreatePost(!showCreatePost)}
        >
          {showCreatePost ? 'Cancel' : 'Create Post'}
        </button>
      </div>

      {error && (
        <div className="alert alert--error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {showCreatePost && (
        <CreatePost 
          onPostCreated={handlePostCreated}
          onCancel={() => setShowCreatePost(false)}
        />
      )}

      <div className="posts-feed">
        {posts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <h3>No posts yet</h3>
            <p>Be the first to share something with the community!</p>
            <button 
              className="btn btn--primary"
              onClick={() => setShowCreatePost(true)}
            >
              Create First Post
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
            />
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn--light"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrevPage}
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button
            className="btn btn--light"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Posts;
