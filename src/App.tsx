import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Image as ImageIcon } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResults } from './components/AnalysisResults';
import { analyzeImage } from './services/api';
import { NSFWAnalysis, ImageDetails } from './types';
import toast from 'react-hot-toast';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getImageDimensions(
  url: string
): Promise<{ width: number; height: number; aspectRatio: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(img.naturalWidth, img.naturalHeight);
      const aspect =
        divisor > 0
          ? `${img.naturalWidth / divisor}:${img.naturalHeight / divisor}`
          : `${img.naturalWidth}:${img.naturalHeight}`;

      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: aspect,
      });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0, aspectRatio: 'N/A' });
    };
    img.src = url;
  });
}

export function App() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageDetails, setImageDetails] = useState<ImageDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nsfwAnalysis, setNsfwAnalysis] = useState<NSFWAnalysis | null>(null);

  const handleImageSelect = async (file: File) => {
    setIsLoading(true);
    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);
    setNsfwAnalysis(null);

    // Read dimensions & metadata
    const dimensions = await getImageDimensions(objectUrl);
    setImageDetails({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || 'image',
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: dimensions.aspectRatio,
    });

    try {
      const result = await analyzeImage(file);
      setNsfwAnalysis(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image content safety. Please check your network or API status.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-gray-900 transition-colors py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ThemeToggle />

          <header className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Image Analyzer
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto text-base">
              Upload or paste an image to evaluate content safety metrics and discover matching sources across the web.
            </p>
          </header>

          <main className="space-y-8">
            <ImageUploader onImageSelect={handleImageSelect} />

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <div className="animate-pulse flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animation-delay-200" />
                  <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animation-delay-400" />
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Scanning image safety & preparing search queries...
                </span>
              </div>
            )}

            <AnalysisResults
              imageUrl={imageUrl}
              imageDetails={imageDetails}
              nsfw={nsfwAnalysis}
              isLoading={isLoading}
            />
          </main>
        </div>

        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'dark:bg-dark-card dark:text-white dark:border dark:border-dark-border shadow-lg',
          }}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
