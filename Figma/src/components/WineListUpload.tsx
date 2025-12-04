import { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Camera, FileText, Check, Sparkles, Zap } from 'lucide-react';
import type { Persona } from '../App';

interface WineListUploadProps {
  persona: Persona;
  onUploadComplete: () => void;
}

export function WineListUpload({ persona, onUploadComplete }: WineListUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload();
    }
  };

  const handleUpload = () => {
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      
      setTimeout(() => {
        onUploadComplete();
      }, 1500);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative overflow-hidden py-16 px-6"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 2 === 0 ? '#d4af37' : '#8b4049',
              opacity: 0.1,
            }}
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl">
        {/* Header with Persona Info */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/50 backdrop-blur-md border border-white/60 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-[#d4af37]" />
            <span className="text-[#6b6b6b]">Selected: <span className="text-[#8b4049]">{persona.name}</span></span>
          </div>
          
          <h1 className="mb-4 text-[#2c2c2c] font-serif">
            Upload Wine List
          </h1>
          <p className="text-[#6b6b6b] max-w-2xl mx-auto">
            Share your restaurant's wine list with us. You can upload a photo, 
            scan a menu, or upload a PDF document.
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative bg-white/40 backdrop-blur-lg border-2 border-dashed rounded-3xl p-16 text-center transition-all ${
              isDragging 
                ? 'border-[#d4af37] bg-[#d4af37]/10 scale-105' 
                : 'border-white/60 hover:border-[#d4af37]/50'
            }`}
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
            }}
          >
            {!isProcessing && !isComplete && (
              <>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-8"
                >
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#8b4049]/20">
                    <Upload className="w-12 h-12 text-[#8b4049]" />
                  </div>
                </motion.div>

                <h3 className="mb-4 text-[#2c2c2c]">
                  Drag & Drop or Click to Upload
                </h3>
                <p className="text-[#6b6b6b] mb-8">
                  Supported formats: JPG, PNG, PDF
                </p>

                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                />
                
                <label htmlFor="file-upload">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-block px-8 py-3 bg-gradient-to-r from-[#8b4049] to-[#6d323a] text-white rounded-full cursor-pointer"
                    style={{
                      boxShadow: '0 10px 30px rgba(139, 64, 73, 0.3)',
                    }}
                  >
                    Browse Files
                  </motion.div>
                </label>
              </>
            )}

            {isProcessing && (
              <div className="py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#8b4049]/20 mb-6"
                >
                  <Zap className="w-12 h-12 text-[#d4af37]" />
                </motion.div>

                <h3 className="mb-4 text-[#2c2c2c]">
                  AI Processing Your Wine List
                </h3>
                <p className="text-[#6b6b6b] mb-6">
                  Analyzing wines and matching to your taste profile...
                </p>

                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 rounded-full bg-[#d4af37]"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {isComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="py-8"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#8b4049]/20 mb-6">
                  <Check className="w-12 h-12 text-[#8b4049]" />
                </div>

                <h3 className="mb-2 text-[#2c2c2c]">
                  Perfect! All Set
                </h3>
                <p className="text-[#6b6b6b]">
                  Preparing your personalized recommendations...
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        {!isProcessing && !isComplete && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              className="flex items-center gap-4 p-6 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-left transition-all hover:shadow-xl"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#8b4049]/20 flex items-center justify-center">
                <Camera className="w-6 h-6 text-[#8b4049]" />
              </div>
              <div>
                <h4 className="mb-1 text-[#2c2c2c]">Take Photo</h4>
                <p className="text-[#6b6b6b]">Capture wine list with camera</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              className="flex items-center gap-4 p-6 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl text-left transition-all hover:shadow-xl"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#8b4049]/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#8b4049]" />
              </div>
              <div>
                <h4 className="mb-1 text-[#2c2c2c]">Use Sample</h4>
                <p className="text-[#6b6b6b]">Try with example wine list</p>
              </div>
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
