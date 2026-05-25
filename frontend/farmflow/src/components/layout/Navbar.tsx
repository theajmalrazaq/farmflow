/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, LogOut, Settings, ExternalLink, ChevronDown, ShoppingCart, Loader2, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../api/client';
import Button from '../ui/Button';

const Navbar = ({ isAdmin = false }: { isAdmin?: boolean }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    if (!user || user.role === 'customer') return;
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
      setCartCount(res.data.cart?.totalItems || 0);
    } catch (err) {
      console.error('Failed to fetch cart count', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchCartCount();
      
      window.addEventListener('cartUpdated', fetchCartCount);

      const interval = setInterval(fetchNotifications, 30000);
      return () => {
        clearInterval(interval);
        window.removeEventListener('cartUpdated', fetchCartCount);
      };
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
  
  const markAllRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const clearAll = async () => {
    try {
      await apiClient.delete('/notifications/clear');
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  return (
    <header className={`${isAdmin ? 'sticky border-b border-white/5 bg-bg-dark' : 'fixed top-10 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-bg-dark/60 backdrop-blur-xl border border-white/10 rounded-4xl shadow-2xl shadow-black/50'} z-50 transition-all duration-500`}>
      <nav className={`flex justify-between items-center ${isAdmin ? 'p-4 w-full' : 'px-8 py-5 max-w-7xl mx-auto'}`}>
        <div className="flex items-center gap-12">
          {!isAdmin && (
            <>
              <Link to="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="FarmFlow" className="h-12 w-auto" />
              </Link>

              <div className="hidden md:flex items-center gap-8">
                <Link 
                  to="/discover" 
                  className={`text-sm font-bold  transition-all ${isActive('/discover') ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                >
                  Discover
                </Link>
                <Link 
                  to="/shop" 
                  className={`text-sm font-bold  transition-all ${isActive('/shop') ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                >
                  Shop
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 items-center">
          {user ? (
            <>
              
              {user?.role !== 'customer' && (
                <div className="relative">
                  <Button
                    size="icon"
                    variant={isNotificationsOpen ? 'primary' : 'secondary'}
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      setIsProfileOpen(false);
                      if (!isNotificationsOpen) fetchNotifications();
                    }}
                    className="relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-black text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-fadeIn">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-4 w-80 md:w-96 bg-bg-card border border-white/10 rounded-3xl p-4 z-50  animate-slideDown">
                      <div className="flex justify-between items-center px-2 py-2 border-b border-white/5 mb-4">
                        <div className="flex flex-col">
                          <h3 className="text-sm font-bold text-white ">Notifications</h3>
                          <span className="text-[10px] font-black text-primary uppercase mt-0.5">
                            {unreadCount} New Alerts
                          </span>
                        </div>
                        <div className="flex gap-2">
                           <Button 
                             size="sm"
                             variant="secondary"
                             onClick={markAllRead}
                             className="text-[10px]"
                           >
                             Mark Read
                           </Button>
                           <Button 
                             size="sm"
                             variant="danger"
                             onClick={clearAll}
                             className="text-[10px]"
                           >
                             Clear
                           </Button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 max-h-100 overflow-y-auto no-scrollbar pr-1">
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
                              className={`p-4 rounded-4xl transition-all cursor-pointer border ${notif.read ? 'bg-white/5 border-transparent opacity-60' : 'bg-primary/10 border-primary/20 hover:bg-primary/20'}`}
                            >
                              <div className="flex justify-between items-start gap-3">
                                <p className={`text-sm leading-snug ${notif.read ? 'text-white/40' : 'text-white font-bold'}`}>
                                  {notif.title}
                                </p>
                                {!notif.read && <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5"></div>}
                              </div>
                              <p className="text-xs text-white/40 mt-1 line-clamp-2">{notif.message}</p>
                            </div>
                          ))
                        ) : (
                          <div className="py-20 text-center flex flex-col items-center gap-3 text-white/20">
                            <CheckCircle2 size={32} />
                            <p className="text-xs font-bold ">All caught up</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {user?.role === 'customer' && (
                <Link to="/cart">
                  <Button
                    size="icon"
                    variant={isActive('/cart') ? 'primary' : 'secondary'}
                    className="relative"
                  >
                    <ShoppingCart className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-fadeIn">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}

              
              <div className="relative">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className={`h-11 px-3 ${isProfileOpen ? 'bg-white/10 border-white/20' : ''}`}
                  rightIcon={<ChevronDown size={14} className={`text-white/40 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />}
                >
                  <div className="w-7 h-7 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
                    {user?.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-white/90 hidden sm:block">{user?.name}</span>
                </Button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-bg-card border border-white/10 rounded-3xl p-2 z-50  animate-slideDown">
                    <div className="px-4 py-3 border-b border-white/5 mb-2">
                      <p className="text-sm font-bold text-white">{user?.name}</p>
                      <p className="text-xs text-white/40 truncate capitalize">{user?.role}</p>
                    </div>

                    <div className="flex flex-col gap-1">
                      {user?.role === 'farmer' && (
                        <Link 
                          to={`/farm/${(user as any).farmSlug}`} 
                          className="flex items-center gap-3 px-4 py-2.5 rounded-4xl hover:bg-white/5 transition-colors text-white/70 hover:text-white group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <ExternalLink size={18} className="text-white/30 group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium">Public Farm Profile</span>
                        </Link>
                      )}
                      
                      {user?.role !== 'customer' && (
                        <Link 
                          to="/dashboard" 
                          className="flex items-center gap-3 px-4 py-2.5 rounded-4xl hover:bg-white/5 transition-colors text-white/70 hover:text-white group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings size={18} className="text-white/30 group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium">Dashboard</span>
                        </Link>
                      )}

                      <Button 
                        variant="ghost"
                        onClick={handleLogout}
                        className="justify-start px-4 py-2.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 w-full"
                        leftIcon={<LogOut size={18} className="text-red-400/60" />}
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
