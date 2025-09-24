import React from 'react';

const JournalStats = ({ stats }) => {
  const moodLabels = {
    'very-good': 'Very Good 😊',
    'good': 'Good 🙂',
    'neutral': 'Neutral 😐',
    'bad': 'Bad 😞',
    'very-bad': 'Very Bad 😢'
  };

  const moodColors = {
    'very-good': '#48bb78',
    'good': '#68d391',
    'neutral': '#a0aec0',
    'bad': '#fc8181',
    'very-bad': '#f56565'
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateJourneyDays = () => {
    if (!stats.firstEntry || !stats.lastEntry) return 0;
    const first = new Date(stats.firstEntry);
    const last = new Date(stats.lastEntry);
    const diffTime = Math.abs(last - first);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end days
  };

  if (!stats || stats.totalEntries === 0) {
    return (
      <div className="card journal-stats">
        <h3>Your Journal Journey</h3>
        <p>Start writing to see your journaling statistics!</p>
      </div>
    );
  }

  return (
    <div className="card journal-stats">
      <h3>Your Journal Journey</h3>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-number">{stats.totalEntries}</div>
          <div className="stat-label">Total Entries</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-number">{calculateJourneyDays()}</div>
          <div className="stat-label">Days of Journey</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-date">{formatDate(stats.firstEntry)}</div>
          <div className="stat-label">First Entry</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-date">{formatDate(stats.lastEntry)}</div>
          <div className="stat-label">Latest Entry</div>
        </div>
      </div>

      <div className="mood-distribution">
        <h4>Mood Distribution</h4>
        <div className="mood-chart">
          {Object.entries(stats.moodCounts || {}).map(([mood, count]) => {
            const percentage = stats.totalEntries > 0 ? (count / stats.totalEntries) * 100 : 0;
            return (
              <div key={mood} className="mood-bar-container">
                <div className="mood-bar-label">
                  <span>{moodLabels[mood]}</span>
                  <span className="mood-count">{count}</span>
                </div>
                <div className="mood-bar-track">
                  <div 
                    className="mood-bar-fill"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: moodColors[mood]
                    }}
                  />
                </div>
                <div className="mood-percentage">{percentage.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JournalStats;
