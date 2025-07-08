import { useEffect, useState } from 'react';
import socket from '../socket';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    socket.on('taskActivity', (log) => {
      setLogs(prev => [log, ...prev.slice(0, 19)]); // Only last 20 actions
    });

    return () => {
      socket.off('log');
    };
  }, []);

  return (
    <div className="activity-log">
      <h3>Activity Log</h3>
      {logs.length === 0 ? (
        <p>No recent activity.</p>
      ) : (
        <ul>
          {logs.map((log, index) => (
            <li key={index}>
              <strong>{log.user}</strong>: {log.action} — <em>{new Date(log.timestamp).toLocaleString()}</em>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
};

export default ActivityLog;
