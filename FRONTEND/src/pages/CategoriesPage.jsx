import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import CategoryCard from "../components/CategoryCard.jsx";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import potteryImg from "../assets/pottery.jpg";
import embroideryImg from "../assets/embroidery.jpg";
import jewelryImg from "../assets/jewelry.jpg";
import paintingsImg from "../assets/paintings.jpg";
import basketsImg from "../assets/baskets.jpg";

const categories = [
  { id: "pottery", name: "Pottery", icon: "🏺", image: potteryImg },
  { id: "textiles", name: "Textiles & Embroidery", icon: "🧵", image: embroideryImg },
  { id: "jewelry", name: "Jewelry", icon: "📿", image: jewelryImg },
  { id: "paintings", name: "Paintings & Art", icon: "🎨", image: paintingsImg },
  { id: "baskets", name: "Baskets & Weaving", icon: "🧺", image: basketsImg },
];

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const backPath = isLoggedIn ? (user?.role === "manufacturer" ? "/manufacturer/dashboard" : "/buyer/dashboard") : "/";
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">
        <button className="btn btn-ghost btn-sm mb-6" onClick={() => navigate(backPath)}>
          <ArrowLeft style={{ height: "1rem", width: "1rem" }} /> Back
        </button>
        <h1 className="section-title">Categories</h1>
        <p className="section-subtitle">Explore crafts by type</p>
        <div className="categories-grid mt-8">
          {categories.map((c) => <CategoryCard key={c.id} {...c} />)}
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default CategoriesPage;
