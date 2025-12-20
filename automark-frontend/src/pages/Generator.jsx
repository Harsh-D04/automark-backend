import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { useUser } from "../context/UserContext";
import InstagramPostModal from "../components/InstagramPostModal";

export default function Generator() {
  const { addGeneratedAd } = useUser();
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [showInstagramModal, setShowInstagramModal] = useState(false);

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
  const [tab, setTab] = useState("text");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");

  const [generatedText, setGeneratedText] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [generatedImageText, setGeneratedImageText] = useState("");

  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const API = "http://localhost:8000";

  const handleDownload = async () => {
    if (!generatedImage) return;
    
    setDownloading(true);
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Get file extension from the image URL
      const extension = generatedImage.split('.').pop().split('?')[0] || 'jpg';
      link.download = `automark_generated_${Date.now()}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("❌ Failed to download image. Please try again.");
    }
    setDownloading(false);
  };

  const handleTabChange = (t) => {
    setTab(t);
    setGeneratedText("");
    setGeneratedImage("");
    setGeneratedImageText("");
    setUploadedFile(null);
  };

  const generateAI = async () => {
    setLoading(true);
    try {
      if (tab === "text") {
        const res = await axios.post(`${API}/generate-ad/`, {
          product_name: productName,
          description,
        });
        setGeneratedText(res.data.ad_text);
        addGeneratedAd({
          type: "text",
          productName,
          description,
          adText: res.data.ad_text,
          imageUrl: null,
        });
      } else if (tab === "image") {
        const res = await axios.post(`${API}/generate-visual-ad/`, {
          product_name: productName,
          description,
        });
        const imageUrl = `${API}/generated_ads/${res.data.image_name}`;
        setGeneratedImage(imageUrl);
        setGeneratedImageText(res.data.ad_text);
        addGeneratedAd({
          type: "image",
          productName,
          description,
          adText: res.data.ad_text,
          imageUrl,
        });
      } else if (tab === "upload") {
        if (!uploadedFile) {
          alert("Please upload an image");
          return;
        }

        const formData = new FormData();
        formData.append("product_name", productName);
        formData.append("description", description);
        formData.append("file", uploadedFile);

        const res = await axios.post(
          `${API}/process_image_enhancement/`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        setGeneratedImage(res.data.image_url);
        setGeneratedImageText(res.data.ad_text);
        addGeneratedAd({
          type: "upload",
          productName,
          description,
          adText: res.data.ad_text,
          imageUrl: res.data.image_url,
        });
      }
    } catch (err) {
      console.log(err);
      alert("❌ Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c031c] to-[#000] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-[0_0_40px_#772aff50] max-w-3xl w-full"
      >
        <h1 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          🚀 AutoMark AI
        </h1>

        {/* TABS */}
        <div className="flex justify-center mb-6 gap-4">
          {[
            { id: "text", label: "📝 Text Ad" },
            { id: "image", label: "🖼 Generate Image" },
            { id: "upload", label: "📤 Upload Image" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`px-6 py-2 rounded-full transition-all ${
                tab === t.id
                  ? "bg-purple-600 text-white shadow-[0_0_20px_#a855f7]"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* PRODUCT NAME */}
        {tab !== "upload" && (
          <input
            className="w-full p-4 rounded-2xl bg-black/40 text-white outline-none border border-white/20 focus:border-purple-500 transition"
            placeholder="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        )}

        {/* DESCRIPTION */}
        <textarea
          className="w-full mt-4 p-4 h-28 rounded-2xl bg-black/40 text-white outline-none border border-white/20 focus:border-blue-500 transition"
          placeholder={
            tab === "upload"
              ? "Describe what kind of transformation you want"
              : "Product Description"
          }
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* FILE UPLOAD */}
        {tab === "upload" && (
          <div className="mt-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setUploadedFile(e.target.files[0])}
              className="text-white"
            />
          </div>
        )}

        {/* GENERATE BUTTON */}
        <button
          onClick={generateAI}
          disabled={loading}
          className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-xl shadow-[0_0_25px_#7c3aedaa] hover:scale-[1.03] transition disabled:opacity-40"
        >
          {loading ? "⏳ Generating…" : "⚡ Generate"}
        </button>

        {/* TEXT OUTPUT */}
        {tab === "text" && generatedText && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 rounded-2xl bg-black/40 border border-white/10"
          >
            <h2 className="text-xl font-bold text-purple-300 mb-2">
              ✨ AI Generated Ad:
            </h2>
            <p className="text-gray-200">{generatedText}</p>
          </motion.div>
        )}

        {/* IMAGE OUTPUT */}
        {(tab === "image" || tab === "upload") && generatedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 space-y-4"
          >
            <img
              src={generatedImage}
              alt="Generated Ad"
              className="rounded-2xl shadow-[0_0_50px_#9333ea55] max-w-full"
            />

            {/* ACTION BUTTONS */}
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? "⏳ Downloading..." : "⬇ Download Image"}
              </button>
              
              {instagramConnected && (
                <button
                  onClick={() => setShowInstagramModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition flex items-center gap-2"
                >
                  <Instagram size={20} />
                  Post to Instagram
                </button>
              )}
            </div>

            {generatedImageText && (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                <h2 className="text-xl font-bold text-purple-300 mb-2">
                  ✨ Ad Text:
                </h2>
                <p className="text-gray-200">{generatedImageText}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Instagram Post Modal */}
        <InstagramPostModal
          isOpen={showInstagramModal}
          onClose={() => setShowInstagramModal(false)}
          imageUrl={generatedImage}
          adText={generatedImageText || generatedText}
          productName={productName}
          description={description}
        />
      </motion.div>
    </div>
  );
}

