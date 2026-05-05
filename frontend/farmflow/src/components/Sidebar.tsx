import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Sprout, 
  Package, 
  Receipt, 
  ShoppingCart, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Products', icon: <ShoppingBag size={20} />, path: '/products' },
    { name: 'Crops', icon: <Sprout size={20} />, path: '/crops', roles: ['farmer', 'admin'] },
    { name: 'Inventory', icon: <Package size={20} />, path: '/inventory', roles: ['farmer', 'admin'] },
    { name: 'Expenses', icon: <Receipt size={20} />, path: '/expenses', roles: ['farmer', 'admin'] },
    { name: 'Cart', icon: <ShoppingCart size={20} />, path: '/cart' },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <motion.aside 
      className={`h-screen sticky top-0 flex flex-col border-r border-border-subtle z-50 glass overflow-hidden`}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <span className="text-2xl font-extrabold tracking-tight">
            Farm<span className="text-primary">Flow</span>
          </span>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-bg-accent text-zinc-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 flex flex-col gap-1">
        {filteredNavItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
              ${isActive 
                ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(34,197,94,0.2)]' 
                : 'text-zinc-400 hover:bg-bg-accent hover:text-white'
              }
            `}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border-subtle">
        <button 
          onClick={logout} 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
