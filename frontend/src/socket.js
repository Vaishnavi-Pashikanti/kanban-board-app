import { io } from 'socket.io-client';
const socket = io('http://localhost:5000'); // or your Railway backend URL
export default socket;
