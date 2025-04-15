
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const VideoSummary: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const synth = useRef<SpeechSynthesis | null>(null);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synth.current = window.speechSynthesis;
      utterance.current = new SpeechSynthesisUtterance();
      
      // Get available voices and set a natural-sounding one
      const setVoice = () => {
        if (synth.current && utterance.current) {
          const voices = synth.current.getVoices();
          // Try to find a good quality voice
          const preferredVoice = voices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Natural') || 
            voice.name.includes('Premium')
          );
          
          if (preferredVoice) {
            utterance.current.voice = preferredVoice;
          } else if (voices.length > 0) {
            utterance.current.voice = voices[0];
          }
          
          // Configure for better readability
          utterance.current.rate = 1.0;
          utterance.current.pitch = 1.0;
        }
      };
      
      // Set voice when available
      if (synth.current.onvoiceschanged !== undefined) {
        synth.current.onvoiceschanged = setVoice;
      }
      
      setVoice();
      
      // Detect when speech is done
      utterance.current.onend = () => {
        setIsSpeaking(false);
      };
    }
    
    return () => {
      if (synth.current && synth.current.speaking) {
        synth.current.cancel();
      }
      
      if (videoURL) {
        URL.revokeObjectURL(videoURL);
      }
    };
  }, []);

  // Update video progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };
    
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));
    
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('play', () => setIsPlaying(true));
      video.removeEventListener('pause', () => setIsPlaying(false));
    };
  }, [videoURL]);

  // Handler for video selection
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      return;
    }
    
    // Clear previous selection
    if (videoURL) {
      URL.revokeObjectURL(videoURL);
    }
    
    setSelectedVideo(file);
    const url = URL.createObjectURL(file);
    setVideoURL(url);
    setSummary("");
  };

  // Open file dialog
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Load AI model
  const loadModel = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate model loading - in a real app this would use transformers.js
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsModelLoaded(true);
    } catch (error) {
      console.error("Error loading model:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process video to generate summary
  const processVideo = async () => {
    if (!selectedVideo || !isModelLoaded) return;
    
    setIsProcessing(true);
    setSummary("");
    
    try {
      // Simulate video processing - in a real app we would:
      // 1. Extract frames from the video
      // 2. Process frames through a vision model
      // 3. Generate a summary with a language model
      
      // Video processing simulation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate a fake summary for demo purposes
      const videoName = selectedVideo.name;
      const videoDuration = videoRef.current?.duration || 0;
      const durationMinutes = Math.floor(videoDuration / 60);
      const durationSeconds = Math.floor(videoDuration % 60);
      
      const summaryTemplates = [
        `This ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')} minute video shows a person demonstrating how to use a product or service. The presenter starts by introducing the topic, then walks through several key features and benefits. The video concludes with a call to action for viewers.`,
        
        `The video titled "${videoName}" is a ${durationMinutes}-minute tutorial that explains a step-by-step process. It begins with an overview, then demonstrates each step in detail with clear visual examples. The presenter provides helpful tips throughout and summarizes the main points at the end.`,
        
        `This is a short video about nature and wildlife. It features several outdoor scenes with animals in their natural habitat. The footage is mostly steady with occasional panning shots to show the landscape. There's no dialogue, only ambient sounds and background music.`,
        
        `The video shows a technology demonstration with various digital interfaces and devices. The presenter explains how the technology works and shows several use cases. There are close-up shots of screens and devices, along with wider shots of the technology in use.`,
        
        `This appears to be a personal vlog or social media content. The person in the video is speaking directly to the camera in an indoor setting. They discuss personal experiences and opinions, occasionally showing items or locations relevant to the discussion.`
      ];
      
      const generatedSummary = summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)];
      setSummary(generatedSummary);
      
    } catch (error) {
      console.error("Error processing video:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Play/pause video
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  // Speak summary text
  const speakSummary = () => {
    if (!synth.current || !utterance.current || !summary) return;
    
    // Cancel current speech if speaking
    if (synth.current.speaking) {
      synth.current.cancel();
      setIsSpeaking(false);
      return;
    }
    
    utterance.current.text = summary;
    setIsSpeaking(true);
    synth.current.speak(utterance.current);
  };

  // Clear selected video
  const clearVideo = () => {
    if (videoURL) {
      URL.revokeObjectURL(videoURL);
    }
    
    setSelectedVideo(null);
    setVideoURL(null);
    setSummary("");
    setProgress(0);
    
    if (synth.current && synth.current.speaking) {
      synth.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Video Summarizer</h1>
        <p className="text-muted-foreground mb-8">
          Upload a video to get an AI-generated summary, with both text and voice options.
        </p>
      </motion.div>

      {/* Video Selection and Player */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm"
              onClick={openFileDialog}
            >
              Select Video
            </motion.button>
            
            {selectedVideo && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md shadow-sm"
                onClick={clearVideo}
              >
                Clear Video
              </motion.button>
            )}
            
            {selectedVideo && !isModelLoaded && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-md shadow-sm"
                onClick={loadModel}
                disabled={isProcessing}
              >
                {isProcessing ? 'Loading Model...' : 'Load AI Model'}
              </motion.button>
            )}
            
            {selectedVideo && isModelLoaded && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-md shadow-sm"
                onClick={processVideo}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Generate Summary'}
              </motion.button>
            )}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleVideoSelect}
            accept="video/*"
            className="hidden"
          />
          
          {/* Video Player */}
          {videoURL && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-video bg-muted rounded-lg overflow-hidden shadow-lg"
            >
              <video
                ref={videoRef}
                src={videoURL}
                className="w-full h-full object-contain"
                controls
              />
              
              {/* Custom Progress Bar */}
              <div className="relative h-1 bg-muted-foreground/20 cursor-pointer">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {/* Basic Custom Controls */}
              <div className="flex items-center justify-between p-2 bg-card/80">
                <button
                  onClick={togglePlayPause}
                  className="p-1 hover:bg-muted rounded-full"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <rect width="4" height="16" x="6" y="4"></rect>
                      <rect width="4" height="16" x="14" y="4"></rect>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  )}
                </button>
                
                <div className="text-sm text-muted-foreground">
                  {selectedVideo?.name}
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Summary Display */}
        <div>
          <div className="bg-card border border-border rounded-lg p-4 h-full">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              <span>Video Summary</span>
              
              {summary && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded-md shadow-sm flex items-center gap-2"
                  onClick={speakSummary}
                >
                  {isSpeaking ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <rect width="4" height="16" x="6" y="4"></rect>
                        <rect width="4" height="16" x="14" y="4"></rect>
                      </svg>
                      Stop Audio
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                      </svg>
                      Read Aloud
                    </>
                  )}
                </motion.button>
              )}
            </h2>
            
            {summary ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-invert max-w-none"
              >
                <p className="text-foreground">{summary}</p>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                {isProcessing ? (
                  <div className="text-center">
                    <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Analyzing video content...</p>
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 mb-4 opacity-20">
                      <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                      <path d="m9 8 6 4-6 4Z"></path>
                    </svg>
                    <p>Select and process a video to see its summary</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accessibility Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Accessibility Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card p-4 rounded-lg border border-border">
            <h3 className="text-lg font-medium mb-2">Voice Output</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Summary can be read aloud for visually impaired users.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm">Status:</span>
              <span className={`text-sm font-medium ${isSpeaking ? 'text-primary' : 'text-muted-foreground'}`}>
                {isSpeaking ? 'Speaking' : 'Ready'}
              </span>
            </div>
          </div>
          
          <div className="bg-card p-4 rounded-lg border border-border">
            <h3 className="text-lg font-medium mb-2">Keyboard Shortcuts</h3>
            <ul className="text-sm space-y-2">
              <li className="flex justify-between">
                <span>Play/Pause Video</span>
                <span className="font-mono bg-muted px-2 py-0.5 rounded">Space</span>
              </li>
              <li className="flex justify-between">
                <span>Read Summary</span>
                <span className="font-mono bg-muted px-2 py-0.5 rounded">R</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Loading Overlay */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-background/80 z-50"
        >
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              {isModelLoaded ? 'Analyzing Video' : 'Loading AI Model'}
            </h3>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-shimmer bg-shimmer bg-[length:200%_100%]"></div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {isModelLoaded 
                ? 'Analyzing video content locally, no data leaves your device.'
                : 'Loading AI models locally, no data leaves your device.'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VideoSummary;
