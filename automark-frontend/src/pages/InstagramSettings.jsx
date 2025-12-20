import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Instagram, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import axios from "axios";

const API = "http://localhost:8000";

export default function InstagramSettings() {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState(null);
  const [configStatus, setConfigStatus] = useState(null);

  useEffect(() => {
    checkConfigStatus();
    checkConnectionStatus();
    // Check for callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("connected") === "true") {
      setMessage({ type: "success", text: "Instagram connected successfully!" });
      checkConnectionStatus();
    }
    if (urlParams.get("error")) {
      setMessage({ type: "error", text: urlParams.get("error") });
    }
  }, []);

  const checkConfigStatus = async () => {
    try {
      const res = await axios.get(`${API}/api/instagram/config-status`);
      setConfigStatus(res.data);
    } catch (error) {
      console.error("Error checking config:", error);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const res = await axios.get(`${API}/api/instagram/status`, {
        params: { user_id: "default_user" },
      });
      setConnectionStatus(res.data);
    } catch (error) {
      console.error("Error checking status:", error);
      setConnectionStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // First check configuration status
      const configRes = await axios.get(`${API}/api/instagram/config-status`);
      if (!configRes.data.app_id_configured || !configRes.data.app_secret_configured) {
        setMessage({
          type: "error",
          text: configRes.data.message || "Instagram credentials not configured. Please set up your .env file with INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET. See INSTAGRAM_SETUP.md for instructions.",
        });
        setConnecting(false);
        return;
      }

      const res = await axios.get(`${API}/api/instagram/auth-url`);
      // Redirect to Instagram OAuth
      window.location.href = res.data.auth_url;
    } catch (error) {
      console.error("Error connecting:", error);
      const errorMessage = error.response?.data?.detail;
      let messageText = "Failed to initiate Instagram connection.";
      
      if (errorMessage) {
        if (typeof errorMessage === "object" && errorMessage.message) {
          messageText = errorMessage.message;
        } else if (typeof errorMessage === "string") {
          messageText = errorMessage;
        }
      }
      
      setMessage({
        type: "error",
        text: messageText,
      });
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await axios.post(`${API}/api/instagram/disconnect`, {
        user_id: "default_user",
      });
      setConnectionStatus({ connected: false });
      setMessage({ type: "success", text: "Instagram disconnected successfully!" });
    } catch (error) {
      console.error("Error disconnecting:", error);
      setMessage({ type: "error", text: "Failed to disconnect Instagram." });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c031c] via-[#1a0a2e] to-[#000]">
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="mb-8">
            <Link
              to="/"
              className="text-purple-400 hover:text-purple-300 transition mb-4 inline-block"
            >
              ← Back to Home
            </Link>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Instagram Integration
            </h1>
            <p className="text-gray-400 text-lg">
              Connect your Instagram account to automatically post your generated ads
            </p>
          </div>

          {/* Message Alert */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl mb-6 ${
                message.type === "success"
                  ? "bg-green-500/20 border border-green-500/50 text-green-300"
                  : "bg-red-500/20 border border-red-500/50 text-red-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === "success" ? (
                  <CheckCircle size={20} />
                ) : (
                  <XCircle size={20} />
                )}
                <span>{message.text}</span>
              </div>
            </motion.div>
          )}

          {/* Connection Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20"
          >
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-gray-400 mt-4">Checking connection status...</p>
              </div>
            ) : connectionStatus?.connected ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                    <Instagram size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Connected to Instagram
                    </h2>
                    <p className="text-gray-400">
                      @{connectionStatus.username || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Account Type: {connectionStatus.account_type || "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2 text-green-300">
                    <CheckCircle size={20} />
                    <span>Your Instagram account is connected and ready to use!</span>
                  </div>
                </div>

                <button
                  onClick={handleDisconnect}
                  className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition font-medium"
                >
                  Disconnect Instagram
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Configuration Status */}
                {configStatus && (!configStatus.app_id_configured || !configStatus.app_secret_configured) && (
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-yellow-300 mt-0.5" />
                      <div className="text-sm text-yellow-300">
                        <p className="font-semibold mb-2">Configuration Required</p>
                        <p className="text-yellow-200 mb-2">{configStatus.message}</p>
                        <div className="mt-2 space-y-1 text-xs text-yellow-200/80">
                          <p>• Create a .env file in your backend root directory</p>
                          <p>• Add: INSTAGRAM_APP_ID=your_app_id</p>
                          <p>• Add: INSTAGRAM_APP_SECRET=your_app_secret</p>
                          <p>• See INSTAGRAM_SETUP.md for detailed instructions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div className="p-6 rounded-full bg-white/5 inline-block mb-4">
                    <Instagram size={48} className="text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Connect Your Instagram Account
                  </h2>
                  <p className="text-gray-400">
                    Link your Instagram Business or Creator account to start posting
                    automatically
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-blue-300 mt-0.5" />
                    <div className="text-sm text-blue-300">
                      <p className="font-semibold mb-2">Requirements:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-200">
                        <li>Instagram Business or Creator account</li>
                        <li>Facebook Page connected to your Instagram account</li>
                        <li>Admin access to the Facebook Page</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-lg shadow-[0_0_25px_#7c3aedaa] hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {connecting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Instagram size={20} />
                      Connect Instagram
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {/* Features Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid md:grid-cols-3 gap-4"
          >
            {[
              {
                icon: "📱",
                title: "Auto Post",
                desc: "Post your generated ads directly to Instagram",
              },
              {
                icon: "✨",
                title: "Smart Captions",
                desc: "AI-generated captions with hashtags and emojis",
              },
              {
                icon: "📊",
                title: "Track Performance",
                desc: "Monitor your Instagram post engagement",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

