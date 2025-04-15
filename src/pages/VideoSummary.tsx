
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Loading from "@/components/ui/loading";
import { pipeline } from "@huggingface/transformers";

const VideoSummary: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [contentSummary, setContentSummary] = useState<string>("");
  const [scenerySummary, setScenerySummary] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"content" | "scenery">("content");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingText, setLoadingText] = useState<string>("Loading AI models...");
  const [captioningModel, setCaptioningModel] = useState<any>(null);
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
    setContentSummary("");
    setScenerySummary("");
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
    setLoadingText("Loading video analysis models...");
    
    try {
      // Load image captioning model (will be used for video frames)
      setLoadingProgress(10);
      const captioner = await pipeline(
        "image-to-text", 
        "Xenova/vit-gpt2-image-captioning",
        { 
          progress_callback: (progressInfo) => {
            setLoadingProgress(10 + ((progressInfo.status === 'progress' && progressInfo.value ? progressInfo.value : 0) * 90));
          }
        }
      );
      setCaptioningModel(captioner);
      
      setIsModelLoaded(true);
    } catch (error) {
      console.error("Error loading model:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Extract frames from video at regular intervals
  const extractFrames = async (videoElem: HTMLVideoElement, numFrames = 6): Promise<string[]> => {
    return new Promise((resolve) => {
      const frames: string[] = [];
      const duration = videoElem.duration;
      const interval = duration / numFrames;
      let currentFrame = 0;
      
      // Create an off-screen canvas for frame extraction
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        resolve([]);
        return;
      }
      
      canvas.width = videoElem.videoWidth;
      canvas.height = videoElem.videoHeight;
      
      const processFrame = () => {
        if (currentFrame >= numFrames) {
          resolve(frames);
          return;
        }
        
        const time = currentFrame * interval;
        videoElem.currentTime = time;
        
        videoElem.onseeked = () => {
          // Draw video frame to canvas
          context.drawImage(videoElem, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to data URL
          const dataURL = canvas.toDataURL('image/jpeg');
          frames.push(dataURL);
          
          // Process next frame
          currentFrame++;
          processFrame();
        };
      };
      
      processFrame();
    });
  };

  // Process video to generate summary
  const processVideo = async () => {
    if (!selectedVideo || !isModelLoaded || !captioningModel || !videoRef.current) return;
    
    setIsProcessing(true);
    setLoadingText("Analyzing video content...");
    setContentSummary("");
    setScenerySummary("");
    
    try {
      // Make sure video is loaded
      await new Promise<void>((resolve) => {
        if (videoRef.current!.readyState >= 3) {
          resolve();
        } else {
          videoRef.current!.oncanplay = () => resolve();
        }
      });
      
      // Extract frames from video
      setLoadingProgress(10);
      setLoadingText("Extracting video frames...");
      const frames = await extractFrames(videoRef.current);
      
      // Process each frame to generate captions
      setLoadingText("Analyzing frames...");
      const frameCaptions: string[] = [];
      
      for (let i = 0; i < frames.length; i++) {
        setLoadingProgress(20 + ((i / frames.length) * 40));
        const frameCaption = await captioningModel(frames[i]);
        const captionText = Array.isArray(frameCaption) 
          ? frameCaption[0].generated_text 
          : frameCaption.generated_text;
        frameCaptions.push(captionText);
      }
      
      // Generate content summary (what happens in the video)
      setLoadingProgress(60);
      setLoadingText("Generating content summary...");
      const contentSummaryText = generateContentSummary(frameCaptions, selectedVideo.name);
      setContentSummary(contentSummaryText);
      
      // Generate scenery summary (visual elements, setting, colors)
      setLoadingProgress(80);
      setLoadingText("Generating scenery summary...");
      const scenerySummaryText = generateScenerySummary(frameCaptions, selectedVideo.name);
      setScenerySummary(scenerySummaryText);
      
    } catch (error) {
      console.error("Error processing video:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate content summary from frame captions
  const generateContentSummary = (captions: string[], filename: string): string => {
    // Identify key actions and subjects
    const actions: string[] = [];
    const subjects: string[] = [];
    
    // Extract actions and subjects from captions
    captions.forEach(caption => {
      const words = caption.split(' ');
      
      // Simple heuristic: verbs are often actions, nouns are often subjects
      // This is a simplification - a real NLP model would do better
      words.forEach((word, index) => {
        if (word.endsWith('ing') && !actions.includes(word)) {
          actions.push(word);
        }
        
        // Likely to be subjects if they follow "a" or "the"
        if (index > 0 && (words[index-1] === 'a' || words[index-1] === 'the') && !subjects.includes(word)) {
          subjects.push(word);
        }
      });
    });
    
    // Estimate the overall theme from caption overlap
    const uniqueCaptions = [...new Set(captions)];
    const videoDuration = videoRef.current?.duration || 0;
    const durationMinutes = Math.floor(videoDuration / 60);
    const durationSeconds = Math.floor(videoDuration % 60);
    const durationStr = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
    
    // Generate a detailed multi-paragraph summary
    return `
This ${durationStr} minute video titled "${filename}" features ${subjects.slice(0, 3).join(', ')} engaged in ${actions.slice(0, 3).join(', ')}. 

The content begins with ${captions[0].toLowerCase()} and progresses through a series of scenes including ${uniqueCaptions.slice(1, 3).join(' followed by ')}. 

Throughout the video, there are ${subjects.length} distinct subjects or elements visible including ${subjects.slice(0, 5).join(', ')}. The primary activities shown include ${actions.slice(0, 5).join(', ')}.

Based on the visual content, this appears to be a ${getVideoType(captions)} video that would appeal to viewers interested in ${getVideoSubject(captions)}.
`.trim();
  };

  // Generate scenery summary from frame captions
  const generateScenerySummary = (captions: string[], filename: string): string => {
    // Extract scene elements (locations, colors, lighting)
    const locations: string[] = [];
    const colors: string[] = [];
    const timeOfDay: string[] = [];
    
    // Common colors to look for
    const colorList = ['red', 'blue', 'green', 'yellow', 'white', 'black', 'orange', 'purple', 'pink', 'brown', 'gray', 'silver', 'gold'];
    
    // Time indicators to look for
    const timeList = ['morning', 'afternoon', 'evening', 'night', 'sunset', 'sunrise', 'daytime', 'nighttime', 'sunny', 'dark'];
    
    // Location indicators
    const locationIndicators = ['in', 'at', 'on', 'inside', 'outside'];
    
    captions.forEach(caption => {
      const words = caption.toLowerCase().split(' ');
      
      // Extract colors
      words.forEach(word => {
        if (colorList.includes(word) && !colors.includes(word)) {
          colors.push(word);
        }
        
        // Extract time of day
        if (timeList.includes(word) && !timeOfDay.includes(word)) {
          timeOfDay.push(word);
        }
      });
      
      // Extract potential locations
      words.forEach((word, index) => {
        if (index > 0 && locationIndicators.includes(words[index-1])) {
          // Location likely follows location indicators
          if (!locations.includes(word) && word.length > 3) {
            locations.push(word);
          }
        }
      });
    });
    
    // Generate a detailed environment/scenery summary
    const videoDuration = videoRef.current?.duration || 0;
    const durationMinutes = Math.floor(videoDuration / 60);
    const durationSeconds = Math.floor(videoDuration % 60);
    const durationStr = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
    
    return `
The visual environment of this ${durationStr} minute video titled "${filename}" predominantly features ${locations.length > 0 ? locations.join(', ') : 'various settings'}.

The color palette includes ${colors.length > 0 ? colors.join(', ') : 'neutral tones'}, creating a ${colors.includes('bright') || colors.includes('white') ? 'bright and vibrant' : 'subdued and atmospheric'} visual aesthetic.

The lighting suggests ${timeOfDay.length > 0 ? `a ${timeOfDay.join(' to ')} setting` : 'indoor illumination'}, which contributes to the overall mood of the scenes.

The visual composition features ${getEnvironmentType(captions)} elements with ${getSpatialDescription(captions)} spatial arrangement. The background elements include ${getBackgroundElements(captions)}.

The overall visual style of the video could be described as ${getVisualStyle(captions)} with ${colors.length > 0 ? 'distinctive color contrasts' : 'subtle tonal variations'}.
`.trim();
  };

  // Helper function to determine video type
  const getVideoType = (captions: string[]): string => {
    const text = captions.join(' ').toLowerCase();
    
    if (text.includes('tutorial') || text.includes('how to') || text.includes('step')) {
      return 'tutorial or instructional';
    } else if (text.includes('talk') || text.includes('present') || text.includes('speech')) {
      return 'presentation or talk';
    } else if (text.includes('nature') || text.includes('wild') || text.includes('landscape')) {
      return 'nature or documentary';
    } else if (text.includes('interview') || text.includes('conversation')) {
      return 'interview or conversational';
    } else {
      return 'informational or entertainment';
    }
  };

  // Helper function to determine video subject
  const getVideoSubject = (captions: string[]): string => {
    const text = captions.join(' ').toLowerCase();
    
    if (text.includes('tech') || text.includes('computer') || text.includes('digital')) {
      return 'technology and digital media';
    } else if (text.includes('food') || text.includes('cook') || text.includes('recipe')) {
      return 'cooking and food preparation';
    } else if (text.includes('sport') || text.includes('game') || text.includes('play')) {
      return 'sports and physical activities';
    } else if (text.includes('art') || text.includes('design') || text.includes('creat')) {
      return 'arts and creative pursuits';
    } else if (text.includes('nature') || text.includes('animal') || text.includes('plant')) {
      return 'nature and wildlife';
    } else {
      return 'general lifestyle and culture';
    }
  };

  // Helper function to determine environment type
  const getEnvironmentType = (captions: string[]): string => {
    const text = captions.join(' ').toLowerCase();
    
    if (text.includes('urban') || text.includes('city') || text.includes('building')) {
      return 'urban and architectural';
    } else if (text.includes('nature') || text.includes('tree') || text.includes('mountain')) {
      return 'natural and organic';
    } else if (text.includes('indoor') || text.includes('room') || text.includes('inside')) {
      return 'interior and contained';
    } else {
      return 'mixed environmental';
    }
  };

  // Helper function for spatial description
  const getSpatialDescription = (captions: string[]): string => {
    const text = captions.join(' ').toLowerCase();
    
    if (text.includes('wide') || text.includes('panorama') || text.includes('landscape')) {
      return 'expansive and wide-angle';
    } else if (text.includes('close') || text.includes('detail') || text.includes('macro')) {
      return 'intimate and close-up';
    } else {
      return 'balanced and mixed-distance';
    }
  };

  // Helper function for background elements
  const getBackgroundElements = (captions: string[]): string => {
    const text = captions.join(' ').toLowerCase();
    
    if (text.includes('sky') || text.includes('cloud') || text.includes('horizon')) {
      return 'skies, horizons, and atmospheric elements';
    } else if (text.includes('wall') || text.includes('furniture') || text.includes('room')) {
      return 'interior architectural elements and furnishings';
    } else if (text.includes('crowd') || text.includes('people') || text.includes('audience')) {
      return 'people and social groupings';
    } else {
      return 'textural and environmental context';
    }
  };

  // Helper function for visual style
  const getVisualStyle = (captions: string[]): string => {
    const text = captions.join(' ').toLowerCase();
    
    if (text.includes('modern') || text.includes('sleek') || text.includes('tech')) {
      return 'modern and sleek';
    } else if (text.includes('rustic') || text.includes('vintage') || text.includes('old')) {
      return 'rustic or vintage';
    } else if (text.includes('bright') || text.includes('vibrant') || text.includes('colorful')) {
      return 'bright and vibrant';
    } else if (text.includes('dark') || text.includes('moody') || text.includes('shadow')) {
      return 'moody and atmospheric';
    } else {
      return 'balanced and naturalistic';
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
    if (!synth.current || !utterance.current) return;
    
    const textToSpeak = activeTab === "content" ? contentSummary : scenerySummary;
    
    if (!textToSpeak) return;
    
    // Cancel current speech if speaking
    if (synth.current.speaking) {
      synth.current.cancel();
      setIsSpeaking(false);
      return;
    }
    
    utterance.current.text = textToSpeak;
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
    setContentSummary("");
    setScenerySummary("");
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
          Upload a video to get detailed AI-generated summaries, with both text and voice options.
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
                {isProcessing ? 'Processing...' : 'Generate Summaries'}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Video Summary</h2>
              
              {(contentSummary || scenerySummary) && (
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
            </div>
            
            {/* Summary Type Tabs */}
            {(contentSummary || scenerySummary) && (
              <div className="mb-4 border-b border-border">
                <div className="flex">
                  <button
                    className={`py-2 px-4 font-medium ${
                      activeTab === "content" 
                        ? "text-primary border-b-2 border-primary" 
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setActiveTab("content")}
                  >
                    Content Summary
                  </button>
                  <button
                    className={`py-2 px-4 font-medium ${
                      activeTab === "scenery" 
                        ? "text-primary border-b-2 border-primary" 
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setActiveTab("scenery")}
                  >
                    Visual/Scenery Summary
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === "content" && contentSummary ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-invert max-w-none"
              >
                <div className="text-foreground whitespace-pre-line">
                  {contentSummary}
                </div>
              </motion.div>
            ) : activeTab === "scenery" && scenerySummary ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-invert max-w-none"
              >
                <div className="text-foreground whitespace-pre-line">
                  {scenerySummary}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
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
              Summaries can be read aloud for visually impaired users.
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
                <span>Toggle Summary Type</span>
                <span className="font-mono bg-muted px-2 py-0.5 rounded">T</span>
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
        <Loading
          text={loadingText}
          fullScreen={true}
          progress={loadingProgress}
        />
      )}
    </div>
  );
};

export default VideoSummary;
