import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Index from "./pages/Index.jsx";
import NotFound from "./pages/NotFound.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import ManufacturerProfilePage from "./pages/ManufacturerProfilePage.jsx";
import BuyerDashboard from "./pages/BuyerDashboard.jsx";
import ManufacturerDashboard from "./pages/ManufacturerDashboard.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

// Shows a spinner while rehydrating auth from localStorage
const AppRoutes = () => {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(34 60% 96%)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🪔</div>
          <p style={{ color: "hsl(20 30% 15%)", fontFamily: "DM Sans, sans-serif" }}>Loading Crafts Hub...</p>
        </div>
      </div>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/manufacturer/:id" element={<ManufacturerProfilePage />} />
      <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
      <Route path="/manufacturer/dashboard" element={<ManufacturerDashboard />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);
export default App;
