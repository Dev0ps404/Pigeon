import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address');

    try {
      setLoading(true);
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message || 'Simulated password reset email sent successfully.');
      setSubmitted(true);
      toast.success('Reset link dispatched!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to dispatch reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-[#111827]/40 backdrop-blur-2xl rounded-[2.5rem] p-8 w-full shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden transition-all duration-300 hover:border-white/10"
    >
      {/* Decorative top ambient glow line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60" />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-indigo-200 to-blue-300 bg-clip-text text-transparent tracking-tight mb-2">
          Reset Password
        </h1>
        <p className="text-slate-400 text-sm">
          {!submitted ? 'Enter your registered email to retrieve recovery link' : 'Instructions sent'}
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleForgotPassword} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 mb-1.5 block text-left pl-1 uppercase tracking-widest">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <FiMail size={18} />
              </div>
              <input 
                type="email" 
                placeholder="pigeon@flight.com"
                className="w-full pl-11 pr-4 py-3.5 bg-white/[0.02] border border-white/5 focus:border-cyan-500/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:bg-white/[0.04] text-sm text-slate-200 placeholder-slate-600 transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-cyan-600 via-indigo-650 to-blue-600 hover:from-cyan-500 hover:via-indigo-550 hover:to-blue-500 text-white py-3.5 rounded-2xl font-extrabold shadow-lg shadow-cyan-500/10 hover:shadow-xl active:scale-[0.98] transition-all flex justify-center items-center text-xs uppercase tracking-widest font-black"
          >
            {loading ? 'Sending instruction...' : 'Send Recovery Instructions'}
          </motion.button>
        </form>
      ) : (
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="text-center py-6 space-y-4"
        >
          <div className="mx-auto w-16 h-16 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full flex items-center justify-center shadow-md">
            <FiCheckCircle size={32} />
          </div>
          <p className="text-sm text-slate-350 font-medium px-2">
            {message}
          </p>
          <div className="pt-2">
            <p className="text-xs text-slate-500">
              Please check your spam or promotions folder if you don't receive it in 2 minutes.
            </p>
          </div>
        </motion.div>
      )}

      <div className="mt-8 text-center">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline"
        >
          <FiArrowLeft size={16} />
          Back to login screen
        </Link>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
