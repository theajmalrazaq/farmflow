import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="h-[72px] border-b border-border-subtle px-8 flex items-center justify-between bg-bg-primary/50 backdrop-blur-md sticky top-0 z-40">
      <div className="flex-1 max-w-md">
        <div className="relative flex items-center group">
          <Search size={18} className="absolute left-3.5 text-zinc-500 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-full bg-bg-surface border border-border-subtle rounded-xl py-2 pl-11 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-bg-primary"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-border-subtle">
          <div className="text-right">
            <span className="block text-sm font-semibold text-white leading-tight">{user?.name}</span>
            <span className="block text-xs text-zinc-500 capitalize leading-tight">{user?.role}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
