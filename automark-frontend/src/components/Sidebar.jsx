import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Image as ImageIcon, FileText, Upload, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import axios from "axios";

const API = "http://localhost:8000";

export default function Sidebar({ isOpen, onClose }) {
  const { user, updateUser, deleteGeneratedAd } = useUser();
  const [activeTab, setActiveTab] = useState("profile"); // "profile" or "ads"
  const [instagramConnected, setInstagramConnected] = useState(false);

  useEffect(() => {
    checkInstagramStatus();
  }, []);

  const checkInstagramStatus = async () => {
    try {
      const res = await axios.get(`${API}/api/instagram/status`, {
        params: { user_id: "default_user" },
      });
      setInstagramConnected(res.data.connected);
    } catch (error) {
      setInstagramConnected(false);
    }
  };

  const handleInputChange = (field, value) => {
    updateUser({ [field]: value });
  };

  const stats = [
    { label: "Ads Generated", value: user.adsGenerated || 0, icon: "📊" },
    { label: "Plan", value: user.plan, icon: "💎" },
    { label: "Member Since", value: user.joinDate, icon: "📅" },
  ];

  const generatedAds = user.generatedAds || [];

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "text":
        return <FileText size={16} />;
      case "image":
        return <ImageIcon size={16} />;
      case "upload":
        return <Upload size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-gradient-to-b from-[#0c031c] via-[#1a0a2e] to-[#000] border-l border-white/10 shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {activeTab === "profile" ? "Profile" : "Generated Ads"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-gray-300 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex-1 py-2 px-4 rounded-lg transition ${
                    activeTab === "profile"
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("ads")}
                  className={`flex-1 py-2 px-4 rounded-lg transition relative ${
                    activeTab === "ads"
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  Ads
                  {generatedAds.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {generatedAds.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Profile Tab Content */}
              {activeTab === "profile" && (
                <>

              {/* User Avatar & Name */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-1">
                  <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center text-4xl">
                    {user.avatar}
                  </div>
                </div>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="text-xl font-bold text-white bg-transparent border-none outline-none text-center focus:bg-white/5 rounded-lg px-2 py-1 transition"
                  placeholder="Your Name"
                />
              </div>

              {/* User Info Form */}
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/40 text-white outline-none border border-white/20 focus:border-purple-500 transition"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Avatar Emoji
                  </label>
                  <input
                    type="text"
                    value={user.avatar}
                    onChange={(e) => handleInputChange("avatar", e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/40 text-white outline-none border border-white/20 focus:border-purple-500 transition text-center text-2xl"
                    placeholder="👤"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Join Date
                  </label>
                  <input
                    type="text"
                    value={user.joinDate}
                    onChange={(e) => handleInputChange("joinDate", e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/40 text-white outline-none border border-white/20 focus:border-blue-500 transition"
                    placeholder="January 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Plan
                  </label>
                  <select
                    value={user.plan}
                    onChange={(e) => handleInputChange("plan", e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/40 text-white outline-none border border-white/20 focus:border-purple-500 transition"
                  >
                    <option value="Free">Free</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-8">
                <h3 className="text-lg font-bold text-gray-300 mb-4">Statistics</h3>
                {stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{stat.icon}</span>
                        <span className="text-gray-400 text-sm">{stat.label}</span>
                      </div>
                      <span className="text-white font-bold">{stat.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Instagram Connection */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Instagram size={18} className="text-purple-300" />
                    <h3 className="text-sm font-bold text-purple-300">
                      Instagram
                    </h3>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      instagramConnected ? "bg-green-400" : "bg-gray-500"
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  {instagramConnected
                    ? "Connected and ready to post"
                    : "Connect to auto-post your ads"}
                </p>
                <Link
                  to="/instagram-settings"
                  onClick={onClose}
                  className="block w-full text-center py-2 px-3 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition text-xs font-medium"
                >
                  {instagramConnected ? "Manage" : "Connect"}
                </Link>
              </div>

              {/* Additional Info */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <h3 className="text-sm font-bold text-purple-300 mb-2">
                  💡 Quick Tips
                </h3>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Your profile is saved automatically</li>
                  <li>• Update your info anytime</li>
                  <li>• Track your ad generation stats</li>
                </ul>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  const defaultUser = {
                    name: "John Doe",
                    email: "john.doe@example.com",
                    avatar: "👤",
                    joinDate: "January 2024",
                    adsGenerated: user.adsGenerated || 0, // Keep ads count
                    plan: "Free",
                    generatedAds: user.generatedAds || [], // Keep generated ads
                  };
                  updateUser(defaultUser);
                }}
                className="w-full mt-6 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition font-medium"
              >
                Reset Profile
              </button>
                </>
              )}

              {/* Generated Ads Tab Content */}
              {activeTab === "ads" && (
                <div className="space-y-4">
                  {generatedAds.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-gray-400">No ads generated yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Start creating ads to see them here!
                      </p>
                    </div>
                  ) : (
                    generatedAds.map((ad) => (
                      <motion.div
                        key={ad.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                              {getTypeIcon(ad.type)}
                            </div>
                            <div>
                              <h4 className="text-white font-semibold text-sm">
                                {ad.productName || "Untitled"}
                              </h4>
                              <p className="text-xs text-gray-400">
                                {formatDate(ad.timestamp)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteGeneratedAd(ad.id)}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                            title="Delete ad"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {ad.imageUrl && (
                          <div className="mb-3 rounded-lg overflow-hidden">
                            <img
                              src={ad.imageUrl}
                              alt={ad.productName}
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        )}

                        {ad.adText && (
                          <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                            {ad.adText}
                          </p>
                        )}

                        {ad.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {ad.description}
                          </p>
                        )}

                        <div className="mt-3 flex gap-2">
                          {ad.imageUrl && (
                            <a
                              href={ad.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center py-2 px-3 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition text-xs font-medium"
                            >
                              View
                            </a>
                          )}
                          <button
                            onClick={() => {
                              if (ad.imageUrl) {
                                const link = document.createElement("a");
                                link.href = ad.imageUrl;
                                link.download = `automark_${ad.id}.jpg`;
                                link.click();
                              }
                            }}
                            className="flex-1 py-2 px-3 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition text-xs font-medium"
                            disabled={!ad.imageUrl}
                          >
                            Download
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

