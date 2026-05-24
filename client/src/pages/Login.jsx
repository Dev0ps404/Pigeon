import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });
      dispatch(setCredentials({ user: data, token: data.token }));
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/google', { credential: credentialResponse.credential });
      dispatch(setCredentials({ user: data, token: data.token }));
      toast.success('Successfully logged in with Google!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-[#111827]/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 w-full shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden transition-all duration-300 hover:border-white/10"
    >
      {/* Decorative top ambient glow line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />

      <div className="text-center mb-8 relative z-10">
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent tracking-tight mb-2">
          Welcome Back
        </h1>
        <p className="text-slate-400 text-sm font-medium">Login to continue your flight</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5 relative z-10">
        {/* Email Field */}
        <div>
          <label className="text-[10px] font-extrabold text-slate-400 mb-2 block text-left pl-1 uppercase tracking-widest">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
              <FiMail size={18} />
            </div>
            <input 
              type="email" 
              placeholder="pigeon@flight.com"
              className="w-full pl-11 pr-4 py-3.5 bg-white/[0.02] border border-white/5 focus:border-blue-500/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white/[0.04] text-sm text-slate-200 placeholder-slate-600 transition-all font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
        </div>
        
        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-2 pl-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline transition-colors">
              Forgot?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
              <FiLock size={18} />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3.5 bg-white/[0.02] border border-white/5 focus:border-blue-500/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white/[0.04] text-sm text-slate-200 placeholder-slate-600 tracking-wide transition-all font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit" 
          disabled={loading} 
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 text-white py-3.5 rounded-2xl font-extrabold shadow-lg shadow-blue-500/10 hover:shadow-xl active:scale-[0.98] transition-all flex justify-center items-center text-xs uppercase tracking-widest font-black"
        >
          {loading ? 'Logging in...' : 'Login'}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="relative my-7 flex items-center justify-center relative z-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5"></div>
        </div>
        <span className="relative bg-[#111827] px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
          Or continue with
        </span>
      </div>

      {/* Social Login Options */}
      <div className="space-y-3 mb-6 relative z-10 flex flex-col items-center">
        <div className="flex justify-center w-full max-w-[320px] rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors">
          <GoogleLogin 
            onSuccess={handleGoogleSuccess} 
            onError={() => toast.error('Google Login Failed')} 
            theme="dark" 
            size="large"
            width="320px"
          />
        </div>
        <motion.button 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={() => toast.success('Apple ID authentication initiated')}
          className="w-full max-w-[320px] mx-auto flex items-center justify-center gap-2.5 py-3 px-4 border border-white/5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 active:scale-[0.98] transition-all font-bold text-slate-350 text-sm shadow-sm"
        >
          <svg className="w-4 h-4 text-white fill-current shrink-0" viewBox="0 0 24 24" width="16" height="16">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.62.71-1.16 1.85-1.02 2.96 1.11.09 2.26-.56 2.97-1.4" />
          </svg>
          Continue with Apple
        </motion.button>
      </div>

      <p className="text-center text-xs text-slate-400 font-semibold relative z-10">
        Don't have an account? <Link to="/register" className="text-blue-400 font-extrabold hover:text-blue-350 hover:underline ml-1">Sign up</Link>
      </p>
    </motion.div>
  );
};

export default Login;
