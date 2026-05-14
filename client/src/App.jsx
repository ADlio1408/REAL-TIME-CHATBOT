import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Check,
  ChevronLeft,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Plus,
  Search,
  Send,
  Smile,
  Users,
  X,
} from 'lucide-react';
import {
  createRoom,
  getMessages,
  getRooms,
  getUsers,
  login,
  register,
  sendMessage,
} from './api';
import { connectSocket } from './socket';

const emojis = [
  '\u{1F600}',
  '\u{1F602}',
  '\u{1F60A}',
  '\u{1F60D}',
  '\u{1F60E}',
  '\u{1F64C}',
  '\u{1F525}',
  '\u2728',
  '\u2764\uFE0F',
  '\u{1F44D}',
  '\u{1F389}',
  '\u{1F4AC}',
];

function formatTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function getRoomTitle(room, user) {
  if (!room) return 'Select a chat';
  if (room.isGroup) return room.name;
  const otherMember = room.members?.find((member) => member._id !== user?._id);
  return otherMember?.username || room.name;
}

function AuthView({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const auth = mode === 'login'
        ? await login(username.trim(), password)
        : await register(username.trim(), password);
      onAuth(auth);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="brand-mark">
          <MessageCircle size={30} />
        </div>
        <h1>Team Chat</h1>
        <p>Fast rooms, live messages, and a cleaner conversation rhythm.</p>

        <div className="segmented" role="tablist" aria-label="Authentication mode">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">
            Login
          </button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')} type="button">
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Username
            <input
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="swetha"
              required
            />
          </label>
          <label>
            Password
            <input
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="password"
              type="password"
              required
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </section>
    </main>
  );
}

function NewRoomDialog({ users, currentUser, onCreate, onClose }) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);
  const [isGroup, setIsGroup] = useState(false);

  const availableUsers = users.filter((item) => item._id !== currentUser?._id);

  function toggleUser(userId) {
    setSelected((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : isGroup
          ? [...current, userId]
          : [userId]
    );
  }

  function submit(event) {
    event.preventDefault();
    if (!selected.length) return;
    const directUser = availableUsers.find((item) => item._id === selected[0]);
    onCreate({
      name: isGroup ? name.trim() || 'New group' : directUser?.username || 'Direct chat',
      isGroup,
      members: selected,
    });
  }

  return (
    <div className="dialog-backdrop">
      <form className="dialog" onSubmit={submit}>
        <div className="dialog-header">
          <h2>New chat</h2>
          <button className="icon-button" onClick={onClose} type="button" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <label className="toggle-row">
          <input type="checkbox" checked={isGroup} onChange={(event) => setIsGroup(event.target.checked)} />
          Group room
        </label>

        {isGroup ? (
          <label>
            Room name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Project launch" />
          </label>
        ) : null}

        <div className="user-picker">
          {availableUsers.map((item) => (
            <button
              className={selected.includes(item._id) ? 'user-option selected' : 'user-option'}
              key={item._id}
              onClick={() => toggleUser(item._id)}
              type="button"
            >
              <span className={`presence ${item.status || 'offline'}`} />
              <span>{item.username}</span>
              {selected.includes(item._id) ? <Check size={16} /> : null}
            </button>
          ))}
        </div>

        <button className="primary-button" disabled={!selected.length} type="submit">
          Start chat
        </button>
      </form>
    </div>
  );
}

function ChatList({ rooms, activeRoomId, user, unread, onSelect }) {
  return (
    <div className="chat-list">
      {rooms.map((room) => (
        <button
          key={room._id}
          className={activeRoomId === room._id ? 'room-row active' : 'room-row'}
          onClick={() => onSelect(room)}
          type="button"
        >
          <span className="avatar">{getRoomTitle(room, user).slice(0, 2).toUpperCase()}</span>
          <span className="room-copy">
            <span className="room-name">{getRoomTitle(room, user)}</span>
            <span className="room-meta">
              {room.isGroup ? `${room.members?.length || 0} members` : room.members?.find((member) => member._id !== user?._id)?.status || 'offline'}
            </span>
          </span>
          {unread[room._id] ? <span className="unread-count">{unread[room._id]}</span> : null}
        </button>
      ))}
    </div>
  );
}

