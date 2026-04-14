const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const port = process.env.PORT || 8080;

const authRoutes = require("./routes/user.routes");
const chatRoutes = require("./routes/chat.routes");
const messageRoutes = require("./routes/message.routes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
    },
});

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    }),
);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;

    if (userId) {
        socket.join(userId);
    }

    socket.on("join chat", (chatId) => {
        if (chatId) {
            socket.join(chatId);
        }
    });

    socket.on("new message", (newMessage) => {
        const { chatId, receiverId } = newMessage || {};
        if (!chatId) return;

        socket.to(chatId).emit("message received", newMessage);
        if (receiverId) {
            socket.to(receiverId).emit("message received", newMessage);
        }
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});