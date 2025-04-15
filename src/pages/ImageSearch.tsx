
import React, { useState, useRef, ChangeEvent } from "react";
import { motion } from "framer-motion";

const ImageSearch: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<{ file: File; url: string; similarity: number }[]>([]);
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler for file selection
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    setSelectedImages((prev) => [...prev, ...newFiles]);
    
    // Create preview URLs for the images
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setImageURLs((prev) => [...prev, ...newUrls]);
  };

  // Handler for folder selection
  const handleFolderSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    setSelectedImages((prev) => [...prev, ...newFiles]);
    
    // Create preview URLs for the images
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setImageURLs((prev) => [...prev, ...newUrls]);
  };

  // Open file dialog
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Clear selected images
  const clearSelectedImages = () => {
    // Revoke URLs to prevent memory leaks
    imageURLs.forEach(url => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setImageURLs([]);
    setSearchResults([]);
  };

  // Process images with AI
  const processImages = async () => {
    if (selectedImages.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // In a real implementation, we would use the Hugging Face transformers.js
      // library to load a model like CLIP and process the images
      
      // Simulating model loading and processing for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsModelLoaded(true);
      
      // Simulating embedding generation (would be done using HF transformers.js)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, just return all images with random similarity scores
      setSearchResults(
        selectedImages.map((file, index) => ({
          file,
          url: imageURLs[index],
          similarity: Math.random()
        }))
      );
    } catch (error) {
      console.error("Error processing images:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Search through processed images
  const searchImages = () => {
    if (!searchQuery.trim() || selectedImages.length === 0 || !isModelLoaded) return;
    
    // In a real implementation, we would use the query to find most similar images
    // For now, just sort randomly and return top matches
    const sortedResults = [...searchResults].sort((a, b) => b.similarity - a.similarity);
    setSearchResults(sortedResults);
  };

  return (
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Image Search</h1>
        <p className="text-muted-foreground mb-8">
          Select images from your device, process them locally, and search using natural language.
        </p>
      </motion.div>

      {/* Image Selection Area */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm"
            onClick={openFileDialog}
          >
            Select Images
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md shadow-sm"
            onClick={clearSelectedImages}
            disabled={selectedImages.length === 0}
          >
            Clear Selection
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-md shadow-sm"
            onClick={processImages}
            disabled={selectedImages.length === 0 || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Process Images'}
          </motion.button>
        </div>
        
        {/* Hidden file inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          multiple
          className="hidden"
        />
      </div>

      {/* Image Preview Grid */}
      {imageURLs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Selected Images ({imageURLs.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imageURLs.map((url, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative aspect-square rounded-md overflow-hidden bg-muted"
              >
                <img
                  src={url}
                  alt={`Selected image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search Bar - Only show if images are processed */}
      {isModelLoaded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Search Images</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Describe what you're looking for..."
              className="flex-1 px-4 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e) => e.key === 'Enter' && searchImages()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm"
              onClick={searchImages}
              disabled={!searchQuery.trim()}
            >
              Search
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {searchResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative aspect-square rounded-md overflow-hidden bg-muted"
              >
                <img
                  src={result.url}
                  alt={`Result image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-xs">
                  {Math.round(result.similarity * 100)}% match
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Model Loading Status */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-background/80 z-50"
        >
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Processing Images</h3>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-shimmer bg-shimmer bg-[length:200%_100%]"></div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Processing images locally, no data leaves your device.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ImageSearch;
