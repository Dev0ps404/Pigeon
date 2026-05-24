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
      className="bg-white rounded-[2rem] p-8 w-full shadow-[0_20px_50px_rgba(0,102,204,0.08)] border border-gray-100/90 relative overflow-hidden"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#0052a3] tracking-tight mb-2">
          Reset Password
        </h1>
        <p className="text-gray-500 text-sm">
          {!submitted ? 'Enter your registered email to retrieve recovery link' : 'Instructions sent'}
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleForgotPassword} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block text-left pl-1">
              Email Address
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

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#005cbb] hover:bg-[#0052a3] text-white py-3.5 rounded-xl font-semibold shadow-md shadow-[#0066cc]/10 active:scale-[0.98] transition-all flex justify-center items-center text-sm"
          >
            {loading ? 'Sending instruction...' : 'Send Recovery Instructions'}
          </button>
        </form>
      ) : (
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="text-center py-6 space-y-4"
        >
          <div className="mx-auto w-16 h-16 bg-[#e3f2fd] text-[#0066cc] rounded-full flex items-center justify-center shadow-md">
            <FiCheckCircle size={32} />
          </div>
          <p className="text-sm text-gray-600 font-medium px-2">
            {message}
          </p>
          <div className="pt-2">
            <p className="text-xs text-gray-400">
              Please check your spam or promotions folder if you don't receive it in 2 minutes.
            </p>
          </div>
        </motion.div>
      )}

      <div className="mt-8 text-center">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-xs font-bold text-[#0066cc] hover:underline"
        >
          <FiArrowLeft size={16} />
          Back to login screen
        </Link>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
