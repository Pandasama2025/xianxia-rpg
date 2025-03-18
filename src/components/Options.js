import React from 'react';
import PropTypes from 'prop-types';
import './Options.css';

const Options = ({ options, onSelect }) => {
  return (
    <div className="options-container">
      {options.map((option, index) => (
        <button
          key={index}
          className="option-button"
          onClick={() => onSelect(option)}
        >
          {option.text}
        </button>
      ))}
    </div>
  );
};

Options.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      nextChapter: PropTypes.string.isRequired,
      effects: PropTypes.object,
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default Options;