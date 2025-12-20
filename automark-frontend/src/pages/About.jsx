import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c031c] via-[#1a0a2e] to-[#000]">
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            About AutoMark AI
          </h1>

          <div className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl border border-white/20 space-y-8">
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-purple-300 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                AutoMark AI was created to democratize professional marketing
                content creation. We believe that every business, regardless of
                size, should have access to high-quality advertising materials
                without the need for expensive design teams or marketing
                agencies.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-3xl font-bold text-blue-300 mb-4">
                Technology
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                Powered by cutting-edge AI technologies:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>
                  <strong className="text-purple-300">DeepSeek R1:</strong>{" "}
                  Advanced language model for generating compelling ad copy
                </li>
                <li>
                  <strong className="text-blue-300">Stable Diffusion:</strong>{" "}
                  State-of-the-art image generation for creating professional
                  marketing visuals
                </li>
                <li>
                  <strong className="text-purple-300">Background Removal:</strong>{" "}
                  AI-powered image processing for seamless product enhancement
                </li>
              </ul>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-purple-300 mb-4">
                Features
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "AI-generated marketing copy",
                  "Professional image generation",
                  "Product image enhancement",
                  "Background removal and replacement",
                  "Customizable ad text overlays",
                  "High-quality output ready for use",
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-3 text-gray-300"
                  >
                    <span className="text-purple-400">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="pt-8 border-t border-white/10"
            >
              <h2 className="text-3xl font-bold text-blue-300 mb-4">
                Why Choose AutoMark?
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                AutoMark AI combines the power of multiple AI models to deliver
                a complete marketing solution. Whether you need catchy ad copy,
                stunning visuals, or enhanced product images, our platform
                handles it all in one seamless workflow. Save time, reduce
                costs, and create professional marketing materials that drive
                results.
              </p>
            </motion.section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

