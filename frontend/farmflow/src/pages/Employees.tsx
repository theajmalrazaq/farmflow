import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Users, Plus, Trash2, Loader2, DollarSign, Phone, UserCircle } from 'lucide-react';


const Employees = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', salary: '', contact: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await apiClient.get('/employees');
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.post('/employees', {
        ...newEmployee,
        salary: Number(newEmployee.salary)
      });
      setEmployees([res.data, ...employees]);
      setIsAddModalOpen(false);
      setNewEmployee({ name: '', role: '', salary: '', contact: '' });
    } catch (error) {
      console.error('Error adding employee:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this employee?')) return;
    try {
      await apiClient.delete(`/employees/${id}`);
      setEmployees(employees.filter(emp => emp._id !== id));
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  return (
    <div className="w-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-white ">Employee Management</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">Manage your farm workers, roles, and payroll.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-black font-bold px-5 py-2.5 rounded-full flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus size={20} /> Add Employee
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(employees || []).map((emp) => (
            <div 
              key={emp._id}
              className="bg-bg-primary/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 relative group overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <UserCircle size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{emp.name}</h3>
                    <span className="inline-block px-2.5 py-0.5 bg-white/10 text-white/80 rounded-md text-xs font-medium border border-white/10">
                      {emp.role}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(emp._id)}
                  className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 text-sm text-white/40">
                  <DollarSign size={16} className="text-white/40" />
                  <span>Salary: <strong className="text-white">${emp.salary}</strong>/mo</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/40">
                  <Phone size={16} className="text-white/40" />
                  <span>{emp.contact || 'No contact info'}</span>
                </div>
              </div>
            </div>
          ))}
          
          {employees.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-[32px]">
              <Users size={48} className="mx-auto text-white/40 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Employees Yet</h3>
              <p className="text-white/40">Start building your team by adding an employee.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Employee Modal */}

        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
            />
            <div 
              className="bg-bg-primary border border-white/10 w-full max-w-md rounded-[32px] p-6 relative z-10"
            >
              <h2 className="text-xl font-bold text-white  mb-6">Add New Employee</h2>
              <form onSubmit={handleAddEmployee} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/40">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Jane Doe"
                    required
                    className="w-full bg-bg-primary border border-white/10 rounded-full px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                    value={newEmployee.name}
                    onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/40">Job Role</label>
                  <input 
                    type="text" 
                    placeholder="Tractor Operator"
                    required
                    className="w-full bg-bg-primary border border-white/10 rounded-full px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                    value={newEmployee.role}
                    onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/40">Monthly Salary ($)</label>
                  <input 
                    type="number" 
                    placeholder="3000"
                    required
                    min="0"
                    className="w-full bg-bg-primary border border-white/10 rounded-full px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                    value={newEmployee.salary}
                    onChange={e => setNewEmployee({...newEmployee, salary: e.target.value})}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/40">Contact Number</label>
                  <input 
                    type="text" 
                    placeholder="+1 234 567 890"
                    className="w-full bg-bg-primary border border-white/10 rounded-full px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                    value={newEmployee.contact}
                    onChange={e => setNewEmployee({...newEmployee, contact: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-full font-bold text-white/80 hover:bg-bg-primary/5 transition-colors border border-white/10"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 px-4 py-3 rounded-full font-bold bg-primary text-black hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

    </div>
  );
};

export default Employees;
