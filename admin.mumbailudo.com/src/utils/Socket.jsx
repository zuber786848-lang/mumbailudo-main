// utils/Socket.js
import io from 'socket.io-client';
import { socketUrl } from './APIRoutes';

// Ensure baseUrl is properly defined and includes protocol and port if needed
const Socket = io(`${socketUrl}`, {
  transports: ['websocket'], // Specify transport options if necessary
  autoConnect: false, // You can manually control connection if needed
});

// Socket.connect(); // Manually connect to the server


export default Socket;
