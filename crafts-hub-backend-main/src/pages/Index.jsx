import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import CategoryCard from "../components/CategoryCard.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { productsAPI } from "../lib/api.js";
import { motion } from "framer-motion";
import { ArrowRight, Heart, ShieldCheck, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import heroCrafts from "../assets/hero-crafts.jpg";
import artisanImg from "../assets/artisan-weaving.jpg";

const STATIC_CATEGORIES = [
  { id: "pottery", name: "Pottery", icon: "🏺", image: null },
  { id: "textiles", name: "Textiles & Embroidery", icon: "🧵", image: null },
  { id: "jewelry", name: "Jewelry", icon: "📿", image: null },
  { id: "paintings", name: "Paintings & Art", icon: "🎨", image: null },
  { id: "baskets", name: "Baskets & Weaving", icon: "🧺", image: null },
];

import potteryImg from "../assets/pottery.jpg";
import embroideryImg from "../assets/embroidery.jpg";
import jewelryImg from "../assets/jewelry.jpg";
import paintingsImg from "../assets/paintings.jpg";
import basketsImg from "../assets/baskets.jpg";

const CATEGORY_IMAGES = { pottery: potteryImg, textiles: embroideryImg, jewelry: jewelryImg, paintings: paintingsImg, baskets: basketsImg };
const categories = STATIC_CATEGORIES.map(c => ({ ...c, image: CATEGORY_IMAGES[c.id] || heroCrafts }));

const features = [
  { icon: Heart, title: "Empower Artisans", desc: "Buy directly from SHG women artisans, ensuring fair prices and sustainable livelihoods." },
  { icon: Video, title: "Watch the Craft", desc: "See how each product is made through authentic craft-making videos and photo stories." },
  { icon: ShieldCheck, title: "Authentic & Handmade", desc: "Every product is verified handmade, preserving traditional techniques and cultural heritage." },
];

const Index = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    productsAPI.getAll({ limit: 4 })
      .then(({ products }) => setFeaturedProducts(products))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="hero bg-gradient-hero">
        <div className="container hero-inner">
          <div className="hero-grid">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="hero-badge">🪔 Empowering Rural Women Artisans</span>
              <h1 className="hero-title">Handcrafted with <span className="text-gradient-primary">Love & Tradition</span></h1>
              <p className="hero-subtitle">Discover authentic handmade products from Self-Help Group women across India. Every purchase empowers a rural artisan.</p>
              <div className="hero-buttons">
                <button className="btn btn-primary btn-lg" onClick={() => navigate("/products")}>
                  Browse Products <ArrowRight style={{ height: "1rem", width: "1rem" }} />
                </button>
                <button className="btn btn-outline btn-lg" onClick={() => navigate("/register")}>Join as Artisan</button>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} style={{ position: "relative" }}>
              <div className="hero-img-wrapper">
                <img src={heroCrafts} alt="Handcrafted products" className="hero-img" />
              </div>
              <div className="hero-artisan-badge">
                <img src={artisanImg} alt="Artisan" className="hero-artisan-img" />
                <div>
                  <p className="hero-artisan-name">500+ Artisans</p>
                  <p className="hero-artisan-loc">Across 10 states</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="features-title">Why Crafts Hub?</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="feature-card">
                <div className="feature-icon-wrapper"><f.icon className="feature-icon" /></div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bg">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Explore traditional crafts organized by type</p>
          <div className="categories-grid mt-8">
            {categories.map((c) => <CategoryCard key={c.id} {...c} />)}
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Featured Crafts</h2>
                <p className="section-subtitle">Handpicked products from our artisans</p>
              </div>
              <button className="btn btn-outline" onClick={() => navigate("/products")}>
                View All <ArrowRight style={{ height: "1rem", width: "1rem" }} />
              </button>
            </div>
            <div className="products-grid">
              {featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="bg-gradient-warm cta-section">
        <div className="container">
          <h2 className="cta-title">Are You an Artisan?</h2>
          <p className="cta-desc">Join Crafts Hub to showcase your handmade products, share your craft stories through videos, and reach customers across India.</p>
          <button className="btn btn-outline cta-btn" onClick={() => navigate("/register")}>Register as Manufacturer</button>
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default Index;
