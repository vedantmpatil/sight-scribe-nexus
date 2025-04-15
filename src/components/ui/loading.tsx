
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingProps {
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  text = "Loading AI models...",
  className,
  fullScreen = false,
}) => {
  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center p-6",
      fullScreen ? "fixed inset-0 bg-background/80 z-50" : "",
      className
    )}>
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">{text}</h3>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: "100%",
              transition: { duration: 2, repeat: Infinity }
            }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Processing locally, no data leaves your device.
        </p>
      </div>
    </div>
  );

  return content;
};

export default Loading;
