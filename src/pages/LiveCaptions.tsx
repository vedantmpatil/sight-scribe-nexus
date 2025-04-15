
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";

const LiveCaptions: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [captions, setCaptions] = useState<string>("");
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [device, setDevice] = useState<MediaDeviceInfo | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const webcamRef = useRef<Webcam>(null);
  const captureInterval = useRef<number | null>(null);
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
    };
  }, []);

  // Get available cameras
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        
        // Default to the first camera if available
        if (videoDevices.length > 0) {
          setDevice(videoDevices[0]);
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };
    
    getDevices();
  }, []);

  // Load AI model
  const loadModel = async () => {
    setIsLoading(true);
    
    try {
      // Simulate model loading - in a real app this would use transformers.js
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsModelLoaded(true);
    } catch (error) {
      console.error("Error loading model:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Process frame from webcam
  const processFrame = useCallback(() => {
    if (!webcamRef.current || !isModelLoaded) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    
    // Simulate AI processing - in a real app we would:
    // 1. Feed the image to a vision model
    // 2. Generate a description
    // 3. Update the caption
    
    const possibleCaptions = [
      "A person looking at a computer screen.",
      "Someone sitting at a desk with a keyboard.",
      "A person in an indoor environment.",
      "A person gesturing with their hands.",
      "Someone wearing casual clothing indoors.",
      "A living room with furniture and a person present.",
      "A person with a neutral expression looking directly at the camera.",
      "Indoor lighting illuminating a person's face.",
      "A home office setting with a person present.",
      "A person slightly adjusting their position.",
    ];
    
    const newCaption = possibleCaptions[Math.floor(Math.random() * possibleCaptions.length)];
    
    // Only update if the caption changed
    if (newCaption !== captions) {
      setCaptions(newCaption);
      speakText(newCaption);
    }
  }, [isModelLoaded, captions]);

  // Start recording and processing frames
  const startRecording = () => {
    if (!isModelLoaded) return;
    
    setIsRecording(true);
    captureInterval.current = window.setInterval(() => {
      processFrame();
    }, 2000); // Process every 2 seconds
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
    
    if (captureInterval.current) {
      clearInterval(captureInterval.current);
      captureInterval.current = null;
    }
    
    if (synth.current && synth.current.speaking) {
      synth.current.cancel();
    }
  };

  // Speak text using speech synthesis
  const speakText = (text: string) => {
    if (!synth.current || !utterance.current) return;
    
    // Cancel current speech if speaking
    if (synth.current.speaking) {
      synth.current.cancel();
    }
    
    utterance.current.text = text;
    setIsSpeaking(true);
    synth.current.speak(utterance.current);
  };

  // Switch camera
  const switchCamera = (deviceId: string) => {
    const selectedDevice = devices.find(d => d.deviceId === deviceId) || null;
    setDevice(selectedDevice);
  };

  return (
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Live Video Captioning</h1>
        <p className="text-muted-foreground mb-8">
          Real-time descriptions of what your camera sees, with speech output for accessibility.
        </p>
      </motion.div>

      {/* Camera View */}
      <div className="mb-8 relative">
        <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-lg">
          {device ? (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                deviceId: device.deviceId,
                facingMode: "user",
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No camera available
            </div>
          )}
          
          {/* Caption Overlay */}
          <AnimatePresence>
            {isRecording && captions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-0 left-0 right-0 p-4 bg-black/70 text-white"
              >
                <div className="flex items-center gap-2">
                  {isSpeaking && (
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  )}
                  <p className="text-lg font-medium">{captions}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          {!isModelLoaded ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm"
              onClick={loadModel}
              disabled={isLoading}
            >
              {isLoading ? 'Loading Model...' : 'Load AI Model'}
            </motion.button>
          ) : (
            <>
              {!isRecording ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm"
                  onClick={startRecording}
                >
                  Start Captioning
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md shadow-sm"
                  onClick={stopRecording}
                >
                  Stop Captioning
                </motion.button>
              )}
            </>
          )}
          
          {/* Camera Selection */}
          {devices.length > 1 && (
            <select
              className="px-4 py-2 bg-card border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={device?.deviceId || ''}
              onChange={(e) => switchCamera(e.target.value)}
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${devices.indexOf(device) + 1}`}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Accessibility Controls */}
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
              All captions are automatically spoken aloud.
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
                <span>Start/Stop Captioning</span>
                <span className="font-mono bg-muted px-2 py-0.5 rounded">Space</span>
              </li>
              <li className="flex justify-between">
                <span>Repeat Last Caption</span>
                <span className="font-mono bg-muted px-2 py-0.5 rounded">R</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-background/80 z-50"
        >
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Loading AI Model</h3>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-shimmer bg-shimmer bg-[length:200%_100%]"></div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Loading vision model locally, no data leaves your device.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LiveCaptions;
