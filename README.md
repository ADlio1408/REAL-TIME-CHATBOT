# Real-Time Communication (Socket.io + Node.js)

The focus of my contribution was building the real-time communication layer, including:

* Socket lifecycle management
* Room broadcasting
* Direct messaging
* Presence systems
* Typing indicators
* Real-time synchronization
* Persistent chat integration with MongoDB

### Responsibilities

* Managed WebSocket connection lifecycle
* Built real-time room broadcasting system
* Implemented direct messaging architecture
* Handled room joining and leaving logic
* Implemented typing indicators
* Built online/offline presence tracking
* Integrated Socket.io with MongoDB persistence
* Developed scalable room-based communication flow
* Managed user-to-socket mapping for private messaging


# Features Implemented

## 1. Real-Time Group Chat Rooms

Users can:

* Create chat rooms dynamically
* Join multiple rooms
* Switch between rooms
* Leave rooms
* Send and receive messages instantly

Messages are broadcast using Socket.io rooms.


## 2. Direct Messaging System (DMs)

Implemented a private messaging architecture using:

```text
DM Room Naming:
dm_user1_user2
```

Features:

* Automatic DM room generation
* Consistent room naming using sorted usernames
* Automatic DM delivery without manual room joining
* Persistent DM history


## 3. MongoDB Message Persistence

Messages are stored permanently using MongoDB.

Each message contains:

```json
{
  "room": "frontend-team",
  "author": "Adrija",
  "message": "Hello",
  "time": "18:30"
}
```

Implemented:

* Message schema using Mongoose
* Room-specific history loading
* Persistent storage for group chats and DMs


## 4. Online / Offline Presence System

Built a real-time presence system using:

```js
username -> socket.id
```

Features:

* Live online user tracking
* Automatic updates on connect/disconnect
* Presence synchronization across all clients


## 5. Typing Indicators

Implemented real-time typing events.

Example:

```text
Rahul is typing...
```

Features:

* Room-specific typing broadcasts
* Temporary real-time events
* Automatic typing state clearing


# Architecture

```text
React Frontend
       ↓
Socket.io Client
       ↓
Node.js + Express Server
       ↓
Socket.io Server
       ↓
MongoDB Database
```


# Technologies Used

## Frontend

* React.js
* Vite
* Socket.io Client

## Backend

* Node.js
* Express.js
* Socket.io
* Mongoose

## Database

* MongoDB


# Project Structure

```text
real-time-chatbot/
│
├── frontend/
│   ├── src/
│   │   └── App.jsx
│
├── models/
│   └── Message.js
│
├── server.js
├── package.json
```


# How To Run The Project

## 1. Clone Repository

```bash
git clone <repository-link>
cd real-time-chatbot
```


## 2. Install Backend Dependencies

Inside project root:

```bash
npm install
```

Install required packages:

```bash
npm install express socket.io mongoose
```


## 3. Install Frontend Dependencies

```bash
cd frontend
npm install
npm install socket.io-client
```


## 4. Start MongoDB

Make sure MongoDB is running locally.

Default MongoDB connection:

```text
mongodb://127.0.0.1:27017/chatapp
```

## 5. Run Backend Server

Inside project root:

```bash
node server.js
```

Expected output:

```text
MongoDB Connected
Server running on port 9000
```


## 6. Run Frontend

Inside frontend folder:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```


# Real-Time Events Implemented

## Socket Events

### Connection Events

* register_user
* disconnect

### Room Events

* join_room
* leave_room

### Messaging Events

* send_message
* receive_message
* previous_messages

### Direct Message Events

* create_dm
* dm_created
* new_dm

### Presence Events

* online_users

### Typing Events

* typing
* user_typing



# Key Engineering Concepts Demonstrated

* WebSocket lifecycle management
* Event-driven architecture
* Real-time communication systems
* Room-based broadcasting
* User presence synchronization
* State management in React
* MongoDB persistence
* Socket-to-user mapping
* Real-time typing systems
* Full-stack frontend/backend synchronization


