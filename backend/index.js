const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require('http');
const path = require('path');
const { Server } = require("socket.io");

const connectDatabase = require("./config/database");
// const userRoutes = require("./api/Auth");
const userRoutes = require("./routes/user");
const tenderRoutes = require("./api/tenderRoutes");
const bidRoutes = require('./routes/bid');
const notificationRoutes = require('./routes/notification');
// Initialize dotenv for environment variables
dotenv.config();

// Create an instance of Express
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',    // Allow requests from your frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,  // Allow credentials like cookies or auth headers
  },
});

// CORS configuration (no need for app.use(cors()) at the top)
app.use(cors({
  origin: '*', // Allow requests from your frontend
  credentials: true, // Allow credentials like cookies or auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
}));


const PORT = process.env.PORT || 4000;

app.set('io', io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Connect to the database
connectDatabase(); // Call the function to connect to MongoDB

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up routes
app.use("/api", userRoutes); // Routes from routes/user.js
app.use("/api/tenders", tenderRoutes);
app.use('/api', bidRoutes);
app.use('/api/notifications', notificationRoutes);

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});
// Start the server
server.listen(PORT, () => {
    console.log(`App is listening at Port No. ${PORT}`);
});

