import React from 'react';

const TherapistCard = ({ therapist, onContact }) => {
  const formatExperience = (years) => {
    if (years === 1) return '1 year';
    return `${years} years`;
  };

  const formatLocation = (address) => {
    if (!address) return 'Location not specified';
    const parts = [];
    if (address.state) parts.push(address.state);
    return parts.join(', ') || 'Location not specified';
  };

  const getRatingDisplay = (rating) => {
    if (!rating || rating.count === 0) {
      return <span className="rating-new">New Therapist</span>;
    }
    return (
      <div className="rating">
        <span className="rating-stars">{'★'.repeat(Math.round(rating.average))}</span>
        <span className="rating-text">{rating.average.toFixed(1)} ({rating.count} reviews)</span>
      </div>
    );
  };

  return (
    <div className="card therapist-card">
      <div className="therapist-header">
        {therapist.profileImage && (
          <img 
            src={therapist.profileImage} 
            alt={therapist.userId?.name || 'Therapist'}
            className="therapist-avatar"
          />
        )}
        <div className="therapist-info">
          <h3 className="therapist-name">
            {therapist.userId?.name || 'Dr. Anonymous'}
          </h3>
          <div className="therapist-credentials">
            <span className="experience">{formatExperience(therapist.experience)} experience</span>
            <span className="location">{formatLocation(therapist.contactInfo?.address)}</span>
          </div>
          {getRatingDisplay(therapist.rating)}
        </div>
      </div>

      <div className="therapist-specializations">
        <h4>Specializations</h4>
        <div className="specialization-tags">
          {therapist.specialization?.slice(0, 3).map((spec, index) => (
            <span key={index} className="specialization-tag">
              {spec}
            </span>
          ))}
          {therapist.specialization?.length > 3 && (
            <span className="specialization-tag more">
              +{therapist.specialization.length - 3} more
            </span>
          )}
        </div>
      </div>

      {therapist.bio && (
        <div className="therapist-bio">
          <p>{therapist.bio.length > 150 ? `${therapist.bio.substring(0, 150)}...` : therapist.bio}</p>
        </div>
      )}

      <div className="therapist-practice-info">
        {therapist.practiceInfo?.sessionTypes && therapist.practiceInfo.sessionTypes.length > 0 && (
          <div className="practice-detail">
            <strong>Session Types:</strong>
            <span>{therapist.practiceInfo.sessionTypes.join(', ')}</span>
          </div>
        )}
        
        {therapist.practiceInfo?.languages && therapist.practiceInfo.languages.length > 0 && (
          <div className="practice-detail">
            <strong>Languages:</strong>
            <span>{therapist.practiceInfo.languages.join(', ')}</span>
          </div>
        )}

        {therapist.practiceInfo?.acceptsInsurance && (
          <div className="practice-detail">
            <span className="insurance-badge">Accepts Insurance</span>
          </div>
        )}
      </div>

      <div className="therapist-availability">
        {therapist.practiceInfo?.availability?.days && (
          <div className="availability-info">
            <strong>Available:</strong>
            <span>
              {therapist.practiceInfo.availability.days.join(', ')}
              {therapist.practiceInfo.availability.hours && (
                ` (${therapist.practiceInfo.availability.hours.start} - ${therapist.practiceInfo.availability.hours.end})`
              )}
            </span>
          </div>
        )}
      </div>

      <div className="therapist-actions">
        <button 
          className="btn btn--primary btn--full"
          onClick={onContact}
        >
          Contact Therapist
        </button>
      </div>
    </div>
  );
};

export default TherapistCard;
