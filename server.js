require('dotenv').config(); // load env first

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const http = require('http').createServer(app); // ⬅️ Replace app.listen()
const { Server } = require('socket.io');
const io = new Server(http, {
    cors: {
        origin: '*', // allow all for now
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3000;

connectDB(); // Connect to MongoDB

// ✅ Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());
app.use('/api', authRoutes);

// ✅ Socket.IO Setup
io.on('connection', (socket) => {
    console.log('⚡ New client connected:', socket.id);

    // Receive message and broadcast
    socket.on('send_message', (data) => {
        console.log('📨 Message:', data);
        io.emit('receive_message', data); // Broadcast to all
    });

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// ✅ Start server
http.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
