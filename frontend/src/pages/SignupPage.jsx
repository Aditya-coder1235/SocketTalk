import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";


const SignupPage = () => {
    const navigate = useNavigate();

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

            alert("Signup successfully");
            navigate('/login')

        } catch (err) {
            alert(err?.response?.data?.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center">
            <div className="w-[420px] backdrop-blur-lg bg-white/20 border border-white/30 shadow-2xl rounded-2xl p-8 mt-20">
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

                    <p className="text-center text-sm text-gray-700">
                        Already have an account?{" "}
                        <Link to="/login" className="font-medium text-blue-700">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
