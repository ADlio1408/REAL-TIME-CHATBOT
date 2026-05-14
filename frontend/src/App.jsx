import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("http://localhost:9000");

function App() {

  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [roomInput, setRoomInput] = useState("");
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("");

  const [dmUser, setDmUser] = useState("");

  const [currentMessage, setCurrentMessage] = useState("");

  const [roomMessages, setRoomMessages] = useState({});

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [typingUser, setTypingUser] = useState("");

  // LOGIN
  const enterChat = () => {

    if (username !== "") {

      socket.emit("register_user", username);

      setLoggedIn(true);

    }
  };

  // JOIN ROOM
  const joinRoom = async () => {

    if (roomInput !== "") {

      socket.emit("join_room", roomInput);

      if (!rooms.includes(roomInput)) {

        setRooms((prev) => [...prev, roomInput]);

      }

      setCurrentRoom(roomInput);

      setRoomInput("");

    }
  };

  // CREATE DM
  const createDM = () => {

    if (dmUser !== "") {

      socket.emit("create_dm", {
        sender: username,
        receiver: dmUser,
      });

      setDmUser("");

    }
  };

  // SWITCH ROOM
  const switchRoom = (room) => {

    setCurrentRoom(room);

    socket.emit("join_room", room);

  };

  // LEAVE ROOM
  const leaveRoom = () => {

    socket.emit("leave_room", currentRoom);

    // REMOVE ROOM FROM SIDEBAR
    setRooms((prev) =>
      prev.filter((room) => room !== currentRoom)
    );

    setCurrentRoom("");

  };

  // SEND MESSAGE
  const sendMessage = () => {

    if (currentMessage !== "" && currentRoom !== "") {

      const messageData = {
        room: currentRoom,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      socket.emit("send_message", messageData);

      setCurrentMessage("");

    }
  };

  // TYPING
  const handleTyping = (e) => {

    setCurrentMessage(e.target.value);

    socket.emit("typing", {
      room: currentRoom,
      author: username,
    });

  };

  // SOCKET EVENTS
  useEffect(() => {

    // ONLINE USERS
    socket.on("online_users", (users) => {

      setOnlineUsers(users);

    });

    // DM CREATED
    socket.on("dm_created", (dmRoom) => {

      setRooms((prev) => {

        if (!prev.includes(dmRoom)) {

          return [...prev, dmRoom];

        }

        return prev;

      });

      setCurrentRoom(dmRoom);

      socket.emit("join_room", dmRoom);

    });

    // NEW DM
    socket.on("new_dm", (dmRoom) => {

      setRooms((prev) => {

        if (!prev.includes(dmRoom)) {

          return [...prev, dmRoom];

        }

        return prev;

      });

    });

    // PREVIOUS MESSAGES
    socket.on("previous_messages", ({ room, messages }) => {

      setRoomMessages((prev) => ({
        ...prev,
        [room]: messages,
      }));

    });

    // RECEIVE MESSAGE
    socket.on("receive_message", (data) => {

      setRoomMessages((prev) => ({

        ...prev,

        [data.room]: [
          ...(prev[data.room] || []),
          data,
        ],

      }));

      setTypingUser("");

    });

    // TYPING
    socket.on("user_typing", (data) => {

      if (
        data.author !== username &&
        data.room === currentRoom
      ) {

        setTypingUser(data.author);

        setTimeout(() => {
          setTypingUser("");
        }, 1000);

      }

    });

    return () => {

      socket.off("online_users");
      socket.off("dm_created");
      socket.off("new_dm");
      socket.off("previous_messages");
      socket.off("receive_message");
      socket.off("user_typing");

    };

  }, [currentRoom, username]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        backgroundColor: "#f4f4f4",
        fontFamily: "Arial",
      }}
    >

      {!loggedIn ? (

        <div
          style={{
            margin: "auto",
            width: "300px",
            padding: "30px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          }}
        >

          <h1>Login</h1>

          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
            }}
          />

          <button
            onClick={enterChat}
            style={{
              width: "100%",
              padding: "10px",
            }}
          >
            Enter Chat
          </button>

        </div>

      ) : (

        <div style={{ display: "flex", width: "100%" }}>

          {/* SIDEBAR */}

          <div
            style={{
              width: "250px",
              backgroundColor: "#202225",
              color: "white",
              padding: "20px",
            }}
          >

            <h2>Rooms</h2>

            <input
              type="text"
              placeholder="New Room"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              style={{
                padding: "10px",
                marginBottom: "10px",
                width: "100%",
              }}
            />

            <button
              onClick={joinRoom}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "20px",
              }}
            >
              Join Room
            </button>

            <h3>Direct Messages</h3>

            <input
              type="text"
              placeholder="Username..."
              value={dmUser}
              onChange={(e) => setDmUser(e.target.value)}
              style={{
                padding: "10px",
                marginBottom: "10px",
                width: "100%",
              }}
            />

            <button
              onClick={createDM}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "20px",
              }}
            >
              Start DM
            </button>

            {/* ROOM LIST */}

            <div>

              {rooms.map((room, index) => (

                <div
                  key={index}
                  onClick={() => switchRoom(room)}
                  style={{
                    padding: "10px",
                    marginBottom: "10px",
                    backgroundColor:
                      currentRoom === room
                        ? "#5865f2"
                        : "#40444b",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {room}
                </div>

              ))}

            </div>

            {/* ONLINE */}

            <hr />

            <h3>Online</h3>

            {onlineUsers.map((user, index) => (

              <p key={index}>
                🟢 {user}
              </p>

            ))}

          </div>

          {/* CHAT */}

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >

            {/* HEADER */}

            <div
              style={{
                padding: "20px",
                backgroundColor: "white",
                borderBottom: "1px solid #ddd",
                display: "flex",
                justifyContent: "space-between",
              }}
            >

              <h2>
                {currentRoom || "Select Room"}
              </h2>

              {currentRoom && (

                <button
                  onClick={leaveRoom}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    padding: "10px",
                  }}
                >
                  Leave Room
                </button>

              )}

            </div>

            {/* MESSAGES */}

            <div
              style={{
                flex: 1,
                padding: "20px",
                overflowY: "scroll",
              }}
            >

              {(roomMessages[currentRoom] || []).map((msg, index) => (

                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent:
                      username === msg.author
                        ? "flex-end"
                        : "flex-start",
                    marginBottom: "15px",
                  }}
                >

                  <div
                    style={{
                      backgroundColor:
                        username === msg.author
                          ? "#5865f2"
                          : "white",
                      color:
                        username === msg.author
                          ? "white"
                          : "black",
                      padding: "10px",
                      borderRadius: "10px",
                    }}
                  >

                    <strong>{msg.author}</strong>

                    <p>{msg.message}</p>

                    <small>{msg.time}</small>

                  </div>

                </div>

              ))}

              {typingUser && (

                <p>
                  {typingUser} is typing...
                </p>

              )}

            </div>

            {/* INPUT */}

            {currentRoom && (

              <div
                style={{
                  display: "flex",
                  padding: "20px",
                  backgroundColor: "white",
                }}
              >

                <input
                  type="text"
                  placeholder="Type message..."
                  value={currentMessage}
                  onChange={handleTyping}
                  style={{
                    flex: 1,
                    padding: "10px",
                    marginRight: "10px",
                  }}
                />

                <button
                  onClick={sendMessage}
                  style={{
                    padding: "10px 20px",
                  }}
                >
                  Send
                </button>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default App;