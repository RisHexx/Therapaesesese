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
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const res = await axios.get(`/api/admin/posts/flagged?${params.toString()}`);
      setPosts(res.data.data.posts);
      setPagination(res.data.data.pagination);
      setError(null);
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
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleRemovePost = async (postId, postContent) => {
    const reason = prompt(`Enter reason for removing this post:\n\n"${postContent.substring(0, 100)}..."`);
    if (!reason || reason.trim().length === 0) {
      return;
    }

    if (!window.confirm('Are you sure you want to remove this post?')) {
      return;
    }

    try {
      setActionLoading(postId);
      await axios.put(`/api/admin/posts/${postId}/remove`, { reason: reason.trim() });
      
      // Remove post from local state
      setPosts(prev => prev.filter(post => post._id !== postId));
      
      alert('Post removed successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove post');
      console.error('Remove post error:', err);
    } finally {
      setActionLoading(null);
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

  const getFlagReasonColor = (reason) => {
    switch (reason) {
      case 'spam': return '#f56565';
      case 'abuse': return '#e53e3e';
      case 'inappropriate': return '#ed8936';
      default: return '#718096';
    }
  };

  const togglePostExpansion = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flagged-posts-management">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Loading flagged posts...
        </div>
      </div>
    );
  }

  return (
    <div className="flagged-posts-management">
      <div className="flagged-posts-header">
        <h2>Flagged Posts Management</h2>
        <p>Review and moderate posts flagged by users</p>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-form">
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

          <div className="filter-group">
            <label>Per Page</label>
            <select 
              value={filters.limit} 
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert--error">
          {error}
          <button 
            className="btn btn--small btn--light" 
            onClick={fetchFlaggedPosts}
            style={{ marginLeft: '12px' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Flagged Posts List */}
      <div className="flagged-posts-list">
        {posts.map((post) => (
          <div key={post._id} className="card flagged-post-card">
            <div className="flagged-post-header">
              <div className="post-meta">
                <div className="post-author">
                  <strong>{post.authorId?.name || 'Unknown User'}</strong>
                  <span className="post-role">({post.authorId?.role || 'user'})</span>
                </div>
                <div className="post-date">{formatDate(post.createdAt)}</div>
              </div>
              
              <div className="flag-info">
                <span className="flag-count">{post.flagCount} flags</span>
                <button
                  className="btn btn--small btn--danger"
                  onClick={() => handleRemovePost(post._id, post.content)}
                  disabled={actionLoading === post._id}
                >
                  {actionLoading === post._id ? 'Removing...' : 'Remove Post'}
                </button>
              </div>
            </div>

            <div className="flagged-post-content">
              <div className="post-text">
                {expandedPost === post._id || post.content.length <= 300 ? (
                  post.content
                ) : (
                  <>
                    {post.content.substring(0, 300)}...
                    <button 
                      className="btn-link"
                      onClick={() => togglePostExpansion(post._id)}
                    >
                      Show more
                    </button>
                  </>
                )}
                {expandedPost === post._id && post.content.length > 300 && (
                  <button 
                    className="btn-link"
                    onClick={() => togglePostExpansion(post._id)}
                  >
                    Show less
                  </button>
                )}
              </div>

              {post.replies && post.replies.length > 0 && (
                <div className="post-replies-info">
                  <small>{post.replies.length} replies</small>
                </div>
              )}
            </div>

            <div className="flagged-post-flags">
              <h4>Flag Details</h4>
              <div className="flags-list">
                {post.flags.map((flag, index) => (
                  <div key={index} className="flag-item">
                    <div className="flag-user">
                      <strong>{flag.userId?.name || 'Anonymous'}</strong>
                      <span className="flag-email">({flag.userId?.email || 'No email'})</span>
                    </div>
                    <div className="flag-details">
                      <span 
                        className="flag-reason"
                        style={{ color: getFlagReasonColor(flag.reason) }}
                      >
                        {flag.reason}
                      </span>
                      <span className="flag-date">
                        {formatDate(flag.flaggedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flagged-post-actions">
              <div className="post-stats">
                <span>Created: {formatDate(post.createdAt)}</span>
                <span>Replies: {post.replyCount}</span>
                <span>Flags: {post.flagCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            {filters.minFlags > 1 
              ? `No posts found with ${filters.minFlags}+ flags.`
              : 'No flagged posts found.'
            }
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn--light"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev || loading}
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages} 
            ({pagination.totalPosts} flagged posts)
          </span>
          
          <button
            className="btn btn--light"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext || loading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FlaggedPostsManagement;
