import React, { useState, useEffect } from 'react';

const Clock = () => {
  // Initialize state to store current time
  const [time, setTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Format the time as HH:MM:SS
  const formattedTime = time.toLocaleTimeString();

  return (
    <div className="flex items-center justify-center fixed bottom-5">
    <div className="text-center bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      <p className="text-5xl font-mono">{formattedTime}</p>
    </div>
  </div>
  );
};

export default Clock;
