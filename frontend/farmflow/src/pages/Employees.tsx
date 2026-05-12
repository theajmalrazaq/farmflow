import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Users, Plus, Trash2, Loader2, DollarSign, Phone, UserCircle, Mail, Lock, ShieldCheck, Pencil } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';


const Employees = () => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'info' | 'permissions'>('info');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState({ 
    name: '', 
    role: '', 
    salary: '', 
    contact: '',
    email: '',
    password: '',
    permissions: {
      dashboard: false,
      inventory: false,
      crops: false,
      cattle: false,
      expenses: false
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleOpenModal = (emp?: any) => {
    if (emp) {
      setEditingId(emp._id);
      setNewEmployee({
        name: emp.name,
        role: emp.role,
        salary: emp.salary.toString(),
        contact: emp.contact || '',
        email: emp.email,
        password: '••••••••', 
        permissions: emp.user?.permissions || {
          dashboard: false,
          inventory: false,
          crops: false,
          cattle: false,
          expenses: false
        }
      });
    } else {
      setEditingId(null);
      setNewEmployee({ 
        name: '', 
        role: '', 
        salary: '', 
        contact: '',
        email: '',
        password: '',
        permissions: {
          dashboard: false,
          inventory: false,
          crops: false,
          cattle: false,
          expenses: false
        }
      });
    }
    setActiveModalTab('info');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await apiClient.put(`/employees/${editingId}`, {
          name: newEmployee.name,
          role: newEmployee.role,
          salary: Number(newEmployee.salary),
          contact: newEmployee.contact,
          permissions: newEmployee.permissions
        });
        setEmployees(employees.map(emp => emp._id === editingId ? res.data : emp));
      } else {
        const res = await apiClient.post('/employees', {
          ...newEmployee,
          salary: Number(newEmployee.salary)
        });
        setEmployees([res.data, ...employees]);
      }
      setIsAddModalOpen(false);
    } catch (error: any) {
      console.error('Error saving employee:', error);
      showToast(error.response?.data?.message || 'Error saving employee', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/employees/${deletingId}`);
      setEmployees(employees.filter(emp => emp._id !== deletingId));
      showToast('Employee removed successfully', 'success');
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting employee:', error);
      showToast('Failed to delete employee', 'error');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const togglePermission = (key: keyof typeof newEmployee.permissions) => {
    setNewEmployee({
      ...newEmployee,
      permissions: {
        ...newEmployee.permissions,
        [key]: !newEmployee.permissions[key]
      }
    });
  };

  return (
    <div className="w-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-white ">Employee Management</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">Manage your farm workers, roles, and system permissions.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
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
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    onClick={() => handleOpenModal(emp)}
                    className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all"
                    title="Edit Employee"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={() => {
                      setDeletingId(emp._id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all"
                    title="Remove Employee"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 text-sm text-white/40">
                  <Mail size={16} className="text-white/40" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/40">
                  <DollarSign size={16} className="text-white/40" />
                  <span>Salary: <strong className="text-white">Rs. {emp.salary}</strong>/mo</span>
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
              <p className="text-white/40">Start building your team and generating logins here.</p>
            </div>
          )}
        </div>
      )}

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={editingId ? "Update Employee" : "Register Employee"}
        subtitle={editingId ? "Modify details and adjust permissions." : "Create an account and assign permissions."}
        maxWidth="max-w-lg"
      >
        <div className="flex bg-white/5 p-1 rounded-full border border-white/5 mb-6">
          <button 
            onClick={() => setActiveModalTab('info')}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${activeModalTab === 'info' ? 'bg-primary text-black' : 'text-white/40'}`}
          >
            Basic Details
          </button>
          <button 
            onClick={() => setActiveModalTab('permissions')}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${activeModalTab === 'permissions' ? 'bg-primary text-black' : 'text-white/40'}`}
          >
            Permissions
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {activeModalTab === 'info' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-sm font-medium text-white/40">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Jane Doe"
                  required
                  className="w-full bg-bg-primary border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                  value={newEmployee.name}
                  onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/40">Job Role</label>
                <input 
                  type="text" 
                  placeholder="Manager"
                  required
                  className="w-full bg-bg-primary border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                  value={newEmployee.role}
                  onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/40">Salary (Rs.)</label>
                <input 
                  type="number" 
                  placeholder="50000"
                  required
                  className="w-full bg-bg-primary border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                  value={newEmployee.salary}
                  onChange={e => setNewEmployee({...newEmployee, salary: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-sm font-medium text-white/40">Email Address {editingId ? "(Not Changeable)" : "(for login)"}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="email" 
                    placeholder="jane@farmflow.com"
                    required
                    disabled={!!editingId}
                    className={`w-full bg-bg-primary border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={newEmployee.email}
                    onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                  />
                </div>
              </div>

              {!editingId && (
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-sm font-medium text-white/40">Login Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      required
                      className="w-full bg-bg-primary border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                      value={newEmployee.password}
                      onChange={e => setNewEmployee({...newEmployee, password: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-sm font-medium text-white/40">Contact Number</label>
                <input 
                  type="text" 
                  placeholder="+92 300 1234567"
                  className="w-full bg-bg-primary border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                  value={newEmployee.contact}
                  onChange={e => setNewEmployee({...newEmployee, contact: e.target.value})}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-white/40 mb-2">Select which modules this employee can access:</p>
              
              {[
                { key: 'dashboard', name: 'Dashboard Access', desc: 'View global farm statistics and summaries.' },
                { key: 'inventory', name: 'Inventory Management', desc: 'Add, edit, and remove products or stock.' },
                { key: 'crops', name: 'Crops Management', desc: 'Track plantings, harvests, and field data.' },
                { key: 'cattle', name: 'Cattle/Livestock', desc: 'Manage animal health and production records.' },
                { key: 'expenses', name: 'Financial Records', desc: 'View and log farm expenses and profits.' }
              ].map((perm) => (
                <div 
                  key={perm.key}
                  onClick={() => togglePermission(perm.key as any)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    newEmployee.permissions[perm.key as keyof typeof newEmployee.permissions] 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-white/5 border-white/5 hover:bg-white/[0.08]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white">{perm.name}</div>
                    <div className="text-xs text-white/40">{perm.desc}</div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    newEmployee.permissions[perm.key as keyof typeof newEmployee.permissions]
                      ? 'bg-primary border-primary text-black'
                      : 'border-white/20'
                  }`}>
                    {newEmployee.permissions[perm.key as keyof typeof newEmployee.permissions] && <ShieldCheck size={16} />}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-6">
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
              {submitting ? <Loader2 className="animate-spin" size={20} /> : (editingId ? 'Update Changes' : 'Finalize & Save')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleDelete}
        title="Remove Employee"
        message="Are you sure you want to remove this employee? This will also delete their login account and revoke all access."
        confirmText="Remove Employee"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Employees;
