// === /src/pages/Dashboard.jsx ===
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // ✅ Make sure this path matches your structure
import ActivityLog from '../components/ActivityLog';
import KanbanBoard from '../components/KanbanBoard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <h2>Welcome, {user?.name}</h2>
      <p>Role: {user?.role}</p>

      <div className="dashboard-section">
        <KanbanBoard />
      </div>

      <div className="dashboard-section">
        <ActivityLog />
      </div>
    </div>
  );
};

export default Dashboard;
