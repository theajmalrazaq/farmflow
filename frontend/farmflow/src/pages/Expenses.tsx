import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Receipt, Plus, Download, TrendingDown, Loader2 } from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await apiClient.get('/expenses');
        setExpenses(res.data);
      } catch (err) {
        console.error('Failed to fetch expenses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Expense Tracking</h1>
          <p className="text-zinc-400 mt-1">Monitor your spending and manage farm finances.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-bg-accent border border-border-subtle text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-border-subtle transition-all">
            <Download size={20} /> Export
          </button>
          <button className="bg-primary text-black font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
            <Plus size={20} /> Add Expense
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 flex items-center gap-6 glass">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
            <TrendingDown size={28} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white leading-tight">$4,250.00</h3>
            <p className="text-zinc-400 text-sm font-medium mt-1">Total Expenses (Monthly)</p>
          </div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 flex items-center gap-6 glass">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Receipt size={28} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white leading-tight">24</h3>
            <p className="text-zinc-400 text-sm font-medium mt-1">Pending Invoices</p>
          </div>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden glass">
        <div className="p-6 border-b border-border-subtle">
          <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
        </div>
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Description</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {expenses.length > 0 ? expenses.map((exp: any) => (
                  <tr key={exp.id || exp._id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4"><span className="font-bold text-white group-hover:text-primary transition-colors">{exp.description}</span></td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{exp.category}</td>
                    <td className="px-6 py-4 text-zinc-500 text-sm">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-red-500 font-bold">-${exp.amount}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">Paid</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <p className="text-zinc-500 font-medium">No expenses recorded yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
