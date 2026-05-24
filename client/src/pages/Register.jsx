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
      <div className="mb-7">
        <h1
          className="text-[34px] leading-tight font-extrabold text-slate-900"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          Create Account
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed mt-2">
          Join the community and start building your secure network.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-3">
        <div>
          <label className="text-[13px] font-semibold text-slate-600 mb-2 block">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              <FiUser size={16} />
            </div>
            <input
              type="text"
              placeholder="pigeon_flyer"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#EEF2FF] border border-[#E3E9FF] focus:border-indigo-400/60 focus:outline-none focus:ring-4 focus:ring-indigo-200/60 text-sm text-slate-800 placeholder-slate-400 transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-[13px] font-semibold text-slate-600 mb-2 block">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              <FiMail size={16} />
            </div>
            <input
              type="email"
              placeholder="you@pigeon.chat"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#EEF2FF] border border-[#E3E9FF] focus:border-indigo-400/60 focus:outline-none focus:ring-4 focus:ring-indigo-200/60 text-sm text-slate-800 placeholder-slate-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-[13px] font-semibold text-slate-600 mb-2 block">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              <FiLock size={16} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-[#EEF2FF] border border-[#E3E9FF] focus:border-indigo-400/60 focus:outline-none focus:ring-4 focus:ring-indigo-200/60 text-sm text-slate-800 placeholder-slate-400 transition"
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
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-indigo-500/30 transition"
        >
          {loading ? "Creating account..." : "Create Account ->"}
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

      {/* Social Options */}
      <div className="grid grid-cols-2 gap-3 mb-7 w-full max-w-sm">
        {/* Custom Google Button Container with Hidden GoogleLogin */}
        <div className="relative h-11 w-full">
          {/* Custom Google Button */}
          <button 
            type="button"
            className="absolute inset-0 flex items-center justify-center gap-2.5 w-full h-full bg-white border border-slate-200 rounded-xl text-slate-700 text-[13px] font-medium shadow-sm pointer-events-none transition-all duration-200"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google
          </button>
          
          {/* Overlay Hidden GoogleLogin Iframe */}
          <div className="absolute inset-0 opacity-[0.01] overflow-hidden cursor-pointer w-full h-full flex justify-center items-center">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={() => toast.error('Google Registration Failed')} 
              theme="outline" 
              size="large"
              width="360px"
            />
          </div>
        </div>

        {/* Custom Apple Button */}
        <motion.button 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={() => toast.success('Apple ID registration initiated')}
          className="flex items-center justify-center gap-2.5 h-11 w-full border border-transparent rounded-xl bg-[#F0F4FA] hover:bg-[#E2E8F0] text-slate-800 text-[13px] font-medium shadow-sm transition-all duration-200"
        >
          <svg className="w-4 h-4 text-slate-800 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.62.71-1.16 1.85-1.02 2.96 1.11.09 2.26-.56 2.97-1.4" />
          </svg>
          Continue with Apple
        </motion.button>
      </div>

      <p className="text-center text-xs text-slate-500 font-medium">
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
