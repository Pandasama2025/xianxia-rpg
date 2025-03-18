import React from 'react';
import PropTypes from 'prop-types';
import './PlayerStatus.css';

const PlayerStatus = ({ status }) => {
  return (
    <div className="player-status">
      <div className="status-item">
        <span className="status-label">修为境界：</span>
        <span className="status-value">{status.cultivation}</span>
      </div>
      <div className="status-item">
        <span className="status-label">灵力：</span>
        <span className="status-value">{status.spiritualPower}</span>
      </div>
      <div className="status-item">
        <span className="status-label">因果值：</span>
        <span className="status-value">{status.karma}</span>
      </div>
      <div className="status-item">
        <span className="status-label">门派：</span>
        <span className="status-value">{status.sect || '无'}</span>
      </div>
    </div>
  );
};

PlayerStatus.propTypes = {
  status: PropTypes.shape({
    cultivation: PropTypes.string.isRequired,
    spiritualPower: PropTypes.number.isRequired,
    karma: PropTypes.number.isRequired,
    sect: PropTypes.string,
  }).isRequired,
};

export default PlayerStatus;