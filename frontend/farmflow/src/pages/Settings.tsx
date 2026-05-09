import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { Save, User, MapPin, Image as ImageIcon, Loader2, CheckCircle, Info, Building, Key, X } from 'lucide-react';

const Settings = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    address: (user as any)?.address || '',
    coverImage: (user as any)?.coverImage || '',
    farmName: (user as any)?.farmName || '',
    farmDescription: (user as any)?.farmDescription || '',
    logo: (user as any)?.logo || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Password Change State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        address: (user as any).address || '',
        coverImage: (user as any).coverImage || '',
        farmName: (user as any).farmName || '',
        farmDescription: (user as any).farmDescription || '',
        logo: (user as any).logo || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const res = await apiClient.put('/auth/update', formData);
      // Update local storage and context
      login(localStorage.getItem('ff_token') || '', res.data.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordError('New passwords do not match');
    }

    if (passwordData.newPassword.length < 6) {
      return setPasswordError('Password must be at least 6 characters');
    }

    setPasswordLoading(true);
    try {
      await apiClient.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-white ">Account Settings</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">Manage your personal information and farm profile</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-bg-primary/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 flex flex-col gap-6">
            {success && (
              <div className="bg-green-100 border border-green-200 text-primary p-4 rounded-[32px] flex items-center gap-3">
                <CheckCircle size={20} />
                <span className="font-bold">Profile updated successfully!</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-[32px] flex items-center gap-3">
                <Info size={20} />
                <span className="font-bold">{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-white/80 ml-2">Display Name</label>
              <div className="relative flex items-center group">
                <User size={18} className="absolute left-4 text-white/30 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  className="w-full bg-bg-primary border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            </div>

            {user?.role === 'farmer' && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-white/80 ml-2">Farm Name</label>
                  <div className="relative flex items-center group">
                    <Building size={18} className="absolute left-4 text-white/30 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      className="w-full bg-bg-primary border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                      value={formData.farmName}
                      onChange={(e) => setFormData({...formData, farmName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-white/80 ml-2">Farm Address</label>
                  <div className="relative flex items-center group">
                    <MapPin size={18} className="absolute left-4 text-white/30 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      className="w-full bg-bg-primary border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-white/80 ml-2">Cover Image URL</label>
                  <div className="relative flex items-center group">
                    <ImageIcon size={18} className="absolute left-4 text-white/30 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="url" 
                      className="w-full bg-bg-primary border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-white/80 ml-2">Farm Description</label>
                  <textarea 
                    className="w-full bg-bg-primary border border-white/10 rounded-3xl py-4 px-6 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium min-h-[120px]"
                    value={formData.farmDescription}
                    onChange={(e) => setFormData({...formData, farmDescription: e.target.value})}
                    placeholder="Tell customers about your farm..."
                  />
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="bg-primary text-black font-bold h-12 rounded-full flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all mt-4 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-bg-primary/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-6">
            <h3 className="font-bold text-white mb-4">Preview</h3>
            <div className="w-full h-40 rounded-[32px] bg-white/10 overflow-hidden mb-4 border border-white/10">
              {formData.coverImage ? (
                <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <ImageIcon size={32} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-lg">
                {formData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-white leading-tight">{formData.name}</p>
                <p className="text-xs text-white/40 leading-tight">{user?.role === 'farmer' ? formData.farmName : 'Customer'}</p>
              </div>
            </div>
          </div>

          <div className="bg-bg-primary/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-6">
            <h3 className="font-bold text-white mb-2">Security</h3>
            <p className="text-sm text-white/40 mb-4">Update your password or manage security settings.</p>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-primary font-bold text-sm hover:underline"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)} />
          <div className="bg-bg-primary border border-white/10 w-full max-w-md rounded-[32px] p-8 relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white ">Change Password</h2>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
              {passwordSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 text-primary p-4 rounded-2xl flex items-center gap-3">
                  <CheckCircle size={20} />
                  <span className="text-sm font-bold">Password updated successfully!</span>
                </div>
              )}

              {passwordError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3">
                  <Info size={20} />
                  <span className="text-sm font-bold">{passwordError}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/40 ml-2 uppercase tracking-widest">Current Password</label>
                <div className="relative flex items-center group">
                  <Key size={16} className="absolute left-4 text-white/30 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="password" 
                    className="w-full bg-bg-primary border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all font-medium"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/40 ml-2 uppercase tracking-widest">New Password</label>
                <div className="relative flex items-center group">
                  <Key size={16} className="absolute left-4 text-white/30 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="password" 
                    className="w-full bg-bg-primary border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all font-medium"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/40 ml-2 uppercase tracking-widest">Confirm New Password</label>
                <div className="relative flex items-center group">
                  <Key size={16} className="absolute left-4 text-white/30 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="password" 
                    className="w-full bg-bg-primary border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all font-medium"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={passwordLoading}
                className="bg-primary text-black font-bold h-12 rounded-full flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all mt-2 disabled:opacity-50"
              >
                {passwordLoading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
