import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../lib/api.js";
import { motion } from "framer-motion";
import { User, Mail, Shield, ArrowLeft, LogOut, MapPin, Users, Edit2, Check, X } from "lucide-react";
import { useEffect, useState } from "react";

const ProfilePage = () => {
  const { user, isLoggedIn, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
  }, [isLoggedIn, navigate]);

  if (!user) return null;

  const startEdit = () => {
    setEditName(user.groupName || user.name || "");
    setEditLocation(user.location || "");
    setEditBio(user.bio || "");
    setEditing(true);
    setSaveError("");
  };

  const saveProfile = async () => {
    setSaving(true); setSaveError("");
    try {
      const payload = user.role === "manufacturer"
        ? { name: editName, groupName: editName, location: editLocation, bio: editBio }
        : { name: editName };
      const data = await authAPI.updateProfile(payload);
      updateUser(data.user);
      setEditing(false);
    } catch (err) {
      setSaveError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };
  const isBuyer = user.role === "buyer";
  const isManufacturer = user.role === "manufacturer";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">
        <button className="btn btn-ghost btn-sm mb-6" onClick={() => navigate(isBuyer ? "/buyer/dashboard" : "/manufacturer/dashboard")}>
          <ArrowLeft style={{ height: "1rem", width: "1rem" }} /> Back to Dashboard
        </button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="dashboard-title">{isManufacturer ? "Group Profile" : "My Profile"}</h1>
          <p className="dashboard-subtitle">{isManufacturer ? "Manage your SHG group details" : "Manage your account"}</p>
        </motion.div>

        <div className="profile-card-container mt-6">
          <div className="profile-info-card">
            <div className="profile-avatar-large">
              <User style={{ height: "3rem", width: "3rem", color: "hsl(var(--primary))" }} />
            </div>

            {editing ? (
              <div className="space-y-4" style={{ marginTop: "1.5rem", width: "100%" }}>
                {saveError && <div className="form-error-banner">{saveError}</div>}
                <div className="form-group">
                  <label className="form-label">{isManufacturer ? "Group / SHG Name" : "Full Name"}</label>
                  <input className="form-input" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                {isManufacturer && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input className="form-input" placeholder="Village, State" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">About Your Group</label>
                      <textarea className="form-textarea" rows={3} value={editBio} onChange={(e) => setEditBio(e.target.value)} />
                    </div>
                  </>
                )}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                    <Check style={{ height: "1rem", width: "1rem" }} /> {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="btn btn-outline" onClick={() => setEditing(false)}>
                    <X style={{ height: "1rem", width: "1rem" }} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-details" style={{ marginTop: "1.5rem" }}>
                {isManufacturer && (
                  <>
                    <div className="profile-detail-row">
                      <Users style={{ height: "1rem", width: "1rem", color: "hsl(var(--muted-foreground))" }} />
                      <div>
                        <p className="profile-detail-label">Group / SHG Name</p>
                        <p className="profile-detail-value">{user.groupName || user.name}</p>
                      </div>
                    </div>
                    {user.location && (
                      <div className="profile-detail-row">
                        <MapPin style={{ height: "1rem", width: "1rem", color: "hsl(var(--muted-foreground))" }} />
                        <div>
                          <p className="profile-detail-label">Location</p>
                          <p className="profile-detail-value">{user.location}</p>
                        </div>
                      </div>
                    )}
                    {user.bio && (
                      <div className="profile-detail-row">
                        <div>
                          <p className="profile-detail-label">About</p>
                          <p className="profile-detail-value">{user.bio}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {isBuyer && (
                  <div className="profile-detail-row">
                    <User style={{ height: "1rem", width: "1rem", color: "hsl(var(--muted-foreground))" }} />
                    <div>
                      <p className="profile-detail-label">Full Name</p>
                      <p className="profile-detail-value">{user.name}</p>
                    </div>
                  </div>
                )}
                <div className="profile-detail-row">
                  <Mail style={{ height: "1rem", width: "1rem", color: "hsl(var(--muted-foreground))" }} />
                  <div>
                    <p className="profile-detail-label">Email</p>
                    <p className="profile-detail-value">{user.email}</p>
                  </div>
                </div>
                <div className="profile-detail-row">
                  <Shield style={{ height: "1rem", width: "1rem", color: "hsl(var(--muted-foreground))" }} />
                  <div>
                    <p className="profile-detail-label">Role</p>
                    <p className="profile-detail-value" style={{ textTransform: "capitalize" }}>{user.role}</p>
                  </div>
                </div>
              </div>
            )}

            {!editing && (
              <div className="profile-action-buttons mt-6">
                <button className="btn btn-outline" onClick={startEdit}>
                  <Edit2 style={{ height: "1rem", width: "1rem" }} /> Edit Profile
                </button>
                <button className="btn btn-primary" onClick={() => navigate(isBuyer ? "/buyer/dashboard" : "/manufacturer/dashboard")}>
                  Go to Dashboard
                </button>
                <button className="btn btn-outline btn-logout" onClick={handleLogout}>
                  <LogOut style={{ height: "1rem", width: "1rem" }} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default ProfilePage;
