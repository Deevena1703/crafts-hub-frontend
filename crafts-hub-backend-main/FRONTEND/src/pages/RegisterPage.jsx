import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, User, Factory, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState("buyer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const payload = { name, email, password, role };
      if (role === "manufacturer") {
        payload.groupName = name;
        payload.location = location;
        payload.bio = bio;
      }
      const user = await register(payload);
      navigate(user.role === "buyer" ? "/buyer/dashboard" : "/manufacturer/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page bg-gradient-hero" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join the artisan marketplace</p>
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
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="name">{role === "manufacturer" ? "Group / SHG Name" : "Full Name"}</label>
              <input className="form-input" id="name" placeholder={role === "manufacturer" ? "e.g. Lakshmi Self Help Group" : "Your name"}
                value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input className="form-input" id="email" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>
            {role === "manufacturer" && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="location">Location</label>
                  <input className="form-input" id="location" placeholder="Village, State"
                    value={location} onChange={(e) => setLocation(e.target.value)} required disabled={loading} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="bio">About Your Group</label>
                  <textarea className="form-textarea" id="bio" placeholder="Tell us about your craft and group..." rows={3}
                    value={bio} onChange={(e) => setBio(e.target.value)} disabled={loading} />
                </div>
              </>
            )}
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input className="form-input" id="password" type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)}
                  required disabled={loading} style={{ paddingRight: "2.5rem" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "hsl(var(--muted-foreground))", cursor: "pointer" }}>
                  {showPassword ? <EyeOff style={{ height: "1rem", width: "1rem" }} /> : <Eye style={{ height: "1rem", width: "1rem" }} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
              {loading ? "Creating account..." : "Register as " + (role === "buyer" ? "Buyer" : "Manufacturer")}
            </button>
          </form>
          <p className="form-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default RegisterPage;
