import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/auth/login`;
      console.log("🔐 Logging in via:", apiUrl);

      const res = await axios.post(
        apiUrl,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true // ✅ Required if your backend sets cookies or uses CORS credentials
        }
      );

      // ✅ Save token and user info
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // ✅ Redirect based on role
      const role = res.data.user.role;
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }

    } catch (err) {
      console.error("❌ Login error:", err.response || err.message);
      alert(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>

      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
