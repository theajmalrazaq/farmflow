import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { UserPlus, Mail, Lock, User, Briefcase, MapPin, Image as ImageIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    farmName: '',
    address: '',
    coverImage: '',
    logo: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role === 'farmer') {
      setStep(2);
    } else {
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/auth/register', formData);
      login(res.data.token, res.data.user);
      if (res.data.user.role === 'customer') {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
      
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,var(--color-primary-glow),transparent),radial-gradient(circle_at_bottom_left,var(--color-secondary-glow),transparent),#050505]">
      <div className="w-full max-w-[480px] p-10 rounded-[32px] bg-bg-primary/5 backdrop-blur-xl border border-white/10 flex flex-col gap-8">
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="FarmFlow" className="h-12 w-auto mb-2" />
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">
            {step === 1 ? 'Create Account' : 'Farm Details'}
          </h1>
          <p className="text-white/40 text-sm">
            {step === 1 ? 'Join the future of agricultural management' : 'Tell us more about your organic farm'}
          </p>
        </div>

        <form onSubmit={step === 1 ? handleNext : handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3.5 rounded-full text-sm font-medium">
              {error}
            </div>
          )}

          {step === 1 ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/40">Full Name</label>
                <div className="relative flex items-center group">
                  <User size={18} className="absolute left-4 text-white/40 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="w-full bg-bg-primary border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/40">Email Address</label>
                <div className="relative flex items-center group">
                  <Mail size={18} className="absolute left-4 text-white/40 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="w-full bg-bg-primary border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/40">Password</label>
                <div className="relative flex items-center group">
                  <Lock size={18} className="absolute left-4 text-white/40 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full bg-bg-primary border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/40">Account Type</label>
                <div className="relative flex items-center group">
                  <Briefcase size={18} className="absolute left-4 text-white/40 group-focus-within:text-primary transition-colors" />
                  <select 
                    className="w-full bg-bg-primary border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer font-syne"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="customer">Customer (Buyer)</option>
                    <option value="farmer">Farmer (Seller/Manager)</option>
                  </select>
                </div>
              </div>

              <Button 
                type="submit" 
                isLoading={loading}
                fullWidth
                size="lg"
                className="mt-4"
                rightIcon={formData.role === 'farmer' ? <ArrowRight size={20} /> : undefined}
                leftIcon={formData.role !== 'farmer' ? <UserPlus size={20} /> : undefined}
              >
                {formData.role === 'farmer' ? 'Next Step' : 'Create Account'}
              </Button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/40">Farm Name</label>
                <div className="relative flex items-center group">
                  <Briefcase size={18} className="absolute left-4 text-white/40 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Green Valley Farms" 
                    className="w-full bg-bg-primary border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                    value={formData.farmName}
                    onChange={(e) => setFormData({...formData, farmName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/40">Farm Address</label>
                <div className="relative flex items-center group">
                  <MapPin size={18} className="absolute left-4 text-white/40 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Chakwal, Punjab, Pakistan" 
                    className="w-full bg-bg-primary border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/40">Logo URL</label>
                <div className="relative flex items-center group">
                  <User size={18} className="absolute left-4 text-white/40 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/logo..." 
                    className="w-full bg-bg-primary border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                    value={formData.logo}
                    onChange={(e) => setFormData({...formData, logo: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/40">Cover Image URL</label>
                <div className="relative flex items-center group">
                  <ImageIcon size={18} className="absolute left-4 text-white/40 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/cover..." 
                    className="w-full bg-bg-primary border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  leftIcon={<ArrowLeft size={20} />}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  isLoading={loading}
                  className="flex-[2]"
                  leftIcon={<UserPlus size={20} />}
                >
                  Complete Signup
                </Button>
              </div>
            </>
          )}
        </form>

        <p className="text-center text-sm text-white/40">
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
