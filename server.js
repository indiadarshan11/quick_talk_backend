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

const userSocketMap = {};

// ✅ Socket.IO Setup
io.on('connection', (socket) => {
    console.log('⚡ New client connected:', socket.id);

    // ✅ Receive and store userId on login/connection
    socket.on('register', (userId) => {

        userSocketMap[userId] = socket.id;
        socket.join(userId); // 👈 join a room using userId
        console.log(`👤 User ${userId} registered and joined room ${userId}`);
    });

    // Receive message and broadcast
    // ✅ Handle message send
    socket.on('send_message', (data) => {
        const { to, from, text, time } = data;

        const targetSocketId = userSocketMap[to];

        if (targetSocketId) {
            io.to(targetSocketId).emit('receive_message', {
                from,
                text,
                time,
            });
            console.log(`📤 Sent message from ${from} to ${to}`);
        } else {
            console.log(`❌ User ${to} is not connected`);
        }
    });

    socket.on('disconnect', () => {
        // remove disconnected socket from map
        for (const userId in userSocketMap) {
            if (userSocketMap[userId] === socket.id) {
                delete userSocketMap[userId];
                console.log(`❌ Disconnected: ${userId}`);
                break;
            }
        }
    });

    //calling function
    //calling function
    socket.on("start_call", ({ from, to, type }) => {
        io.to(to).emit("incoming_call", { from, type });
    });


});

// ✅ Start server
http.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
