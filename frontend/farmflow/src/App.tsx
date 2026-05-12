import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Products from './pages/store/Products';
import ProductDetail from './pages/store/ProductDetail';
import Crops from './pages/dashboard/Crops';
import Inventory from './pages/dashboard/Inventory';
import Expenses from './pages/dashboard/Expenses';
import Cart from './pages/store/Cart';
import Landing from './pages/store/Landing';
import FarmProfile from './pages/store/FarmProfile';
import Employees from './pages/dashboard/Employees';
import Cattle from './pages/dashboard/Cattle';
import Orders from './pages/dashboard/Orders';
import Settings from './pages/dashboard/Settings';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Discover from './pages/store/Discover';
import { ToastProvider } from './context/ToastContext';
import './index.css';

const ProtectedRoute = ({ children, allowedRoles = [] }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { token, loading, user } = useAuth();
  
  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-bg-primary text-black/40">Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
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

      <Route path="/product/:id" element={
        <StorefrontLayout>
          <ProductDetail />
        </StorefrontLayout>
      } />
      
      <Route path="/cart" element={
        <StorefrontLayout>
          <Cart />
        </StorefrontLayout>
      } />


      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['admin', 'farmer', 'employee']}>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/products" element={
        <ProtectedRoute allowedRoles={['farmer', 'employee']}>
          <Layout>
            <Products />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/crops" element={
        <ProtectedRoute allowedRoles={['farmer', 'employee']}>
          <Layout>
            <Crops />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/inventory" element={
        <ProtectedRoute allowedRoles={['farmer', 'employee']}>
          <Layout>
            <Inventory />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/employees" element={
        <ProtectedRoute allowedRoles={['farmer']}>
          <Layout>
            <Employees />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/cattles" element={
        <ProtectedRoute allowedRoles={['farmer', 'employee']}>
          <Layout>
            <Cattle />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/expenses" element={
        <ProtectedRoute allowedRoles={['farmer', 'employee']}>
          <Layout>
            <Expenses />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/orders" element={
        <ProtectedRoute allowedRoles={['farmer', 'employee']}>
          <Layout>
            <Orders />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/settings" element={
        <ProtectedRoute allowedRoles={['farmer', 'admin', 'customer']}>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/:farmSlug" element={
        <StorefrontLayout>
          <FarmProfile />
        </StorefrontLayout>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
