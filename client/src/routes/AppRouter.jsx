import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';
import CategoryBar from '../components/CategoryBar';
import Footer from '../components/Footer';
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Cart from '../pages/Cart';
import ProductDetail from '../pages/ProductDetail';
import Terms from '../pages/Terms';
import Privacy from '../pages/Privacy';
import Profile from '../pages/Profile';
import Orders from '../pages/Orders';
import Wishlist from '../pages/Wishlist';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminOverview from '../pages/admin/AdminOverview';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminPromos from '../pages/admin/AdminPromos';
import AdminCarousel from '../pages/admin/AdminCarousel';
import AdminSettings from '../pages/admin/AdminSettings';
import ScrollToTop from '../components/ScrollToTop';

const AppRouter = () => (
  <Router>
    <ScrollToTop />
    <Routes>
      {/* Admin Dashboard (Isolated) */}
      <Route path="/admin/dashboard" element={<AdminDashboard />}>
        <Route index element={<AdminOverview />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="promos" element={<AdminPromos />} />
        <Route path="carousel" element={<AdminCarousel />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Main Store Routes (includes Navbar/Footer) */}
      <Route path="*" element={
        <>
          <Navbar />
          <CategoryBar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/admin/login" element={<AdminLogin />} />
            </Routes>
          </main>
          <Footer />
        </>
      } />
    </Routes>
  </Router>
);

export default AppRouter;
