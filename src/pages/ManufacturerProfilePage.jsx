import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { ArrowLeft, MapPin, Play, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { manufacturersAPI } from "../lib/api.js";
import { useState, useEffect } from "react";

const ManufacturerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manufacturer, setManufacturer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    manufacturersAPI.getById(id)
      .then(({ manufacturer, products }) => { setManufacturer(manufacturer); setProducts(products); })
      .catch(() => setManufacturer(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen"><Navbar />
      <div style={{ display: "flex", justifyContent: "center", padding: "6rem" }}>
        <Loader style={{ height: "2rem", width: "2rem", animation: "spin 1s linear infinite", color: "hsl(var(--primary))" }} />
      </div>
    </div>
  );

  if (!manufacturer) return (
    <div className="min-h-screen"><Navbar />
      <div className="container py-10 text-center">
        <h1 className="section-title">Artisan Not Found</h1>
        <button className="btn btn-outline mt-4" onClick={() => navigate("/products")}>
          <ArrowLeft style={{ height: "1rem", width: "1rem" }} /> Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">
        <button className="btn btn-ghost btn-sm mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft style={{ height: "1rem", width: "1rem" }} /> Back
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="profile-header">
          <div className="profile-info">
            <div className="profile-avatar" style={{ background: "hsl(var(--muted))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>
              {manufacturer.avatarUrl ? <img src={manufacturer.avatarUrl} alt={manufacturer.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : "🧵"}
            </div>
            <div style={{ flex: 1 }}>
              <h1 className="profile-name">{manufacturer.groupName || manufacturer.name}</h1>
              {manufacturer.location && (
                <div className="profile-location">
                  <MapPin className="profile-location-icon" /> {manufacturer.location}
                </div>
              )}
              {manufacturer.bio && <p className="profile-bio">{manufacturer.bio}</p>}
            </div>
          </div>
        </motion.div>
        <div className="profile-products">
          <h2 className="profile-products-title">Products by {manufacturer.groupName || manufacturer.name}</h2>
          {products.length === 0 ? (
            <p style={{ color: "hsl(var(--muted-foreground))", marginTop: "1rem" }}>No products listed yet.</p>
          ) : (
            <div className="products-grid">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default ManufacturerProfilePage;
