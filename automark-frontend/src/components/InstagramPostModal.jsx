import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Instagram, Loader } from "lucide-react";
import axios from "axios";

const API = "http://localhost:8000";

export default function InstagramPostModal({
  isOpen,
  onClose,
  imageUrl,
  adText,
  productName,
  description,
}) {
  const [postType, setPostType] = useState("feed");
  const [caption, setCaption] = useState("");
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && adText) {
      generateCaption();
    }
  }, [isOpen, adText]);

  const generateCaption = async () => {
    setGeneratingCaption(true);
    try {
      const formData = new FormData();
      formData.append("ad_text", adText);
      formData.append("product_name", productName || "");
      formData.append("description", description || "");

      const res = await axios.post(
        `${API}/api/instagram/generate-caption`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setCaption(res.data.caption);
    } catch (error) {
      console.error("Error generating caption:", error);
      // Fallback caption
      setCaption(`${adText}\n\n✨ ${productName}\n\n#marketing #advertising`);
    } finally {
      setGeneratingCaption(false);
    }
  };

  const handlePost = async () => {
    setPosting(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/api/instagram/post`, {
        user_id: "default_user",
        image_url: imageUrl,
        ad_text: adText,
        product_name: productName || "Product",
        description: description || "",
        post_type: postType,
        caption: caption,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setCaption("");
      }, 2000);
    } catch (error) {
      console.error("Error posting to Instagram:", error);
      setError(
        error.response?.data?.detail ||
          "Failed to post to Instagram. Please check your connection."
      );
    } finally {
      setPosting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-gradient-to-br from-[#0c031c] via-[#1a0a2e] to-[#000] rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
                  <Instagram size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Post to Instagram</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-gray-300 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {success ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-green-400 mb-2">
                  Posted Successfully!
                </h3>
                <p className="text-gray-400">
                  Your ad has been posted to Instagram {postType}
                </p>
              </div>
            ) : (
              <>
                {/* Image Preview */}
                {imageUrl && (
                  <div className="mb-6 rounded-xl overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Post Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Post Type
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPostType("feed")}
                      className={`flex-1 py-3 px-4 rounded-xl transition ${
                        postType === "feed"
                          ? "bg-purple-600 text-white"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }`}
                    >
                      📱 Feed Post
                    </button>
                    <button
                      onClick={() => setPostType("story")}
                      className={`flex-1 py-3 px-4 rounded-xl transition ${
                        postType === "story"
                          ? "bg-blue-600 text-white"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }`}
                    >
                      ✨ Story
                    </button>
                  </div>
                </div>

                {/* Caption Editor */}
                {postType === "feed" && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-400">
                        Caption
                      </label>
                      <button
                        onClick={generateCaption}
                        disabled={generatingCaption}
                        className="text-xs text-purple-400 hover:text-purple-300 transition disabled:opacity-50"
                      >
                        {generatingCaption ? "Generating..." : "🔄 Regenerate"}
                      </button>
                    </div>
                    {generatingCaption ? (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-gray-400">
                        <Loader className="animate-spin" size={16} />
                        <span>Generating AI caption...</span>
                      </div>
                    ) : (
                      <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        rows={8}
                        className="w-full p-4 rounded-xl bg-black/40 text-white outline-none border border-white/20 focus:border-purple-500 transition resize-none"
                        placeholder="Enter your Instagram caption..."
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {caption.length}/2200 characters
                    </p>
                  </div>
                )}

                {postType === "story" && (
                  <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <p className="text-sm text-blue-300">
                      💡 Stories don't support captions. Your image will be posted
                      directly.
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePost}
                    disabled={posting || (postType === "feed" && !caption.trim())}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {posting ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Instagram size={20} />
                        Post to Instagram
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

