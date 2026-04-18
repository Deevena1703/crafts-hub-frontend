import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { productsAPI } from "../lib/api.js";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const CATEGORIES = [
  { id: "pottery", name: "Pottery", icon: "🏺" },
  { id: "textiles", name: "Textiles & Embroidery", icon: "🧵" },
  { id: "jewelry", name: "Jewelry", icon: "📿" },
  { id: "paintings", name: "Paintings & Art", icon: "🎨" },
  { id: "baskets", name: "Baskets & Weaving", icon: "🧺" },
  { id: "other", name: "Other", icon: "🎁" },
];

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const categoryFilter = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState(categoryFilter || "all");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const backPath = isLoggedIn ? (user?.role === "manufacturer" ? "/manufacturer/dashboard" : "/buyer/dashboard") : "/";

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (activeCategory !== "all") params.category = activeCategory;
      if (search.trim()) params.search = search.trim();
      const data = await productsAPI.getAll(params);
      setProducts(data.products);
    } catch (err) {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [activeCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">
        <button className="btn btn-ghost btn-sm mb-6" onClick={() => navigate(backPath)}>
          <ArrowLeft style={{ height: "1rem", width: "1rem" }} /> Back
        </button>
        <h1 className="section-title">All Products</h1>
        <p className="section-subtitle">Authentic handmade crafts from rural India</p>

        <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem", maxWidth: "32rem" }}>
          <input className="form-input" placeholder="Search products or artisans..."
            value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary btn-sm">
            <Search style={{ height: "1rem", width: "1rem" }} />
          </button>
        </form>

        <div className="filter-pills" style={{ marginTop: "1.5rem" }}>
          <button onClick={() => setActiveCategory("all")} className={"filter-pill " + (activeCategory === "all" ? "active" : "")}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)} className={"filter-pill " + (activeCategory === c.id ? "active" : "")}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
            <Loader style={{ height: "2rem", width: "2rem", animation: "spin 1s linear infinite", color: "hsl(var(--primary))" }} />
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "hsl(var(--destructive))" }}>{error}</div>
        ) : (
          <>
            <div className="products-grid mt-8">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
            {products.length === 0 && <p className="no-results">No products found. Try a different filter or search.</p>}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};
export default ProductsPage;
