import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, LogOut, Settings, ExternalLink, ChevronDown, ShoppingCart, Loader2, CheckCircle2, X, Package } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/client';

const Navbar = ({ isAdmin = false }: { isAdmin?: boolean }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    if (!user) return;
    setLoadingNotifications(true);
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchCartCount = async () => {
    if (!user) return;
    try {
      const res = await apiClient.get('/cart');
      setCartCount(res.data.cart?.items?.length || 0);
    } catch (err) {
      console.error('Failed to fetch cart count', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchCartCount();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className={`${isAdmin ? 'sticky border-b border-white/5 bg-bg-dark' : 'fixed top-10 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-bg-dark/40 backdrop-blur-xl border border-white/10 rounded-[32px]'} z-50 transition-all duration-500`}>
      <nav className={`flex justify-between items-center ${isAdmin ? 'p-4 w-full' : 'px-8 py-5 max-w-7xl mx-auto'}`}>
        <div className="flex items-center gap-8">
          {!isAdmin && (
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-wider uppercase font-bold">Farm<span className="text-primary">Flow</span></span>
            </Link>
          )}
        </div>

        <div className="flex gap-3 items-center">
          {user ? (
            <>
              {/* Notifications Icon */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsProfileOpen(false);
                    if (!isNotificationsOpen) fetchNotifications();
                  }}
                  className={`h-11 w-11 flex items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer ${
                    isNotificationsOpen
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-black text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-fadeIn">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-4 w-80 md:w-96 bg-bg-card border border-white/10 rounded-3xl p-4 z-50 shadow-2xl animate-slideDown">
                    <div className="flex justify-between items-center px-2 py-2 border-b border-white/5 mb-4">
                      <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest">Notifications</h3>
                      <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {unreadCount} New
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
                      {loadingNotifications && notifications.length === 0 ? (
                        <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-primary/30" /></div>
                      ) : notifications.length > 0 ? (
                        notifications.map((notif: any) => (
                          <div 
                            key={notif._id}
                            onClick={() => {
                              if (!notif.read) markAsRead(notif._id);
                              if (notif.relatedId) navigate('/admin/orders');
                              setIsNotificationsOpen(false);
                            }}
                            className={`p-4 rounded-[32px] transition-all cursor-pointer border ${notif.read ? 'bg-white/5 border-transparent opacity-60' : 'bg-primary/10 border-primary/20 hover:bg-primary/20'}`}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <p className={`text-sm leading-snug ${notif.read ? 'text-white/40' : 'text-white font-bold'}`}>
                                {notif.title}
                              </p>
                              {!notif.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5 shadow-lg shadow-primary/50"></div>}
                            </div>
                            <p className="text-xs text-white/40 mt-1 line-clamp-2">{notif.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="py-20 text-center flex flex-col items-center gap-3 text-white/20">
                          <CheckCircle2 size={32} />
                          <p className="text-xs font-bold uppercase tracking-widest">All caught up</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Icon - Hide on Admin */}
              {!isAdmin && (
                <Link
                  to="/cart"
                  className={`relative h-11 w-11 flex items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer ${
                    isActive('/cart')
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-fadeIn">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Profile/Account - Zogstore Style */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className={`h-11 px-3 flex items-center gap-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isProfileOpen
                      ? 'bg-white/10 border-white/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                    {user?.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-white/90 hidden sm:block">{user?.name}</span>
                  <ChevronDown size={14} className={`text-white/40 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-bg-card border border-white/10 rounded-3xl p-2 z-50 shadow-2xl animate-slideDown">
                    <div className="px-4 py-3 border-b border-white/5 mb-2">
                      <p className="text-sm font-bold text-white">{user?.name}</p>
                      <p className="text-xs text-white/40 truncate capitalize">{user?.role}</p>
                    </div>

                    <div className="flex flex-col gap-1">
                      {user?.role === 'farmer' && (
                        <Link 
                          to={`/farm/${(user as any).farmSlug}`} 
                          className="flex items-center gap-3 px-4 py-2.5 rounded-[32px] hover:bg-white/5 transition-colors text-white/70 hover:text-white group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <ExternalLink size={18} className="text-white/30 group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium">Public Farm Profile</span>
                        </Link>
                      )}
                      
                      {user?.role !== 'customer' && (
                        <Link 
                          to="/dashboard" 
                          className="flex items-center gap-3 px-4 py-2.5 rounded-[32px] hover:bg-white/5 transition-colors text-white/70 hover:text-white group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings size={18} className="text-white/30 group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium">Dashboard</span>
                        </Link>
                      )}

                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-[32px] hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300 group text-left w-full cursor-pointer"
                      >
                        <LogOut size={18} className="text-red-400/60 group-hover:text-red-400" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest">
                Login
              </Link>
              <Link to="/register" className="px-6 py-2.5 rounded-xl bg-primary text-black font-bold hover:brightness-110 transition-all text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
