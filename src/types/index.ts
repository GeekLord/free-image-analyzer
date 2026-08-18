export interface NSFWAnalysis {
  isNSFW: boolean;
  confidence: number;
  details: {
    nudity: number;
    suggestive: number;
    violence: number;
  };
}

export interface ImageSource {
  thumbnail: string;
  url: string;
  title: string;
}

export interface ImageDetails {
  name: string;
  size: string;
  type: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
