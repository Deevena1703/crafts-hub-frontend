import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { productsAPI } from "../lib/api.js";
import { motion } from "framer-motion";
import { ShoppingBag, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const CATEGORIES = [
  { id: "pottery", name: "Pottery", icon: "🏺" },
  { id: "textiles", name: "Textiles & Embroidery", icon: "🧵" },
  { id: "jewelry", name: "Jewelry", icon: "📿" },
  { id: "paintings", name: "Paintings & Art", icon: "🎨" },
  { id: "baskets", name: "Baskets & Weaving", icon: "🧺" },
  { id: "other", name: "Other", icon: "🎁" },
];

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return; }
    fetchProducts();
  }, [isLoggedIn, activeCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== "all") params.category = activeCategory;
      const data = await productsAPI.getAll(params);
      setProducts(data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="dashboard-title">Welcome, {user?.name}! 👋</h1>
          <p className="dashboard-subtitle">Explore authentic handmade products from rural artisans</p>
        </motion.div>

        <div className="filter-pills" style={{ marginTop: "2rem" }}>
          <button onClick={() => setActiveCategory("all")} className={"filter-pill " + (activeCategory === "all" ? "active" : "")}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)} className={"filter-pill " + (activeCategory === c.id ? "active" : "")}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        <h2 className="section-title mt-10">
          {activeCategory === "all" ? "All Products" : CATEGORIES.find(c => c.id === activeCategory)?.name}
        </h2>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
            <Loader style={{ height: "2rem", width: "2rem", animation: "spin 1s linear infinite", color: "hsl(var(--primary))" }} />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "hsl(var(--muted-foreground))" }}>
            <ShoppingBag style={{ height: "3rem", width: "3rem", margin: "0 auto 1rem" }} />
            <p>No products available in this category yet.</p>
          </div>
        ) : (
          <div className="products-grid mt-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
export default BuyerDashboard;
