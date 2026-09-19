import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminOwners from './pages/admin/Owners';
import AdminCustomers from './pages/admin/Customers';
import AdminOrders from './pages/admin/Orders';

// Owner pages
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerStore from './pages/owner/Store';
import OwnerItems from './pages/owner/Items';
import OwnerOrders from './pages/owner/Orders';
import OwnerOrderDetail from './pages/owner/OrderDetail';

// Customer pages
import CustomerHome from './pages/customer/Home';
import CustomerStores from './pages/customer/Stores';
import StoreItems from './pages/customer/StoreItems';
import CustomerOrders from './pages/customer/Orders';
import CustomerOrderDetail from './pages/customer/OrderDetail';
import CustomerProfile from './pages/customer/Profile';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: { fontSize: '0.875rem', borderRadius: '0.5rem' },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin */}
            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/owners" element={<AdminOwners />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
            </Route>

            {/* Owner */}
            <Route element={<ProtectedRoute role="owner" />}>
              <Route path="/owner" element={<OwnerDashboard />} />
              <Route path="/owner/store" element={<OwnerStore />} />
              <Route path="/owner/items" element={<OwnerItems />} />
              <Route path="/owner/orders" element={<OwnerOrders />} />
              <Route path="/owner/orders/:id" element={<OwnerOrderDetail />} />
            </Route>

            {/* Customer */}
            <Route element={<ProtectedRoute role="customer" />}>
              <Route path="/customer" element={<CustomerHome />} />
              <Route path="/customer/stores" element={<CustomerStores />} />
              <Route path="/customer/stores/:id/items" element={<StoreItems />} />
              <Route path="/customer/orders" element={<CustomerOrders />} />
              <Route path="/customer/orders/:id" element={<CustomerOrderDetail />} />
              <Route path="/customer/profile" element={<CustomerProfile />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
