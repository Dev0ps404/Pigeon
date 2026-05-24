import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";
import api from "../services/api";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password)
      return toast.error("Please fill all fields");

    try {
      setLoading(true);
      const { data } = await api.post("/auth/register", {
        username,
        email,
        password,
      });
      dispatch(setCredentials({ user: data, token: data.token }));
      toast.success("Registration successful!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const { data } = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });
      dispatch(setCredentials({ user: data, token: data.token }));
      toast.success("Successfully logged in with Google!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Google Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="w-full flex flex-col text-left"
    >
      <div className="mb-8">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
          Get started
        </span>
        <h1
          className="text-4xl font-bold text-slate-900 mt-2"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          Create your account
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed mt-2">
          Join the community and start building your secure network.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-2 block">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              <FiUser size={16} />
            </div>
            <input
              type="text"
              placeholder="pigeon_flyer"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#F2F5FF] border border-[#E3E9FF] focus:border-indigo-400/60 focus:outline-none focus:ring-4 focus:ring-indigo-200/60 text-sm text-slate-800 placeholder-slate-400 transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-2 block">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              <FiMail size={16} />
            </div>
            <input
              type="email"
              placeholder="you@pigeon.chat"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#F2F5FF] border border-[#E3E9FF] focus:border-indigo-400/60 focus:outline-none focus:ring-4 focus:ring-indigo-200/60 text-sm text-slate-800 placeholder-slate-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-2 block">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              <FiLock size={16} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-[#F2F5FF] border border-[#E3E9FF] focus:border-indigo-400/60 focus:outline-none focus:ring-4 focus:ring-indigo-200/60 text-sm text-slate-800 placeholder-slate-400 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition"
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-indigo-500/20 transition"
        >
          {loading ? "Creating account..." : "Create Account"}
        </motion.button>
      </form>

      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <span className="relative bg-white px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          Or continue with
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 mb-6">
        <div className="flex justify-center rounded-2xl border border-slate-200 bg-white shadow-sm py-2">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google Registration Failed")}
            theme="outline"
            size="large"
            width="210"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={() => toast.success("Apple ID registration initiated")}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 border border-slate-200 rounded-2xl bg-[#F2F5FF] hover:bg-[#E9EDFF] transition text-slate-700 font-semibold shadow-sm"
        >
          <svg
            className="w-4 h-4 text-slate-700 fill-current shrink-0"
            viewBox="0 0 24 24"
            width="16"
            height="16"
          >
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.62.71-1.16 1.85-1.02 2.96 1.11.09 2.26-.56 2.97-1.4" />
          </svg>
          Continue with Apple
        </motion.button>
      </div>

      <p className="text-center text-sm text-slate-500 font-medium">
        Already have an account?
        <Link
          to="/login"
          className="text-indigo-600 font-semibold hover:text-indigo-500 ml-1"
        >
          Sign In
        </Link>
      </p>
    </motion.div>
  );
};

export default Register;
