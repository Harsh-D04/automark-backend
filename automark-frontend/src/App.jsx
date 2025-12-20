import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Navigation from "./components/Navigation";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Generator from "./pages/Generator";
import About from "./pages/About";
import Contact from "./pages/Contact";
import InstagramSettings from "./pages/InstagramSettings";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-[#0c031c] to-[#000]">
          <Navigation onSidebarToggle={toggleSidebar} />
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generator" element={<Generator />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/instagram-settings" element={<InstagramSettings />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}