function MessageList({ messages, user }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  return (
    <div className="messages">
      {messages.map((message) => {
        const mine = message.sender?._id === user?._id || message.sender === user?._id;
        return (
          <article className={mine ? 'message mine' : 'message'} key={message._id}>
            <div className="message-bubble">
              {!mine ? <span className="message-author">{message.sender?.username || 'Member'}</span> : null}
              <p>{message.text}</p>
              <time>{formatTime(message.createdAt)}</time>
            </div>
          </article>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

function Composer({ room, socket, onLocalMessage }) {
  const [text, setText] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const typingTimeout = useRef(null);

  function emitTyping(value) {
    if (!socket || !room) return;
    socket.emit('typing:start', { roomId: room._id });
    window.clearTimeout(typingTimeout.current);
    typingTimeout.current = window.setTimeout(() => {
      socket.emit('typing:stop', { roomId: room._id });
    }, value ? 900 : 0);
  }

  async function submit(event) {
    event.preventDefault();
    const cleanText = text.trim();
    if (!cleanText || !room) return;

    setText('');
    setEmojiOpen(false);

    if (socket?.connected) {
      socket.emit('message:send', { roomId: room._id, text: cleanText });
      return;
    }

    const saved = await sendMessage(room._id, cleanText);
    onLocalMessage(saved);
  }

  return (
    <form className="composer" onSubmit={submit}>
      <div className="emoji-wrap">
        <button className="icon-button" onClick={() => setEmojiOpen((value) => !value)} type="button" aria-label="Emoji picker">
          <Smile size={20} />
        </button>
        {emojiOpen ? (
          <div className="emoji-picker">
            {emojis.map((emoji) => (
              <button key={emoji} onClick={() => setText((value) => `${value}${emoji}`)} type="button">
                {emoji}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <input
        aria-label="Message"
        disabled={!room}
        onChange={(event) => {
          setText(event.target.value);
          emitTyping(event.target.value);
        }}
        placeholder={room ? `Message ${room.name}` : 'Choose a room'}
        value={text}
      />
      <button className="send-button" disabled={!text.trim() || !room} type="submit" aria-label="Send">
        <Send size={19} />
      </button>
    </form>
  );
}

function ChatApp({ auth, onLogout }) {
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [unread, setUnread] = useState({});
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [socket, setSocket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeRoomId = activeRoom?._id;

  useEffect(() => {
    async function loadInitialData() {
      const [roomData, userData] = await Promise.all([getRooms(), getUsers()]);
      setRooms(roomData);
      setUsers(userData);
      setActiveRoom(roomData[0] || null);
    }

    loadInitialData().catch(console.error);
  }, []);

  useEffect(() => {
    const nextSocket = connectSocket(auth.token);
    setSocket(nextSocket);

    nextSocket.on('message:new', (message) => {
      setMessagesByRoom((current) => ({
        ...current,
        [message.room]: [...(current[message.room] || []), message],
      }));
      setRooms((current) => {
        const target = current.find((room) => room._id === message.room);
        if (!target) return current;
        return [target, ...current.filter((room) => room._id !== message.room)];
      });
      setUnread((current) => (
        message.room === activeRoomId
          ? current
          : { ...current, [message.room]: (current[message.room] || 0) + 1 }
      ));
    });

    nextSocket.on('typing:update', ({ roomId, username, isTyping }) => {
      setTypingUsers((current) => {
        const names = new Set(current[roomId] || []);
        if (isTyping) names.add(username);
        else names.delete(username);
        return { ...current, [roomId]: [...names] };
      });
    });

    return () => nextSocket.disconnect();
  }, [auth.token, activeRoomId]);

  useEffect(() => {
    if (!socket || !activeRoomId) return;
    socket.emit('room:join', activeRoomId);
    setUnread((current) => ({ ...current, [activeRoomId]: 0 }));

    if (!messagesByRoom[activeRoomId]) {
      getMessages(activeRoomId)
        .then((items) => setMessagesByRoom((current) => ({ ...current, [activeRoomId]: items })))
        .catch(console.error);
    }
  }, [socket, activeRoomId, messagesByRoom]);

  const filteredRooms = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return rooms;
    return rooms.filter((room) => getRoomTitle(room, auth.user).toLowerCase().includes(normalizedQuery));
  }, [rooms, query, auth.user]);

  async function handleCreateRoom(payload) {
    const room = await createRoom(payload);
    setRooms((current) => [room, ...current]);
    setActiveRoom(room);
    setDialogOpen(false);
  }

  const activeMessages = activeRoomId ? messagesByRoom[activeRoomId] || [] : [];
  const activeTyping = activeRoomId ? typingUsers[activeRoomId] || [] : [];

  return (
    <main className="app-shell">
      <aside className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
        <div className="sidebar-top">
          <div>
            <span className="eyebrow">Signed in as</span>
            <h1>{auth.user.username}</h1>
          </div>
          <button className="icon-button mobile-only" onClick={() => setSidebarOpen(false)} type="button" aria-label="Close chat list">
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-actions">
          <div className="search-box">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rooms" />
          </div>
          <button className="icon-button" onClick={() => setDialogOpen(true)} type="button" aria-label="New chat">
            <Plus size={20} />
          </button>
        </div>

        <ChatList
          activeRoomId={activeRoomId}
          onSelect={(room) => {
            setActiveRoom(room);
            setSidebarOpen(false);
          }}
          rooms={filteredRooms}
          unread={unread}
          user={auth.user}
        />

        <button className="logout-button" onClick={onLogout} type="button">
          <LogOut size={17} />
          Logout
        </button>
      </aside>

      <section className="chat-pane">
        <header className="chat-header">
          <button className="icon-button mobile-only" onClick={() => setSidebarOpen(true)} type="button" aria-label="Open chat list">
            <Menu size={20} />
          </button>
          <button className="icon-button mobile-back" onClick={() => setActiveRoom(null)} type="button" aria-label="Back">
            <ChevronLeft size={20} />
          </button>
          <span className="avatar large">{getRoomTitle(activeRoom, auth.user).slice(0, 2).toUpperCase()}</span>
          <div>
            <h2>{getRoomTitle(activeRoom, auth.user)}</h2>
            <p>
              {activeTyping.length
                ? `${activeTyping.join(', ')} typing...`
                : activeRoom?.isGroup
                  ? `${activeRoom.members?.length || 0} members`
                  : 'Ready for real-time messages'}
            </p>
          </div>
          <div className="header-icons">
            <Bell size={19} />
            <Moon size={19} />
            <Users size={19} />
          </div>
        </header>

        {activeRoom ? (
          <>
            <MessageList messages={activeMessages} user={auth.user} />
            <Composer
              room={activeRoom}
              socket={socket}
              onLocalMessage={(message) => {
                setMessagesByRoom((current) => ({
                  ...current,
                  [activeRoom._id]: [...(current[activeRoom._id] || []), message],
                }));
              }}
            />
          </>
        ) : (
          <div className="empty-state">
            <MessageCircle size={44} />
            <h2>Choose a conversation</h2>
            <p>Your rooms and direct chats will appear on the left.</p>
          </div>
        )}
      </section>

      {dialogOpen ? (
        <NewRoomDialog
          currentUser={auth.user}
          onClose={() => setDialogOpen(false)}
          onCreate={handleCreateRoom}
          users={users}
        />
      ) : null}
    </main>
  );
}

export default function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('chat-token');
    const user = localStorage.getItem('chat-user');
    return token && user ? { token, user: JSON.parse(user) } : null;
  });

  function handleAuth(nextAuth) {
    localStorage.setItem('chat-token', nextAuth.token);
    localStorage.setItem('chat-user', JSON.stringify(nextAuth.user));
    setAuth(nextAuth);
  }

  function handleLogout() {
    localStorage.removeItem('chat-token');
    localStorage.removeItem('chat-user');
    setAuth(null);
  }

  return auth ? <ChatApp auth={auth} onLogout={handleLogout} /> : <AuthView onAuth={handleAuth} />;
}
