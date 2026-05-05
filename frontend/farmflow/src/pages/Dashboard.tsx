import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Sprout,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, trend, trendValue }: any) => (
  <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 hover:border-border-bright transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 rounded-xl bg-bg-accent flex items-center justify-center text-primary border border-border-subtle">
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full ${
        trend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
      }`}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trendValue}
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-black text-white leading-tight">{value}</h3>
      <p className="text-zinc-400 text-sm font-medium mt-1">{title}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = user?.role === 'admin' ? '/admin/dashboard' : '/expenses/summary';
        const res = await apiClient.get(endpoint);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return (
    <div className="h-full flex items-center justify-center py-40">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Welcome, {user?.name} 👋</h1>
        <p className="text-zinc-400 mt-1">Here's what's happening with your farm today.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="$12,840.00" 
          icon={<TrendingUp size={24} />} 
          trend="up" 
          trendValue="12%" 
        />
        <StatCard 
          title="Active Crops" 
          value="24" 
          icon={<Sprout size={24} />} 
          trend="up" 
          trendValue="4%" 
        />
        <StatCard 
          title="New Orders" 
          value="18" 
          icon={<ShoppingBag size={24} />} 
          trend="down" 
          trendValue="2%" 
        />
        <StatCard 
          title="Total Customers" 
          value="1,240" 
          icon={<Users size={24} />} 
          trend="up" 
          trendValue="8%" 
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-2xl p-8 glass">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white">Sales Analytics</h3>
            <button className="bg-bg-accent border border-border-subtle text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-border-subtle transition-all">
              Export Data
            </button>
          </div>
          <div className="h-72 flex items-end justify-around gap-4 px-4 pb-4">
            {[60, 80, 45, 90, 70, 85, 95].map((h, i) => (
              <motion.div 
                key={i}
                className="flex-1 max-w-[40px] bg-gradient-to-t from-primary to-primary/20 rounded-t-lg shadow-lg shadow-primary/10" 
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
              />
            ))}
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-8 glass">
          <h3 className="text-xl font-bold text-white mb-8">Recent Activities</h3>
          <div className="flex flex-col gap-6">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex gap-4 group">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(34,197,94,0.5)] mt-1.5 z-10 relative"></div>
                  {item !== 5 && <div className="absolute top-4 left-1.5 w-px h-[calc(100%+8px)] bg-border-subtle"></div>}
                </div>
                <div>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    <strong className="text-white font-semibold">New order</strong> received from Customer #{item}024
                  </p>
                  <span className="text-xs text-zinc-500 font-medium mt-1 block">2 hours ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
