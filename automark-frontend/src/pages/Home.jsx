import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c031c] via-[#1a0a2e] to-[#000]">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            🚀 AutoMark AI
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4">
            Create Stunning Marketing Ads with AI
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Transform your products into professional marketing materials using
            cutting-edge AI technology. Generate compelling ad copy and
            eye-catching visuals in seconds.
          </p>
          <Link
            to="/generator"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-xl rounded-2xl shadow-[0_0_30px_#7c3aedaa] hover:scale-105 transition-transform"
          >
            Get Started →
          </Link>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:border-purple-500 transition"
          >
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-purple-300 mb-3">
              AI-Powered Copy
            </h3>
            <p className="text-gray-300">
              Generate compelling ad copy using advanced AI models. Get catchy,
              professional marketing text tailored to your product.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:border-blue-500 transition"
          >
            <div className="text-5xl mb-4">🖼️</div>
            <h3 className="text-2xl font-bold text-blue-300 mb-3">
              Visual Generation
            </h3>
            <p className="text-gray-300">
              Create stunning marketing visuals with Stable Diffusion. Generate
              professional banners and ad images automatically.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:border-purple-500 transition"
          >
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-purple-300 mb-3">
              Image Enhancement
            </h3>
            <p className="text-gray-300">
              Upload your product images and let AI enhance them with
              professional backgrounds, lighting, and styling.
            </p>
          </motion.div>
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10"
        >
          <h2 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Enter Details", desc: "Provide your product name and description" },
              { step: "2", title: "Choose Mode", desc: "Select text, image generation, or upload" },
              { step: "3", title: "AI Processing", desc: "Our AI creates your marketing content" },
              { step: "4", title: "Download", desc: "Get your professional ad ready to use" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

