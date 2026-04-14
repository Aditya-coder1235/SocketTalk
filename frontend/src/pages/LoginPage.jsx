import {useState} from 'react'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
     const navigate = useNavigate();

     const [email, setEmail] = useState("");
     const [password, setPassword] = useState("");

     const [loading, setLoading] = useState(false);

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
            navigate("/");
        } catch (err) {
            alert(err?.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

  return (
      <div className="flex justify-center items-center">
          <div className="w-[420px] backdrop-blur-lg bg-white/20 border border-white/30 shadow-2xl rounded-2xl p-8 mt-20">
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

                  <p className="text-center text-sm text-gray-700">
                      New here?{" "}
                      <Link to="/signup" className="font-medium text-blue-700">
                          Create account
                      </Link>
                  </p>
              </form>
          </div>
      </div>
  );
}

export default LoginPage
