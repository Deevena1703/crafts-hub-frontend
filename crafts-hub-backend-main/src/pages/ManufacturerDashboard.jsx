import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { productsAPI } from "../lib/api.js";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Package, Video, Edit, Upload, X, Image, Check, Trash2, Loader, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const CATEGORIES = [
  { id: "pottery", name: "Pottery" },
  { id: "textiles", name: "Textiles & Embroidery" },
  { id: "jewelry", name: "Jewelry" },
  { id: "paintings", name: "Paintings & Art" },
  { id: "baskets", name: "Baskets & Weaving" },
  { id: "other", name: "Other" },
];

const EMPTY_FORM = { name: "", price: "", description: "", category: "textiles" };

const ManufacturerDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [myProducts, setMyProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Edit state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editPhotoFiles, setEditPhotoFiles] = useState([]);
  const [editVideoFile, setEditVideoFile] = useState(null);
  const [removePhotoIds, setRemovePhotoIds] = useState([]);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return; }
    fetchMyProducts();
  }, [isLoggedIn]);

  const fetchMyProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await productsAPI.getMyProducts();
      setMyProducts(data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // ─── ADD PRODUCT ───────────────────────────────────────────────────────────
  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files);
    setPhotoFiles((prev) => [...prev, ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))]);
  };
  const removePhoto = (i) => setPhotoFiles((prev) => { URL.revokeObjectURL(prev[i].preview); return prev.filter((_, idx) => idx !== i); });
  const handleVideoAdd = (e) => { const f = e.target.files[0]; if (f) setVideoFile({ file: f, preview: URL.createObjectURL(f) }); };
  const clearVideo = () => { if (videoFile) URL.revokeObjectURL(videoFile.preview); setVideoFile(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name || !formData.price || !formData.category) {
      setFormError("Name, price and category are required."); return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("price", formData.price);
      fd.append("description", formData.description);
      fd.append("category", formData.category);
      photoFiles.forEach((p) => fd.append("photos", p.file));
      if (videoFile) fd.append("video", videoFile.file);
      const data = await productsAPI.create(fd);
      setMyProducts((prev) => [data.product, ...prev]);
      resetAddForm();
    } catch (err) {
      setFormError(err.message || "Failed to create product.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAddForm = () => {
    setFormData(EMPTY_FORM); setPhotoFiles([]); clearVideo(); setShowAddForm(false); setFormError("");
  };

  // ─── EDIT PRODUCT ──────────────────────────────────────────────────────────
  const startEdit = (p) => {
    setEditingProduct(p);
    setEditForm({ name: p.name, price: String(p.price), description: p.description || "", category: p.category });
    setEditPhotoFiles([]); setEditVideoFile(null); setRemovePhotoIds([]); setRemoveVideo(false); setEditError("");
  };

  const handleEditPhotoAdd = (e) => {
    const files = Array.from(e.target.files);
    setEditPhotoFiles((prev) => [...prev, ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))]);
  };
  const toggleRemovePhoto = (id) => setRemovePhotoIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const handleEditVideoAdd = (e) => { const f = e.target.files[0]; if (f) setEditVideoFile({ file: f, preview: URL.createObjectURL(f) }); };

  const saveEdit = async () => {
    setEditError("");
    if (!editForm.name || !editForm.price) { setEditError("Name and price are required."); return; }
    setEditSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", editForm.name);
      fd.append("price", editForm.price);
      fd.append("description", editForm.description);
      fd.append("category", editForm.category);
      removePhotoIds.forEach((id) => fd.append("removePhotoIds", id));
      if (removeVideo) fd.append("removeVideo", "true");
      editPhotoFiles.forEach((p) => fd.append("photos", p.file));
      if (editVideoFile) fd.append("video", editVideoFile.file);
      const data = await productsAPI.update(editingProduct._id, fd);
      setMyProducts((prev) => prev.map((p) => p._id === editingProduct._id ? data.product : p));
      setEditingProduct(null);
    } catch (err) {
      setEditError(err.message || "Failed to update product.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await productsAPI.delete(id);
      setMyProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const videoCount = myProducts.filter((p) => p.video).length;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="dashboard-header-row">
            <div>
              <h1 className="dashboard-title">Manufacturer Dashboard 🏭</h1>
              <p className="dashboard-subtitle">Welcome, {user?.groupName || user?.name} — manage your products</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus style={{ height: "1rem", width: "1rem" }} /> Add Product
            </button>
          </div>
        </motion.div>

        <div className="stats-grid">
          {[
            { icon: Package, label: "Products", value: String(myProducts.length) },
            { icon: Video, label: "With Videos", value: String(videoCount) },
            { icon: Edit, label: "In Stock", value: String(myProducts.filter(p => p.inStock !== false).length) },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <stat.icon className="stat-icon" />
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── ADD FORM ── */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="add-form">
              <h2 className="add-form-title">Add New Product</h2>
              {formError && <div className="form-error-banner"><AlertCircle style={{ height: "1rem", width: "1rem" }} /> {formError}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="add-form-grid">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input className="form-input" placeholder="e.g. Hand-woven Silk Scarf"
                      value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input className="form-input" type="number" min="1" placeholder="500"
                      value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Describe your product..." rows={3}
                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="add-form-grid">
                  <div className="form-group">
                    <label className="form-label">Product Photos (up to 5)</label>
                    <label className="upload-area" style={{ cursor: "pointer" }}>
                      <Image style={{ height: "1.5rem", width: "1.5rem", color: "hsl(var(--muted-foreground))" }} />
                      <p className="upload-text">Click to upload photos</p>
                      <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handlePhotoAdd} />
                    </label>
                    {photoFiles.length > 0 && (
                      <div className="uploaded-files">
                        {photoFiles.map((p, i) => (
                          <div key={i} className="uploaded-file">
                            <img src={p.preview} alt="" className="uploaded-file-preview" />
                            <span className="uploaded-file-name">{p.file.name}</span>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => removePhoto(i)}>
                              <X style={{ height: "0.75rem", width: "0.75rem" }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Craft-Making Video (optional)</label>
                    <label className="upload-area" style={{ cursor: "pointer" }}>
                      <Video style={{ height: "1.5rem", width: "1.5rem", color: "hsl(var(--muted-foreground))" }} />
                      <p className="upload-text">Click to upload video</p>
                      <input type="file" accept="video/*" style={{ display: "none" }} onChange={handleVideoAdd} />
                    </label>
                    {videoFile && (
                      <div className="uploaded-files">
                        <div className="uploaded-file">
                          <Video style={{ height: "1rem", width: "1rem", color: "hsl(var(--primary))" }} />
                          <span className="uploaded-file-name">{videoFile.file.name}</span>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={clearVideo}>
                            <X style={{ height: "0.75rem", width: "0.75rem" }} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-buttons">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? <><Loader style={{ height: "1rem", width: "1rem", animation: "spin 1s linear infinite" }} /> Uploading...</> : "Save Product"}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={resetAddForm}>Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── EDIT MODAL ── */}
        <AnimatePresence>
          {editingProduct && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
              onClick={(e) => { if (e.target === e.currentTarget) setEditingProduct(null); }}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                style={{ background: "hsl(var(--card))", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "42rem", maxHeight: "90vh", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h2 className="add-form-title" style={{ margin: 0 }}>Edit Product</h2>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingProduct(null)}>
                    <X style={{ height: "1.25rem", width: "1.25rem" }} />
                  </button>
                </div>
                {editError && <div className="form-error-banner"><AlertCircle style={{ height: "1rem", width: "1rem" }} /> {editError}</div>}
                <div className="space-y-4">
                  <div className="add-form-grid">
                    <div className="form-group">
                      <label className="form-label">Product Name *</label>
                      <input className="form-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Price (₹) *</label>
                      <input className="form-input" type="number" min="1" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                      {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                  </div>

                  {/* Existing photos */}
                  {editingProduct.photos?.length > 0 && (
                    <div className="form-group">
                      <label className="form-label">Current Photos (click to remove)</label>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                        {editingProduct.photos.map((photo) => (
                          <div key={photo._id} onClick={() => toggleRemovePhoto(photo._id)}
                            style={{ position: "relative", cursor: "pointer", opacity: removePhotoIds.includes(photo._id) ? 0.4 : 1, borderRadius: "0.5rem", overflow: "hidden" }}>
                            <img src={photo.dataUri} alt="" style={{ width: "5rem", height: "5rem", objectFit: "cover" }} />
                            {removePhotoIds.includes(photo._id) && (
                              <div style={{ position: "absolute", inset: 0, background: "rgba(239,68,68,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <X style={{ height: "1.5rem", width: "1.5rem", color: "white" }} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {removePhotoIds.length > 0 && <p style={{ fontSize: "0.75rem", color: "hsl(var(--destructive))", marginTop: "0.25rem" }}>{removePhotoIds.length} photo(s) will be removed on save</p>}
                    </div>
                  )}

                  {/* Add more photos */}
                  <div className="add-form-grid">
                    <div className="form-group">
                      <label className="form-label">Add More Photos</label>
                      <label className="upload-area" style={{ cursor: "pointer" }}>
                        <Image style={{ height: "1.5rem", width: "1.5rem", color: "hsl(var(--muted-foreground))" }} />
                        <p className="upload-text">Upload new photos</p>
                        <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleEditPhotoAdd} />
                      </label>
                      {editPhotoFiles.map((p, i) => (
                        <div key={i} className="uploaded-file" style={{ marginTop: "0.25rem" }}>
                          <img src={p.preview} alt="" className="uploaded-file-preview" />
                          <span className="uploaded-file-name">{p.file.name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Video</label>
                      {editingProduct.video && !removeVideo ? (
                        <div>
                          <video src={editingProduct.video.dataUri} style={{ width: "100%", maxHeight: "140px", borderRadius: "0.5rem" }} controls />
                          <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: "0.5rem", color: "hsl(var(--destructive))" }}
                            onClick={() => setRemoveVideo(true)}>
                            <Trash2 style={{ height: "0.875rem", width: "0.875rem" }} /> Remove Video
                          </button>
                        </div>
                      ) : (
                        <label className="upload-area" style={{ cursor: "pointer" }}>
                          <Video style={{ height: "1.5rem", width: "1.5rem", color: "hsl(var(--muted-foreground))" }} />
                          <p className="upload-text">{removeVideo ? "Upload replacement video" : "Upload video"}</p>
                          <input type="file" accept="video/*" style={{ display: "none" }} onChange={handleEditVideoAdd} />
                        </label>
                      )}
                      {editVideoFile && <p style={{ fontSize: "0.75rem", color: "hsl(var(--primary))", marginTop: "0.25rem" }}>New: {editVideoFile.file.name}</p>}
                    </div>
                  </div>

                  <div className="form-buttons">
                    <button className="btn btn-primary" onClick={saveEdit} disabled={editSubmitting}>
                      {editSubmitting ? <><Loader style={{ height: "1rem", width: "1rem", animation: "spin 1s linear infinite" }} /> Saving...</> : <><Check style={{ height: "1rem", width: "1rem" }} /> Save Changes</>}
                    </button>
                    <button className="btn btn-outline" onClick={() => setEditingProduct(null)}>Cancel</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PRODUCT LIST ── */}
        <h2 className="section-title mt-10">Your Products</h2>
        {loadingProducts ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <Loader style={{ height: "2rem", width: "2rem", animation: "spin 1s linear infinite", color: "hsl(var(--primary))" }} />
          </div>
        ) : myProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "hsl(var(--muted-foreground))" }}>
            <Package style={{ height: "3rem", width: "3rem", margin: "0 auto 1rem" }} />
            <p>No products yet. Click "Add Product" to get started!</p>
          </div>
        ) : (
          <div className="mt-4">
            {myProducts.map((p) => (
              <div key={p._id} className="product-list-item">
                {p.photos?.[0]?.dataUri ? (
                  <img src={p.photos[0].dataUri} alt={p.name} className="product-list-img" />
                ) : (
                  <div className="product-list-img" style={{ background: "hsl(var(--muted))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>🎨</div>
                )}
                <div className="product-list-info">
                  <h3 className="product-list-name">{p.name}</h3>
                  <p className="product-list-meta">{p.category} · ₹{Number(p.price).toLocaleString("en-IN")} {p.video ? "· 🎬 Video" : ""}</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-outline btn-sm" onClick={() => startEdit(p)}>
                    <Edit style={{ height: "0.75rem", width: "0.75rem" }} /> Edit
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteProduct(p._id)}>
                    <Trash2 style={{ height: "0.75rem", width: "0.75rem", color: "hsl(var(--destructive))" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
export default ManufacturerDashboard;
