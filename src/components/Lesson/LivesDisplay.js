// components/Lesson/LivesDisplay.js
import React from 'react';

const LivesDisplay = ({ lives, maxLives }) => {
  return (
    <div className="lives-display">
      <p>Vidas: {lives}/{maxLives}</p>
    </div>
  );
};

export default LivesDisplay;