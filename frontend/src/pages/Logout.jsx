// === /src/pages/Logout.jsx ===
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Logout.css'; // Assuming you have a CSS file for styles

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  return <p>Logging out...</p>;
};

export default Logout;
