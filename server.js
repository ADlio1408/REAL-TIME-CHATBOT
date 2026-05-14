const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const Message = require("./models/Message");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

// ONLINE USERS
const onlineUsers = {};

// BROADCAST ONLINE USERS
const broadcastOnlineUsers = () => {

    io.emit("online_users", Object.keys(onlineUsers));

};

// MONGODB
mongoose.connect("mongodb://127.0.0.1:27017/chatapp")
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.log(err);
    });

app.get("/", (req, res) => {
    res.send("Server running");
});

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // REGISTER USER
    socket.on("register_user", (username) => {

        onlineUsers[username] = socket.id;

        socket.username = username;

        broadcastOnlineUsers();

    });

    // JOIN ROOM
    socket.on("join_room", async (room) => {

        socket.join(room);

        console.log(`${socket.username} joined ${room}`);

        try {

            const roomMessages = await Message.find({ room });

            socket.emit("previous_messages", {
                room,
                messages: roomMessages,
            });

        } catch (error) {

            console.log(error);

        }

    });

    // LEAVE ROOM
    socket.on("leave_room", (room) => {

        socket.leave(room);

        console.log(`${socket.username} left ${room}`);

    });

    // CREATE DM
    socket.on("create_dm", ({ sender, receiver }) => {

        const users = [sender, receiver].sort();

        const dmRoom = `dm_${users[0]}_${users[1]}`;

        socket.join(dmRoom);

        const receiverSocketId = onlineUsers[receiver];

        if (receiverSocketId) {

            const receiverSocket =
                io.sockets.sockets.get(receiverSocketId);

            if (receiverSocket) {

                receiverSocket.join(dmRoom);

                receiverSocket.emit("new_dm", dmRoom);

            }
        }

        socket.emit("dm_created", dmRoom);

    });

    // TYPING
    socket.on("typing", (data) => {

        socket.to(data.room).emit("user_typing", data);

    });

    // SEND MESSAGE
    socket.on("send_message", async (data) => {

        try {

            const newMessage = new Message(data);

            await newMessage.save();

            io.to(data.room).emit("receive_message", data);

        } catch (error) {

            console.log(error);

        }

    });

    // DISCONNECT
    socket.on("disconnect", () => {

        console.log("User disconnected:", socket.id);

        if (socket.username) {

            delete onlineUsers[socket.username];

        }

        broadcastOnlineUsers();

    });

});

server.listen(9000, () => {
    console.log("Server running on port 9000");
});