import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080";
const LOGIN_ROUTE = "/login";

const getSenderId = (message) => message?.sender?._id || message?.sender;

const messageBelongsToChat = (message, chatId) =>
    message?.chat === chatId || message?.chatId === chatId;

const Dashboard = () => {
    const navigate = useNavigate();
    const socketRef = useRef(null);

    // Session and user list
    const [currentUser, setCurrentUser] = useState(null);
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    // Active conversation
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");

    // UI state
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);

    const currentUserId = currentUser?.id;
    const activeChatId = activeChat?._id;
    const canSendMessage = Boolean(selectedUser) && !sendingMessage;

    useEffect(() => {
        const localUser = localStorage.getItem("user");
        if (!localUser) {
            navigate(LOGIN_ROUTE);
            return;
        }

        try {
            setCurrentUser(JSON.parse(localUser));
        } catch {
            localStorage.removeItem("user");
            navigate(LOGIN_ROUTE);
        }
    }, [navigate]);

    useEffect(() => {
        if (!currentUserId) return;

        socketRef.current = io(API_BASE_URL, {
            withCredentials: true,
            auth: {
                userId: currentUserId,
            },
        });

        socketRef.current.on("message received", (newMessage) => {
            if (!messageBelongsToChat(newMessage, activeChatId)) {
                return;
            }

            setMessages((prev) => [...prev, newMessage]);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [currentUserId, activeChatId]);

    const fetchUsers = useCallback(async (searchTerm = "") => {
        try {
            setLoadingUsers(true);
            const res = await axios.get(`${API_BASE_URL}/api/auth`, {
                params: { search: searchTerm },
                withCredentials: true,
            });
            setUsers(res.data.search || []);
        } catch (error) {
            if (error?.response?.status === 401) {
                navigate(LOGIN_ROUTE);
            }
        } finally {
            setLoadingUsers(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (!currentUserId) return;

        const timeout = setTimeout(() => {
            fetchUsers(search);
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, currentUserId, fetchUsers]);

    const openConversation = async (user) => {
        try {
            setSelectedUser(user);
            setLoadingMessages(true);

            const chatRes = await axios.post(
                `${API_BASE_URL}/api/chat`,
                { userId: user._id },
                { withCredentials: true },
            );
            const chat = chatRes.data.chat;
            setActiveChat(chat);

            socketRef.current?.emit("join chat", chat._id);

            const msgRes = await axios.get(`${API_BASE_URL}/api/message/${chat._id}`, {
                withCredentials: true,
            });
            setMessages(msgRes.data.messages || []);
        } catch (error) {
            alert(error?.response?.data?.message || "Failed to open conversation");
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        const trimmedMessage = messageText.trim();
        if (!trimmedMessage || !activeChatId || !selectedUser?._id) return;

        try {
            setSendingMessage(true);
            const res = await axios.post(
                `${API_BASE_URL}/api/message`,
                {
                    content: trimmedMessage,
                    chatId: activeChatId,
                },
                { withCredentials: true },
            );

            const newMessage = {
                ...res.data.message,
                chatId: activeChatId,
                receiverId: selectedUser._id,
            };

            setMessages((prev) => [...prev, newMessage]);
            setMessageText("");
            socketRef.current?.emit("new message", newMessage);
        } catch (error) {
            alert(error?.response?.data?.message || "Failed to send message");
        } finally {
            setSendingMessage(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
        } catch {
            // allow local logout even if API call fails
        } finally {
            localStorage.removeItem("user");
            navigate(LOGIN_ROUTE);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4">
            <div className="mx-auto grid h-[90vh] max-w-6xl grid-cols-12 gap-4">
                <aside className="col-span-4 rounded-xl bg-white p-4 shadow">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Chats</h2>
                        <button
                            onClick={handleLogout}
                            className="rounded-md bg-red-500 px-3 py-1 text-sm text-white"
                        >
                            Logout
                        </button>
                    </div>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="mb-3 w-full rounded-md border p-2 outline-none"
                    />

                    <div className="space-y-2 overflow-y-auto">
                        {loadingUsers && <p className="text-sm text-gray-500">Loading users...</p>}

                        {!loadingUsers &&
                            users.map((user) => (
                                <button
                                    key={user._id}
                                    onClick={() => openConversation(user)}
                                    className={`w-full rounded-md p-3 text-left ${
                                        selectedUser?._id === user._id
                                            ? "bg-blue-100"
                                            : "bg-slate-50 hover:bg-slate-100"
                                    }`}
                                >
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </button>
                            ))}
                    </div>
                </aside>

                <main className="col-span-8 flex flex-col rounded-xl bg-white shadow">
                    <div className="border-b p-4">
                        <h3 className="text-lg font-semibold">
                            {selectedUser ? `Chat with ${selectedUser.name}` : "Select a user to start chat"}
                        </h3>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                        {loadingMessages && <p className="text-sm text-gray-500">Loading messages...</p>}

                        {!loadingMessages &&
                            messages.map((msg) => {
                                const isOwnMessage = getSenderId(msg) === currentUserId;

                                return (
                                    <div
                                        key={msg._id}
                                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[75%] rounded-xl px-3 py-2 ${
                                                isOwnMessage
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-200 text-slate-900"
                                            }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-2 border-t p-4">
                        <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type your message..."
                            disabled={!selectedUser}
                            className="flex-1 rounded-md border p-2 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!canSendMessage}
                            className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {sendingMessage ? "Sending..." : "Send"}
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
