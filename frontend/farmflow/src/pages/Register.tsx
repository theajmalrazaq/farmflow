import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { UserPlus, Mail, Lock, User, Briefcase, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/auth/register', formData);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,var(--color-primary-glow),transparent),radial-gradient(circle_at_bottom_left,var(--color-secondary-glow),transparent),#050505]">
      <motion.div 
        className="w-full max-w-[480px] p-10 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <span className="text-2xl font-extrabold tracking-tight">Farm<span className="text-primary">Flow</span></span>
          <h1 className="text-3xl font-bold mt-4 mb-2">Create Account</h1>
          <p className="text-zinc-400 text-sm">Join the future of agricultural management</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3.5 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-400">Full Name</label>
            <div className="relative flex items-center group">
              <User size={18} className="absolute left-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="John Doe" 
                className="w-full bg-bg-surface border border-border-subtle rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-400">Email Address</label>
            <div className="relative flex items-center group">
              <Mail size={18} className="absolute left-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="email" 
                placeholder="name@example.com" 
                className="w-full bg-bg-surface border border-border-subtle rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-400">Password</label>
            <div className="relative flex items-center group">
              <Lock size={18} className="absolute left-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-bg-surface border border-border-subtle rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-400">Account Type</label>
            <div className="relative flex items-center group">
              <Briefcase size={18} className="absolute left-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
              <select 
                className="w-full bg-bg-surface border border-border-subtle rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="customer">Customer (Buyer)</option>
                <option value="farmer">Farmer (Seller/Manager)</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full h-12 mt-4 bg-primary text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><UserPlus size={20} /> Get Started</>}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
