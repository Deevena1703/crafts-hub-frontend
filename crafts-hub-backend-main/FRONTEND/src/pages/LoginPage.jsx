import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, User, Factory, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password, role);
      navigate(user.role === "buyer" ? "/buyer/dashboard" : "/manufacturer/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page bg-gradient-hero">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: "28rem" }}>
        <div className="auth-card">
          <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate("/")}>
            <ArrowLeft style={{ height: "1rem", width: "1rem" }} /> Back to Home
          </button>
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <ShoppingBag className="auth-logo-icon" />
              <span className="auth-logo-text">Crafts Hub</span>
            </Link>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Login to your account</p>
          </div>
          <div className="role-toggle">
            <button className={"role-toggle-btn " + (role === "buyer" ? "active" : "")} onClick={() => { setRole("buyer"); setError(""); }}>
              <User className="role-toggle-icon" /> Buyer
            </button>
            <button className={"role-toggle-btn " + (role === "manufacturer" ? "active" : "")} onClick={() => { setRole("manufacturer"); setError(""); }}>
              <Factory className="role-toggle-icon" /> Manufacturer
            </button>
          </div>
          {error && <div className="form-error-banner">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input className="form-input" id="email" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input className="form-input" id="password" type={showPassword ? "text" : "password"}
                  placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                  required disabled={loading} style={{ paddingRight: "2.5rem" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "hsl(var(--muted-foreground))", cursor: "pointer" }}>
                  {showPassword ? <EyeOff style={{ height: "1rem", width: "1rem" }} /> : <Eye style={{ height: "1rem", width: "1rem" }} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
              {loading ? "Logging in..." : "Login as " + (role === "buyer" ? "Buyer" : "Manufacturer")}
            </button>
          </form>
          <p className="form-footer">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default LoginPage;
