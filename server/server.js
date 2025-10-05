import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app)

// Intialize socket.io server
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

export const io = new Server(server, {
    cors: { origin: CLIENT_ORIGIN, credentials: true }
})

// Store online users
export const userSocketMap = {}; // { userId: socketId }

// Socket.io connection handler
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("user Connected", userId);

     if(userId) userSocketMap[userId] = socket.id;

     // Emit online users to all connected clients
     io.emit("getOnlineUsers", Object.keys(userSocketMap));

     socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
     })
})

//Middleware setup
app.use(express.json({limit: "4mb"}));
app.use(cookieParser());
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

// Routes setup
app.use("/api/status", (req, res)=> res.send("Server is live"));
app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

// Connect to MongoDB
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=> console.log("Server is running on PORT: " + PORT));