
import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { motion } from "framer-motion";
import Loading from "@/components/ui/loading";
import { pipeline } from "@huggingface/transformers";

const ImageSearch: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<{ file: File; url: string; similarity: number; keywords: string[] }[]>([]);
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [model, setModel] = useState<any>(null);
  const [imageEmbeddings, setImageEmbeddings] = useState<{url: string, embedding: number[], keywords: string[]}[]>([]);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingText, setLoadingText] = useState<string>("Loading AI models...");
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
    setImageEmbeddings([]);
  };

  // Load AI model
  const loadModel = async () => {
    setIsProcessing(true);
    setLoadingText("Loading image understanding models...");
    
    try {
      // Load the CLIP model for image-to-text embedding
      const visionModel = await pipeline(
        "image-to-text", 
        "Xenova/vit-gpt2-image-captioning",
        { progress_callback: (progress) => {
          setLoadingProgress(progress.progress * 100);
        }}
      );
      
      setModel(visionModel);
      setIsModelLoaded(true);
    } catch (error) {
      console.error("Error loading model:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process images with AI
  const processImages = async () => {
    if (selectedImages.length === 0 || !model) return;
    
    setIsProcessing(true);
    setLoadingText("Processing images...");
    
    try {
      const embeddings = [];
      
      for (let i = 0; i < imageURLs.length; i++) {
        setLoadingProgress((i / imageURLs.length) * 100);
        
        // Generate captions for each image
        const captionResult = await model(imageURLs[i]);
        const caption = Array.isArray(captionResult) 
          ? captionResult.map((r: any) => r.generated_text).join(". ")
          : captionResult.generated_text;
        
        // Extract keywords from the caption
        const keywords = extractKeywords(caption);
        
        embeddings.push({
          url: imageURLs[i],
          embedding: [], // We'll use keywords instead of vector embeddings for simplicity
          keywords: keywords
        });
      }
      
      setImageEmbeddings(embeddings);
      
      // Initialize search results with all processed images
      const initialResults = selectedImages.map((file, index) => ({
        file,
        url: imageURLs[index],
        similarity: 1, // Default similarity
        keywords: embeddings[index].keywords
      }));
      
      setSearchResults(initialResults);
    } catch (error) {
      console.error("Error processing images:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Extract keywords from a text string (caption)
  const extractKeywords = (text: string): string[] => {
    // Convert to lowercase and remove punctuation
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, "");
    
    // Split by spaces
    const words = cleanText.split(/\s+/);
    
    // Filter out common stop words and short words
    const stopWords = new Set([
      "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", 
      "in", "on", "at", "to", "for", "with", "by", "about", "of", "this", 
      "that", "these", "those", "it", "its", "they", "them", "their"
    ]);
    
    const keywords = words.filter(word => 
      word.length > 2 && !stopWords.has(word)
    );
    
    return [...new Set(keywords)]; // Remove duplicates
  };

  // Search through processed images
  const searchImages = () => {
    if (!searchQuery.trim() || selectedImages.length === 0 || !isModelLoaded || imageEmbeddings.length === 0) return;
    
    // Extract search keywords
    const searchKeywords = extractKeywords(searchQuery);
    
    if (searchKeywords.length === 0) {
      // If no valid keywords, show all images
      const allResults = selectedImages.map((file, index) => ({
        file,
        url: imageURLs[index],
        similarity: 1,
        keywords: imageEmbeddings[index].keywords
      }));
      
      setSearchResults(allResults);
      return;
    }
    
    // Match images based on keyword overlap
    const results = imageEmbeddings.map((embedding, index) => {
      // Count how many keywords match
      const matchingKeywords = searchKeywords.filter(keyword => 
        embedding.keywords.some(imgKeyword => 
          imgKeyword.includes(keyword) || keyword.includes(imgKeyword)
        )
      );
      
      const similarity = matchingKeywords.length / searchKeywords.length;
      
      return {
        file: selectedImages[index],
        url: embedding.url,
        similarity: similarity,
        keywords: embedding.keywords
      };
    });
    
    // Filter to include only images with at least one keyword match
    const filteredResults = results.filter(result => result.similarity > 0);
    
    // Sort by similarity score (descending)
    const sortedResults = filteredResults.sort((a, b) => b.similarity - a.similarity);
    
    setSearchResults(sortedResults.length > 0 ? sortedResults : results);
  };

  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      imageURLs.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageURLs]);

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
            onClick={isModelLoaded ? processImages : loadModel}
            disabled={selectedImages.length === 0 || isProcessing}
          >
            {isProcessing ? 'Processing...' : isModelLoaded ? 'Process Images' : 'Load AI Model'}
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
      {isModelLoaded && imageEmbeddings.length > 0 && (
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
              placeholder="Enter keywords like 'dog park sunny' or 'beach sunset'"
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
                  <div className="text-xs mt-1 truncate">
                    {result.keywords.slice(0, 3).join(", ")}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Model Loading Status */}
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

export default ImageSearch;
