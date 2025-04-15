import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import ImageSearch from "./pages/ImageSearch";
import LiveCaptions from "./pages/LiveCaptions";
import VideoSummary from "./pages/VideoSummary";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";

const queryClient = new QueryClient();

// Wrapper component to determine when to apply the layout
const AppRoutes = () => {
  const location = useLocation();
  
  // Only apply the AppLayout to feature pages, not to the home page
  const isFeaturePage = 
    location.pathname !== "/" && 
    location.pathname !== "/not-found";
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      {/* Feature pages with AppLayout */}
      <Route path="/image-search" element={
        <AppLayout>
          <ImageSearch />
        </AppLayout>
      } />
      <Route path="/live-captions" element={
        <AppLayout>
          <LiveCaptions />
        </AppLayout>
      } />
      <Route path="/video-summary" element={
        <AppLayout>
          <VideoSummary />
        </AppLayout>
      } />
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ThemeProvider defaultTheme="dark">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
