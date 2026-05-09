import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Crops from './pages/Crops';
import Inventory from './pages/Inventory';
import Expenses from './pages/Expenses';
import Cart from './pages/Cart';
import Landing from './pages/Landing';
import FarmProfile from './pages/FarmProfile';
import Employees from './pages/Employees';
import Cattle from './pages/Cattle';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Discover from './pages/Discover';
import SuperAdmin from './pages/SuperAdmin';
import './index.css';

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { token, loading, user } = useAuth();
  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-bg-primary text-black/40">Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  if (requireAdmin && user?.role === 'customer') return <Navigate to="/" />;
  return <>{children}</>;
};

const StorefrontLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen text-white bg-transparent">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-bg-dark text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar isAdmin={true} />
        <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full pt-[96px]">
          {children}
        </main>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <StorefrontLayout>
          <Landing />
        </StorefrontLayout>
      } />
      
      <Route path="/discover" element={
        <StorefrontLayout>
          <Discover />
        </StorefrontLayout>
      } />

      <Route path="/farm/:farmSlug" element={
        <StorefrontLayout>
          <FarmProfile />
        </StorefrontLayout>
      } />

      <Route path="/shop" element={
        <StorefrontLayout>
          <Products />
        </StorefrontLayout>
      } />
      
      <Route path="/cart" element={
        <StorefrontLayout>
          <Cart />
        </StorefrontLayout>
      } />

      <Route path="/:farmSlug" element={
        <StorefrontLayout>
          <FarmProfile />
        </StorefrontLayout>
      } />

      <Route path="/superadmin" element={
        <StorefrontLayout>
          <SuperAdmin />
        </StorefrontLayout>
      } />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute requireAdmin={true}>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/products" element={
        <ProtectedRoute requireAdmin={true}>
          <Layout>
            <Products />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/crops" element={
        <ProtectedRoute requireAdmin={true}>
          <Layout>
            <Crops />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/inventory" element={
        <ProtectedRoute requireAdmin={true}>
          <Layout>
            <Inventory />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/employees" element={
        <ProtectedRoute requireAdmin={true}>
          <Layout>
            <Employees />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/cattles" element={
        <ProtectedRoute requireAdmin={true}>
          <Layout>
            <Cattle />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/expenses" element={
        <ProtectedRoute requireAdmin={true}>
          <Layout>
            <Expenses />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/orders" element={
        <ProtectedRoute requireAdmin={true}>
          <Layout>
            <Orders />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/settings" element={
        <ProtectedRoute requireAdmin={true}>
          <Layout>
            <Settings />
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
