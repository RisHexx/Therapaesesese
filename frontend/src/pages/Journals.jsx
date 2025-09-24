import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JournalEntry from '../components/JournalEntry.jsx';
import CreateJournal from '../components/CreateJournal.jsx';
import JournalStats from '../components/JournalStats.jsx';

const Journals = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateJournal, setShowCreateJournal] = useState(false);
  const [filters, setFilters] = useState({
    mood: '',
    search: ''
  });
  const [stats, setStats] = useState(null);

  const fetchJournals = async (page = 1, filterParams = filters) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (filterParams.mood) queryParams.append('mood', filterParams.mood);
      if (filterParams.search) queryParams.append('search', filterParams.search);

      const res = await axios.get(`/api/journals/?${queryParams}`);
      setJournals(res.data.data.journals);
      setPagination(res.data.data.pagination);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch journal entries');
      console.error('Fetch journals error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/journals/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  useEffect(() => {
    fetchJournals();
    fetchStats();
  }, []);

  const handleJournalCreated = (newJournal) => {
    setJournals([newJournal, ...journals]);
    setShowCreateJournal(false);
    fetchStats(); // Refresh stats
  };

  const handleJournalUpdated = (updatedJournal) => {
    setJournals(journals.map(journal => 
      journal._id === updatedJournal._id ? updatedJournal : journal
    ));
    fetchStats(); // Refresh stats
  };

  const handleJournalDeleted = (journalId) => {
    setJournals(journals.filter(journal => journal._id !== journalId));
    fetchStats(); // Refresh stats
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchJournals(page);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchJournals(1, newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { mood: '', search: '' };
    setFilters(clearedFilters);
    setCurrentPage(1);
    fetchJournals(1, clearedFilters);
  };

  if (loading && journals.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Loading your journal entries...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="journals-header">
        <h1>My Journal</h1>
        <button 
          className="btn btn--primary"
          onClick={() => setShowCreateJournal(!showCreateJournal)}
        >
          {showCreateJournal ? 'Cancel' : 'New Entry'}
        </button>
      </div>

      {stats && <JournalStats stats={stats} />}

      {error && (
        <div className="alert alert--error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card filters-card">
        <h3>Filter Entries</h3>
        <div className="filters-form">
          <div className="filter-group">
            <label>Mood</label>
            <select
              value={filters.mood}
              onChange={(e) => handleFilterChange({ ...filters, mood: e.target.value })}
            >
              <option value="">All Moods</option>
              <option value="very-good">Very Good 😊</option>
              <option value="good">Good 🙂</option>
              <option value="neutral">Neutral 😐</option>
              <option value="bad">Bad 😞</option>
              <option value="very-bad">Very Bad 😢</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search in title, content, or tags..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
            />
          </div>
          
          <button className="btn btn--light" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {showCreateJournal && (
        <CreateJournal 
          onJournalCreated={handleJournalCreated}
          onCancel={() => setShowCreateJournal(false)}
        />
      )}

      <div className="journals-feed">
        {journals.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <h3>No journal entries found</h3>
            {filters.mood || filters.search ? (
              <div>
                <p>Try adjusting your filters or create a new entry.</p>
                <button className="btn btn--light" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div>
                <p>Start your journaling journey today!</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setShowCreateJournal(true)}
                >
                  Write First Entry
                </button>
              </div>
            )}
          </div>
        ) : (
          journals.map((journal) => (
            <JournalEntry
              key={journal._id}
              journal={journal}
              onJournalUpdated={handleJournalUpdated}
              onJournalDeleted={handleJournalDeleted}
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

export default Journals;
