import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FlaggedPostsManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    minFlags: 1,
    page: 1,
    limit: 10
  });
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);

  const fetchFlaggedPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const res = await axios.get(`/api/admin/posts/flagged?${params.toString()}`);
      setPosts(res.data.data.posts || []);
      setPagination(res.data.data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch flagged posts');
      console.error('Fetch flagged posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedPosts();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePostAction = async (postId, action, reason = '') => {
    try {
      setActionLoading(postId);
      setError(null);

      const payload = { action };
      if (reason) payload.reason = reason;

      const res = await axios.put(`/api/admin/posts/${postId}/moderate`, payload);
      
      if (res.data.success) {
        // Remove post from list if deleted, or update status
        if (action === 'delete') {
          setPosts(prev => prev.filter(post => post._id !== postId));
        } else {
          setPosts(prev => prev.map(post => 
            post._id === postId 
              ? { ...post, status: action === 'approve' ? 'approved' : 'hidden' }
              : post
          ));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} post`);
      console.error(`${action} post error:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePost = (postId, postContent) => {
    const reason = prompt(`Reason for deleting this post:\n"${postContent.substring(0, 100)}..."`);
    if (reason !== null) {
      handlePostAction(postId, 'delete', reason);
    }
  };

  const handleHidePost = (postId) => {
    if (window.confirm('Are you sure you want to hide this post?')) {
      handlePostAction(postId, 'hide');
    }
  };

  const handleApprovePost = (postId) => {
    if (window.confirm('Are you sure you want to approve this post and clear all flags?')) {
      handlePostAction(postId, 'approve');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  if (loading) {
    return (
      <div className="admin-section">
        <div className="loading-state">
          <div className="loading-spinner">🚩</div>
          <p>Loading flagged posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-section">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Failed to Load Flagged Posts</h3>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={fetchFlaggedPosts}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h2>Flagged Posts Management</h2>
        <p>Review and moderate posts reported by users</p>
      </div>

      {/* Filters */}
      <div className="flagged-posts-filters">
        <div className="filter-group">
          <label>Minimum Flags</label>
          <select 
            value={filters.minFlags} 
            onChange={(e) => handleFilterChange('minFlags', parseInt(e.target.value))}
          >
            <option value={1}>1+ flags</option>
            <option value={2}>2+ flags</option>
            <option value={3}>3+ flags</option>
            <option value={5}>5+ flags</option>
          </select>
        </div>

        <button className="btn btn--light" onClick={fetchFlaggedPosts}>
          🔄 Refresh
        </button>
      </div>

      {/* Flagged Posts List */}
      <div className="flagged-posts-list">
        {posts.length === 0 ? (
          <div className="empty-state">
            <h3>No flagged posts found</h3>
            <p>All posts are clean or try adjusting your filters.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="flagged-post-card">
              <div className="flagged-post-header">
                <div className="post-author">
                  <strong>{post.authorId?.name || 'Unknown User'}</strong>
                  <span className="post-role">{post.authorId?.role || 'user'}</span>
                  <span className="post-date">{formatDate(post.createdAt)}</span>
                </div>
                
                <div className="flag-info">
                  <span className="flag-count">🚩 {post.flagCount} flags</span>
                </div>
              </div>

              <div className="flagged-post-content">
                <div className="post-text">
                  {expandedPost === post._id ? (
                    <span>{post.content}</span>
                  ) : (
                    <span>
                      {post.content.length > 200 
                        ? `${post.content.substring(0, 200)}...` 
                        : post.content
                      }
                    </span>
                  )}
                  {post.content.length > 200 && (
                    <button 
                      className="btn-link"
                      onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
                    >
                      {expandedPost === post._id ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
                <div className="post-replies-info">
                  {post.replyCount > 0 && `${post.replyCount} replies`}
                </div>
              </div>

              {/* Flag Details */}
              <div className="flagged-post-flags">
                <h4>Flag Reports</h4>
                <div className="flags-list">
                  {post.flags?.map((flag, index) => (
                    <div key={index} className="flag-item">
                      <div className="flag-user">
                        <strong>{flag.userId?.name || 'Anonymous'}</strong>
                        <span className="flag-reason">{flag.reason}</span>
                      </div>
                      <span className="flag-date">{formatDate(flag.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flagged-post-actions">
                <div className="post-stats">
                  <span>Posted: {formatDate(post.createdAt)}</span>
                  <span>Flags: {post.flagCount}</span>
                </div>
                
                <div className="action-buttons">
                  <button
                    className="btn btn--small btn--success"
                    onClick={() => handleApprovePost(post._id)}
                    disabled={actionLoading === post._id}
                  >
                    {actionLoading === post._id ? 'Processing...' : '✓ Approve'}
                  </button>
                  <button
                    className="btn btn--small btn--light"
                    onClick={() => handleHidePost(post._id)}
                    disabled={actionLoading === post._id}
                  >
                    👁️ Hide
                  </button>
                  <button
                    className="btn btn--small btn--danger"
                    onClick={() => handleDeletePost(post._id, post.content)}
                    disabled={actionLoading === post._id}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn--light"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button
            className="btn btn--light"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FlaggedPostsManagement;
