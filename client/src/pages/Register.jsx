import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) return toast.error('Please fill all fields');
    
    try {
      setLoading(true);
      const { data } = await api.post('/auth/register', { username, email, password });
      dispatch(setCredentials({ user: data, token: data.token }));
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-[2rem] p-8 w-full shadow-[0_20px_50px_rgba(0,102,204,0.08)] border border-gray-100/90 relative overflow-hidden"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#0052a3] tracking-tight mb-2">Create Account</h1>
        <p className="text-gray-500 text-sm">Sign up to start your flight</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        {/* Username Field */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block text-left pl-1">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <FiUser size={18} />
            </div>
            <input 
              type="text" 
              placeholder="pigeon_flyer"
              className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/10 focus:border-[#0066cc]/40 focus:bg-white text-sm text-gray-800 placeholder-gray-400 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block text-left pl-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <FiMail size={18} />
            </div>
            <input 
              type="email" 
              placeholder="pigeon@flight.com"
              className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/10 focus:border-[#0066cc]/40 focus:bg-white text-sm text-gray-800 placeholder-gray-400 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
        </div>
        
        {/* Password Field */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block text-left pl-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <FiLock size={18} />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/10 focus:border-[#0066cc]/40 focus:bg-white text-sm text-gray-800 placeholder-gray-400 tracking-wide transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-[#005cbb] hover:bg-[#0052a3] text-white py-3.5 rounded-xl font-semibold shadow-md shadow-[#0066cc]/10 active:scale-[0.98] transition-all flex justify-center items-center text-sm"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100"></div>
        </div>
        <span className="relative bg-white px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          Or continue with
        </span>
      </div>

      {/* Social Register Options */}
      <div className="grid grid-cols-2 gap-3.5 mb-6">
        <div className="flex justify-center w-full col-span-1"><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error('Google Registration Failed')} theme="outline" text="signup_with" /></div>
        <button 
          type="button"
          onClick={() => toast.success('Apple ID registration initiated')}
          className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200/80 rounded-xl bg-white hover:bg-gray-50 transition-all font-semibold text-gray-600 text-xs shadow-sm"
        >
          <svg className="w-4 h-4 text-black fill-current" viewBox="0 0 24 24" width="16" height="16">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.62.71-1.16 1.85-1.02 2.96 1.11.09 2.26-.56 2.97-1.4" />
          </svg>
          Apple
        </button>
      </div>

      <p className="text-center text-xs text-gray-500 font-medium">
        Already have an account? <Link to="/login" className="text-[#0066cc] font-bold hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
};

export default Register;

