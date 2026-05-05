
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Crops from './pages/Crops';
import Inventory from './pages/Inventory';
import Expenses from './pages/Expenses';
import Cart from './pages/Cart';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import './index.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-bg-primary text-zinc-400">Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-8 max-w-[1400px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/products" element={
        <ProtectedRoute>
          <Layout>
            <Products />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/crops" element={
        <ProtectedRoute>
          <Layout>
            <Crops />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/inventory" element={
        <ProtectedRoute>
          <Layout>
            <Inventory />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/expenses" element={
        <ProtectedRoute>
          <Layout>
            <Expenses />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/cart" element={
        <ProtectedRoute>
          <Layout>
            <Cart />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
