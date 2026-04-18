import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { ArrowLeft, Play, User, MapPin, ShoppingCart, Heart, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { productsAPI } from "../lib/api.js";
import { useState, useEffect } from "react";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  const backPath = isLoggedIn ? (user?.role === "manufacturer" ? "/manufacturer/dashboard" : "/buyer/dashboard") : "/";

  useEffect(() => {
    productsAPI.getById(id)
      .then(({ product }) => setProduct(product))
      .catch(() => setError("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    alert("Added to cart!");
  };

  if (loading) return (
    <div className="min-h-screen"><Navbar />
      <div style={{ display: "flex", justifyContent: "center", padding: "6rem" }}>
        <Loader style={{ height: "2rem", width: "2rem", animation: "spin 1s linear infinite", color: "hsl(var(--primary))" }} />
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen"><Navbar />
      <div className="container py-10 text-center">
        <h1 className="section-title">Product Not Found</h1>
        <button className="btn btn-outline mt-4" onClick={() => navigate("/products")}>
          <ArrowLeft style={{ height: "1rem", width: "1rem" }} /> Back to Products
        </button>
      </div>
    </div>
  );

  const manufacturer = product.manufacturer;
  const allPhotos = product.photos || [];
  const displayImage = allPhotos[selectedPhoto]?.dataUri || null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">
        <button className="btn btn-ghost btn-sm mb-6" onClick={() => navigate(backPath)}>
          <ArrowLeft style={{ height: "1rem", width: "1rem" }} /> Back
        </button>
        <div className="detail-grid">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {displayImage ? (
              <img src={displayImage} alt={product.name} className="detail-img" />
            ) : (
              <div className="detail-img" style={{ background: "hsl(var(--muted))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>🎨</div>
            )}
            {allPhotos.length > 1 && (
              <div className="detail-photos" style={{ marginTop: "0.75rem" }}>
                {allPhotos.map((photo, i) => (
                  <img key={i} src={photo.dataUri} alt={photo.name || "photo " + (i+1)}
                    className={"detail-photo" + (selectedPhoto === i ? " detail-photo-active" : "")}
                    onClick={() => setSelectedPhoto(i)}
                    style={{ cursor: "pointer", border: selectedPhoto === i ? "2px solid hsl(var(--primary))" : "2px solid transparent", borderRadius: "0.5rem" }} />
                ))}
              </div>
            )}
            {product.video && (
              <div className="detail-video-placeholder" style={{ marginTop: "1rem" }}>
                <video src={product.video.dataUri} controls style={{ width: "100%", borderRadius: "0.75rem", maxHeight: "280px" }} />
                <p className="detail-video-title" style={{ marginTop: "0.5rem" }}>Craft-Making Video</p>
              </div>
            )}
            {!product.video && (
              <div className="detail-video-placeholder">
                <Play className="detail-video-icon" />
                <p className="detail-video-title">No video uploaded yet</p>
                <p className="detail-video-desc">The artisan hasn't uploaded a video for this product</p>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <span className="detail-badge">{product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}</span>
            <h1 className="detail-title">{product.name}</h1>
            <p className="detail-price">₹{Number(product.price).toLocaleString("en-IN")}</p>
            <p className="detail-description">{product.description}</p>
            <div className="detail-actions">
              <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                <ShoppingCart style={{ height: "1.125rem", width: "1.125rem" }} /> Add to Cart
              </button>
              <button className={"btn btn-lg " + (wishlisted ? "btn-wishlist-active" : "btn-outline")} onClick={() => { if (!isLoggedIn) { navigate("/login"); return; } setWishlisted(!wishlisted); }}>
                <Heart style={{ height: "1.125rem", width: "1.125rem", fill: wishlisted ? "currentColor" : "none" }} />
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </button>
            </div>
            {manufacturer && (
              <Link to={"/manufacturer/" + manufacturer._id} className="manufacturer-link">
                <div className="manufacturer-link-avatar" style={{ background: "hsl(var(--muted))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                  {manufacturer.avatarUrl ? <img src={manufacturer.avatarUrl} alt={manufacturer.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : "🧵"}
                </div>
                <div>
                  <p className="manufacturer-link-name">{manufacturer.groupName || manufacturer.name}</p>
                  {manufacturer.location && (
                    <div className="manufacturer-link-location">
                      <MapPin className="manufacturer-link-location-icon" /> {manufacturer.location}
                    </div>
                  )}
                  {manufacturer.bio && <p className="manufacturer-link-bio">{manufacturer.bio}</p>}
                  <span className="manufacturer-link-cta">
                    <User style={{ height: "0.75rem", width: "0.75rem" }} /> View Artisan Profile →
                  </span>
                </div>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default ProductDetailPage;
