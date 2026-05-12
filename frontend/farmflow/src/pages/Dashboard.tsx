import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SuperAdmin from './SuperAdmin';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Sprout,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Beef,
  Receipt
} from 'lucide-react';
import Button from '../components/Button';


const StatCard = ({ title, value, icon, trend, trendValue }: any) => (
  <div className="bg-bg-primary/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 hover:border-primary/50 transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-primary border border-white/10">
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
      <h3 className="text-xl font-black text-white leading-tight ">{value}</h3>
      <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider mt-1">{title}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const isFarmer = user?.role === 'farmer';
        const endpoint = user?.role === 'admin' ? '/admin/dashboard' : (isFarmer ? '/admin/farmer/dashboard' : '/expenses/summary');
        const res = await apiClient.get(endpoint);
        setData(isFarmer ? res.data.stats : res.data);
        
        
        const notifRes = await apiClient.get('/notifications');
        setNotifications(notifRes.data.notifications || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center py-40">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  if (user?.role === 'admin') {
    return <SuperAdmin />;
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-xl font-bold text-white ">Welcome, {user?.name} 👋</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">
            Here's what's happening with your farm today.
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/admin/products">
            <Button size="md" leftIcon={<ShoppingBag size={18} />}>Add Product</Button>
          </Link>
          <Link to="/crops">
            <Button variant="secondary" size="md" leftIcon={<Sprout size={18} />}>Manage Crops</Button>
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard 
          title="Revenue" 
          value={`Rs. ${data?.totalRevenue?.toLocaleString() || '0'}`} 
          icon={<TrendingUp size={20} />} 
          trend="up" 
          trendValue="Live" 
        />
        <StatCard 
          title="Crops" 
          value={data?.totalCrops || '0'} 
          icon={<Sprout size={20} />} 
          trend="up" 
          trendValue="Live" 
        />
        <StatCard 
          title="Livestock" 
          value={data?.totalCattle || '0'} 
          icon={<Beef size={20} />} 
          trend="up" 
          trendValue="Live" 
        />
        <StatCard 
          title="Products" 
          value={data?.totalProducts || '0'} 
          icon={<ShoppingBag size={20} />} 
          trend="up" 
          trendValue="Live" 
        />
        <StatCard 
          title="Staff" 
          value={data?.totalEmployees || '0'} 
          icon={<Users size={20} />} 
          trend="up" 
          trendValue="Live" 
        />
        <StatCard 
          title="Expenses" 
          value={`Rs. ${data?.totalExpenses?.toLocaleString() || '0'}`} 
          icon={<Receipt size={20} />} 
          trend="down" 
          trendValue="Live" 
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-white ">Sales Analytics</h3>
            <Button variant="secondary" size="sm">Export Data</Button>
          </div>
          <div className="h-72 flex items-end justify-around gap-4 px-4 pb-4">
            {data?.salesHistory?.length > 0 ? (
              data.salesHistory.map((day: any, i: number) => {
                const maxRevenue = Math.max(...data.salesHistory.map((d: any) => d.revenue), 1);
                const height = (day.revenue / maxRevenue) * 90 + 10; 
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1 max-w-[40px]">
                    <div 
                      className="w-full bg-primary rounded-t-lg transition-all duration-1000" 
                      style={{ height: `${height}%`, opacity: 0.2 + (day.revenue > 0 ? 0.8 : 0) }}
                    />
                    <span className="text-[10px] text-white/40 font-bold whitespace-nowrap">
                      {new Date(day._id).toLocaleDateString([], { weekday: 'short' })}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30 font-medium">
                No sales data yet
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-white ">Alerts</h3>
            {notifications.some(n => !n.read) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-primary hover:bg-primary/10"
              >
                Mark all as read
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notif: any) => (
                <div 
                  key={notif._id} 
                  className={`flex gap-4 p-3 rounded-xl transition-all ${notif.read ? 'opacity-60' : 'bg-primary/5 border border-primary/10'}`}
                  onClick={() => !notif.read && markAsRead(notif._id)}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${notif.read ? 'bg-zinc-300' : 'bg-primary shadow-[0_0_10px_rgba(40,120,27,0.5)]'}`}></div>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm leading-relaxed ${notif.read ? 'text-white/40' : 'text-white font-bold'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-white/40 mt-1 line-clamp-2">{notif.message}</p>
                    <span className="text-[10px] text-white/30 mt-2 block italic">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-white/30">
                No new alerts
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
