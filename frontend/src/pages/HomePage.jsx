import { useState } from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom'

const HomePage = () => {
  const navigate=useNavigate()
    const [active, setActive] = useState("login");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const res = await axios.post(
                "http://localhost:8080/api/auth/signup",
                { name, email, password },
                { withCredentials: true },
            );

            alert(res.data.message);

            setActive("login");
        } catch (err) {
            alert(err?.response?.data?.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const res = await axios.post(
                "http://localhost:8080/api/auth/login",
                { email, password },
                { withCredentials: true },
            );

            alert("Login success");

            localStorage.setItem("user", JSON.stringify(res.data.user));
            navigate('/chat')
        } catch (err) {
            alert(err?.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="w-[420px] backdrop-blur-lg bg-white/20 border border-white/30 shadow-2xl rounded-2xl p-8">
                <h1 className="text-2xl font-bold text-center text-white mb-6">
                    Developer Chat
                </h1>

                {/* Toggle Buttons */}

                <div className="flex bg-white/20 rounded-lg mb-6 overflow-hidden">
                    <button
                        onClick={() => setActive("login")}
                        className={`flex-1 py-2 transition ${
                            active === "login"
                                ? "bg-white text-black font-semibold"
                                : "text-white"
                        }`}
                    >
                        Login
                    </button>

                    <button
                        onClick={() => setActive("signup")}
                        className={`flex-1 py-2 transition ${
                            active === "signup"
                                ? "bg-white text-black font-semibold"
                                : "text-white"
                        }`}
                    >
                        Signup
                    </button>
                </div>

                {/* Login Form */}

                {active === "login" && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white/70 focus:outline-none"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white/70 focus:outline-none"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90 transition"
                        >
                            {loading ? "Loading..." : "Login"}
                        </button>
                    </form>
                )}

                {/* Signup Form */}

                {active === "signup" && (
                    <form onSubmit={handleSignup} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white/70 focus:outline-none"
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white/70 focus:outline-none"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white/70 focus:outline-none"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
                        >
                            {loading ? "Loading..." : "Signup"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default HomePage;
