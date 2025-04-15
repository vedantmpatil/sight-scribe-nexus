# VisionAI Assistant

A fully client-side web application with a strong focus on accessibility, performance, and modern UX. All features run entirely in the browser, with no backend or internet connection required after initial load.

## Features

### 1. Image Search by Natural Language Query
- Upload images from your device
- Process them locally using browser AI
- Search using natural language (e.g., "red car in sand")
- Results are sorted by similarity to your query

### 2. Live Video Captioning
- Real-time descriptions of webcam feed
- Text display and voice output for accessibility
- Multiple camera support
- Designed for both sighted and blind users

### 3. Video Summarizer
- Upload any video file
- Get a concise, human-like summary
- Available as text and spoken output
- Works efficiently on videos up to 5 minutes

## Technical Stack

This project is built with:
- Vite
- TypeScript
- React
- Tailwind CSS
- shadcn-ui
- Framer Motion for animations
- Hugging Face Transformers.js for AI processing
- Web Speech API for text-to-speech

## Privacy First Approach

- **100% Client-Side**: No server communication, all processing happens in your browser
- **Data Never Leaves Your Device**: Your images and videos stay local
- **Works Offline**: After initial load, no internet connection needed

## Getting Started

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Accessibility Features

- Voice output for all AI-generated content
- High contrast UI elements
- Keyboard shortcuts for common operations
- Screen reader compatible interface
- Responsive design for all devices

## Browser Compatibility

This application uses modern web technologies and works best in:
- Chrome 89+
- Firefox 90+
- Safari 15+
- Edge 89+

Mobile browsers are also supported, though performance may vary depending on device capabilities.

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues to improve the application.

## License

This project is open source and available under the MIT license.
