import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Sprout, 
  Users, 
  Receipt,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Beef,
  Package,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: ['admin', 'farmer'] },
    { name: 'My Products', icon: <ShoppingBag size={20} />, path: '/admin/products', roles: ['farmer', 'admin'] },
    { name: 'Orders', icon: <Package size={20} />, path: '/admin/orders', roles: ['farmer', 'admin'] },
    { name: 'Crops Management', icon: <Sprout size={20} />, path: '/crops', roles: ['farmer', 'admin'] },
    { name: 'Livestock/Cattle', icon: <Beef size={20} />, path: '/cattles', roles: ['farmer', 'admin'] },
    { name: 'Employees', icon: <Users size={20} />, path: '/employees', roles: ['farmer', 'admin'] },
    { name: 'Inventory', icon: <Package size={20} />, path: '/inventory', roles: ['farmer', 'admin'] },
    { name: 'Expenses', icon: <Receipt size={20} />, path: '/expenses', roles: ['farmer', 'admin'] },
    { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings', roles: ['farmer', 'admin', 'customer'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  const farmName = (user as any)?.farmName || 'FarmFlow';

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-black rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 active:scale-90 transition-all"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col border-r border-white/5 backdrop-blur-xl transition-all duration-300 ease-in-out bg-bg-dark/80 
          ${isOpen || isMobileMenuOpen ? 'w-[280px] translate-x-0' : 'w-0 lg:w-[88px] -translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-4 border-b border-white/5 mb-2 overflow-hidden">
          <div className="w-10 h-10 bg-primary rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-black text-xl">F</span>
          </div>
          {(isOpen || isMobileMenuOpen) && (
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg font-bold  text-white leading-none mb-1 truncate">
                {user?.role === 'farmer' ? farmName : 'FarmFlow'}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                {user?.role === 'farmer' ? 'Farm Panel' : 'Admin Console'}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
          {filteredNavItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all duration-300 border
                ${isActive 
                  ? 'bg-primary/20 text-primary border-primary/30 font-bold shadow-lg shadow-primary/5' 
                  : 'text-white/50 hover:bg-white/5 hover:text-white border-transparent'
                }
              `}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {(isOpen || isMobileMenuOpen) && <span className="whitespace-nowrap">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={logout} 
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 w-full text-left
              ${!isOpen && !isMobileMenuOpen ? 'justify-center' : ''}`}
          >
            <LogOut size={20} />
            {(isOpen || isMobileMenuOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
