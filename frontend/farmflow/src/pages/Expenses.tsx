import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Receipt, Plus, Download, TrendingDown, Loader2, DollarSign, Calendar, Tag, FileText, Search } from 'lucide-react';
import Dropdown from '../components/Dropdown';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
  
const Expenses = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [expenseData, setExpenseData] = useState<any>({
    expenses: [],
    totalExpenses: 0
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Seeds',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchExpenses = async () => {
    try {
      const res = await apiClient.get('/expenses');
      setExpenseData({
        expenses: res.data.expenses,
        totalExpenses: res.data.totalExpenses
      });
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/expenses', formData);
      setIsModalOpen(false);
      setFormData({
        category: 'seeds',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchExpenses();
      showToast('Expense recorded successfully!', 'success');
    } catch (err: any) {
      console.error('Failed to add expense', err);
      showToast(err.response?.data?.message || 'Failed to record expense', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white ">Expense Tracking</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">Monitor your spending and manage farm finances.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Download size={20} />}>
            Export
          </Button>
          {(user?.role === 'farmer' || (user?.role === 'employee' && user?.permissions?.expenses)) && (
            <Button 
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus size={20} />}
            >
              Add Expense
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 bg-white/5 p-4 rounded-[32px] border border-white/10">
        <div className="flex-1 relative flex items-center group">
          <Search size={18} className="absolute left-4 text-white/30 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search expenses by description or category..." 
            className="w-full h-12 bg-bg-primary border border-white/10 rounded-full pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-white transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-primary/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex items-center gap-6 glass">
          <div className="w-14 h-14 rounded-[32px] bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
            <TrendingDown size={28} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white leading-tight">
              Rs. {expenseData.totalExpenses?.toLocaleString() || '0'}
            </h3>
            <p className="text-white/40 text-sm font-medium mt-1">Total Lifetime Expenses</p>
          </div>
        </div>
        <div className="bg-bg-primary/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex items-center gap-6 glass">
          <div className="w-14 h-14 rounded-[32px] bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Receipt size={28} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white leading-tight">
              {expenseData.expenses?.length || '0'}
            </h3>
            <p className="text-white/40 text-sm font-medium mt-1">Recorded Transactions</p>
          </div>
        </div>
      </div>

      <div className="bg-bg-primary border border-white/10 rounded-3xl overflow-hidden glass">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
        </div>
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-primary/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Description</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {expenseData.expenses.length > 0 ? expenseData.expenses.map((exp: any) => (
                  <tr key={exp._id} className="hover:bg-bg-primary/[0.01] transition-colors group">
                    <td className="px-6 py-4"><span className="font-bold text-white group-hover:text-primary transition-colors">{exp.description || 'General Expense'}</span></td>
                    <td className="px-6 py-4 text-white/40 text-sm">{exp.category}</td>
                    <td className="px-6 py-4 text-white/40 text-sm">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-red-500 font-bold">-Rs. {exp.amount?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">Verified</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <p className="text-white/40 font-medium">No expenses recorded yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Add New Expense"
        subtitle="Log your spending to keep your farm records up to date."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-white/80 mb-2">Description</label>
            <div className="relative">
              <FileText size={18} className="absolute left-5 top-4 text-white/30" />
              <input 
                type="text" 
                className="w-full pl-12 pr-5 py-3.5 rounded-[24px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium text-white"
                placeholder="e.g. Purchase of organic fertilizers"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">Category</label>
              <Dropdown 
                value={formData.category}
                onChange={(val) => setFormData({...formData, category: val})}
                icon={<Tag size={18} />}
                options={[
                  { value: 'seeds', label: 'Seeds' },
                  { value: 'fertilizer', label: 'Fertilizer' },
                  { value: 'labor', label: 'Labor' },
                  { value: 'equipment', label: 'Equipment' },
                  { value: 'fuel', label: 'Fuel' },
                  { value: 'water', label: 'Water' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">Amount (Rs.)</label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-5 top-4 text-white/30" />
                <input 
                  type="number" 
                  className="w-full pl-12 pr-5 py-3.5 rounded-[24px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium text-white"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80 mb-2">Transaction Date</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-5 top-4 text-white/30" />
              <input 
                type="date" 
                className="w-full pl-12 pr-5 py-3.5 rounded-[24px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium text-white"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 rounded-full font-bold text-white/40 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-primary text-black py-4 rounded-full font-bold hover:brightness-110 transition-all"
            >
              Record Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
