
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Image Search",
      description: "Search your image collection using natural language. Find exactly what you're looking for without tags or filenames.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
          <circle cx="12" cy="13" r="3"></circle>
        </svg>
      ),
      path: "/image-search",
      color: "from-violet-500/20 to-indigo-500/20",
    },
    {
      title: "Live Video Captioning",
      description: "Real-time descriptions of your camera feed, with voice output for visually impaired users.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
          <path d="M7 2v11m0 3v6"></path>
          <path d="M20.83 14.83a4 4 0 0 0 0-5.66A4 4 0 0 0 18 10"></path>
          <path d="M12 12H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4"></path>
          <path d="M12 22H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-9"></path>
        </svg>
      ),
      path: "/live-captions",
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      title: "Video Summarizer",
      description: "Upload a video and get a concise summary of its content, available as text and speech.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
          <rect width="18" height="18" x="3" y="3" rx="2"></rect>
          <path d="m9 8 6 4-6 4Z"></path>
        </svg>
      ),
      path: "/video-summary",
      color: "from-purple-500/20 to-pink-500/20",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-card">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative px-6 py-24 flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-primary">Vision</span>AI Assistant
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Advanced AI vision features that run entirely in your browser.
            <span className="block mt-2 text-primary">No backend. No data sharing. 100% private.</span>
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md shadow-lg font-medium text-lg"
              onClick={() => navigate("/image-search")}
            >
              Get Started
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md shadow-lg font-medium text-lg"
              onClick={() => {
                const element = document.getElementById("features");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute -top-36 -right-36 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute -bottom-36 -left-36 w-96 h-96 rounded-full bg-accent/10 blur-3xl"></div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Offline AI Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              All features run locally in your browser, preserving your privacy while delivering powerful AI capabilities.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className={`bg-gradient-to-br ${feature.color} p-6 rounded-lg shadow-lg border border-border overflow-hidden relative`}
              >
                <div className="mb-4 text-primary">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm"
                  onClick={() => navigate(feature.path)}
                >
                  Try It Now
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 px-6 bg-card"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Designed for Everyone</h2>
          <p className="text-xl text-muted-foreground mb-12">
            Accessibility is at the core of our design. Every feature is crafted to be usable by people of all abilities.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-secondary/50 p-6 rounded-lg text-left"
            >
              <h3 className="text-xl font-bold mb-4">Voice Accessibility</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Text-to-speech for all generated content
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Keyboard shortcuts for all operations
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Screen reader compatible interface
                </li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-secondary/50 p-6 rounded-lg text-left"
            >
              <h3 className="text-xl font-bold mb-4">Visual Accessibility</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  High contrast UI elements
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Properly labeled inputs and controls
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Responsive design for all devices
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Privacy Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 px-6"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">100% Private. 100% Local.</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Your data never leaves your device. All AI processing happens locally in your browser.
          </p>
          
          <div className="p-6 bg-card rounded-lg border border-border">
            <ul className="space-y-4 text-left">
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary mt-1">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <div>
                  <h3 className="font-semibold text-lg">No Server Dependencies</h3>
                  <p className="text-muted-foreground">The entire application runs within your web browser. No communication with external servers.</p>
                </div>
              </li>
              
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary mt-1">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <div>
                  <h3 className="font-semibold text-lg">Your Data Stays Local</h3>
                  <p className="text-muted-foreground">Images, videos, and analysis results never leave your device. Everything stays on your machine.</p>
                </div>
              </li>
              
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary mt-1">
                  <path d="M9 12H1v7c0 1.1.9 2 2 2h18a2 2 0 0 0 2-2v-7h-8"></path>
                  <path d="M9 8V2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6"></path>
                  <path d="M12 19v-7"></path>
                  <path d="M8 19v-3"></path>
                  <path d="M16 19v-3"></path>
                </svg>
                <div>
                  <h3 className="font-semibold text-lg">Works Offline</h3>
                  <p className="text-muted-foreground">Once loaded, the app functions without an internet connection. Perfect for private environments.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-primary">
              Vision<span className="text-foreground">AI</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Powered by browser-based AI technology
            </p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} VisionAI Assistant
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Privacy-first, local-first AI technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
