import { Link } from "react-router-dom";

const CategoryCard = ({ id, name, icon, image }) => (
  <Link to={`/products?category=${id}`} className="category-card">
    <img src={image} alt={name} className="category-card-img" />
    <div className="category-card-overlay" />
    <div className="category-card-content">
      <span className="category-card-icon">{icon}</span>
      <h3 className="category-card-name">{name}</h3>
    </div>
  </Link>
);

export default CategoryCard;
