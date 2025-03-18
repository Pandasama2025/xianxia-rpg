import React from 'react';
import PropTypes from 'prop-types';
import './StoryDisplay.css';

const StoryDisplay = ({ title, text }) => {
  return (
    <div className="story-display">
      <h2 className="story-title">{title}</h2>
      <div className="story-text">
        {text.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
};

StoryDisplay.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default StoryDisplay;