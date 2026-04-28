const http = require('http');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const driverRoutes = require('./routes/driverRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const rideRoutes = require('./routes/rideRoutes');
const socketHandler = require('./socket/socketHandler');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RYDO API'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/passenger', passengerRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/payment', paymentRoutes);

const mapRoutes = require('./routes/mapRoutes');
app.use('/api/map', mapRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error'
  });
});

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT'],
    credentials: true
  }
});

socketHandler(io);

connectDB().then(() => {
  server.listen(port, () => {
    console.log(`RYDO API running on port ${port}`);
  });
});
