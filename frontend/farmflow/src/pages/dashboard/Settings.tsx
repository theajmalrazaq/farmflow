import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { Save, User, MapPin, Image as ImageIcon, Loader2, Building, Key, X, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const Settings = () => {
  const { showToast } = useToast();
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    address: user?.address || '',
    coverImage: user?.coverImage || '',
    farmName: user?.farmName || '',
    farmDescription: user?.farmDescription || '',
    logo: user?.logo || ''
  });
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        address: user.address || '',
        coverImage: user.coverImage || '',
        farmName: user.farmName || '',
        farmDescription: user.farmDescription || '',
        logo: user.logo || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiClient.put('/auth/update', formData);
      
      login(localStorage.getItem('ff_token') || '', res.data.user);
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showToast('New passwords do not match', 'error');
    }

    if (passwordData.newPassword.length < 6) {
      return showToast('Password must be at least 6 characters', 'error');
    }

    setPasswordLoading(true);
    try {
      await apiClient.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showToast('Password updated successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
      }, 2000);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link = user?.farmSlug ? `${window.location.origin}/farm/${user.farmSlug}` : '';
    if (link) {
      navigator.clipboard.writeText(link);
      showToast('Farm link copied to clipboard!', 'success');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'logo') setLogoUploading(true);
      else setCoverUploading(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [type]: reader.result as string });
        if (type === 'logo') setLogoUploading(false);
        else setCoverUploading(false);
      };
      reader.readAsDataURL(file);
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
                  <label className="text-sm font-bold text-white/80 ml-2">Public Farm Link</label>
                  <div className="relative flex items-center group">
                    <ExternalLink size={18} className="absolute left-4 text-white/30 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      className="w-full bg-bg-primary border border-white/10 rounded-full py-3 pl-12 pr-12 text-white/40 font-medium cursor-default focus:outline-none"
                      value={user?.farmSlug ? `${window.location.origin}/farm/${user.farmSlug}` : 'Generating link...'}
                      readOnly
                    />
                    <button 
                      type="button"
                      onClick={handleCopyLink}
                      className="absolute right-4 text-white/30 hover:text-primary transition-colors"
                      title="Copy Link"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  <p className="text-[10px] text-white/30 ml-4 italic">This is your unique store URL. Share it with your customers!</p>
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
                  <label className="text-sm font-bold text-white/80 ml-2">Farm Logo</label>
                  <div className="flex items-center gap-4 p-4 bg-bg-primary border border-white/10 rounded-3xl group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center relative">
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-white/20" size={24} />
                      )}
                      {logoUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="animate-spin text-primary" size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <p className="text-[10px] font-bold text-white/40 ">Recommended: 200x200px</p>
                      <label className="text-sm font-bold text-primary hover:underline cursor-pointer">
                        {formData.logo ? 'Change Logo' : 'Upload Logo'}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                      </label>
                    </div>
                    {formData.logo && (
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, logo: ''})}
                        className="text-white/20 hover:text-red-500 transition-colors p-2"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-white/80 ml-2">Cover Image</label>
                  <div className="flex flex-col gap-3 p-4 bg-bg-primary border border-white/10 rounded-3xl group">
                    <div className="w-full h-32 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center relative">
                      {formData.coverImage ? (
                        <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-white/20" size={32} />
                      )}
                      {coverUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="animate-spin text-primary" size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-bold text-white/40 ">Recommended: 1200x400px</p>
                      <div className="flex gap-4">
                        {formData.coverImage && (
                          <button 
                            type="button" 
                            onClick={() => setFormData({...formData, coverImage: ''})}
                            className="text-xs font-bold text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                        <label className="text-xs font-bold text-primary hover:underline cursor-pointer">
                          {formData.coverImage ? 'Change Image' : 'Upload Image'}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'coverImage')} />
                        </label>
                      </div>
                    </div>
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
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-lg overflow-hidden">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo Preview" className="w-full h-full object-cover" />
                ) : (
                  formData.name.charAt(0).toUpperCase()
                )}
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

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/40 ml-2 ">Current Password</label>
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
                <label className="text-xs font-bold text-white/40 ml-2 ">New Password</label>
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
                <label className="text-xs font-bold text-white/40 ml-2 ">Confirm New Password</label>
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
