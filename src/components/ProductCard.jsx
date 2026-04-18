import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const imageUrl = product.photos?.[0]?.dataUri || product.image || null;
  return (
    <Link to={"/product/" + product._id} className="product-card">
      <div style={{ aspectRatio: "1/1", overflow: "hidden", background: "hsl(var(--muted))" }}>
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="product-card-img" />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>🎨</div>
        )}
      </div>
      <div className="product-card-body">
        <p className="product-card-manufacturer">{product.manufacturerName}</p>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-desc">{product.description}</p>
        <p className="product-card-price">₹{Number(product.price).toLocaleString("en-IN")}</p>
      </div>
    </Link>
  );
};
export default ProductCard;
