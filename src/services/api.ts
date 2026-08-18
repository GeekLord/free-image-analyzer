import axios from 'axios';
import { NSFWAnalysis, ImageSource } from '../types';

const SIGHTENGINE_USER = import.meta.env.VITE_SIGHTENGINE_USER || '';
const SIGHTENGINE_SECRET = import.meta.env.VITE_SIGHTENGINE_SECRET || '';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const GOOGLE_CX = import.meta.env.VITE_GOOGLE_CX || '';

export interface SearchResponse {
  sources: ImageSource[];
  error?: string;
  isApiKeyMissingOrExpired?: boolean;
}

export async function analyzeImage(file: File): Promise<NSFWAnalysis> {
  if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) {
    throw new Error(
      'SightEngine API credentials are not configured. Set VITE_SIGHTENGINE_USER and VITE_SIGHTENGINE_SECRET in your environment.'
    );
  }

  const formData = new FormData();
  formData.append('media', file);
  formData.append('models', 'nudity,offensive,gore');

  try {
    const response = await axios.post(
      `https://api.sightengine.com/1.0/check.json?api_user=${SIGHTENGINE_USER}&api_secret=${SIGHTENGINE_SECRET}`,
      formData
    );

    const { nudity, offensive, gore } = response.data;
    const nudityScore = Math.max(nudity?.raw ?? 0, nudity?.partial ?? 0);
    const suggestiveScore = offensive?.suggestive ?? 0;
    const violenceScore = gore?.prob ?? 0;

    const isNSFW = nudityScore > 0.4 || suggestiveScore > 0.6 || violenceScore > 0.5;
    const confidence = Math.max(nudityScore, suggestiveScore, violenceScore);

    return {
      isNSFW,
      confidence,
      details: {
        nudity: nudityScore,
        suggestive: suggestiveScore,
        violence: violenceScore,
      },
    };
  } catch (error) {
    console.error('Error analyzing image with SightEngine:', error);
    throw error;
  }
}

export async function findImageSources(query: string): Promise<SearchResponse> {
  if (!query || !query.trim()) {
    return { sources: [] };
  }

  // If no custom Google API key is configured or default key is empty/expired
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    return {
      sources: [],
      isApiKeyMissingOrExpired: true,
      error: 'Google Custom Search API key is not configured or has expired.',
    };
  }

  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CX,
        searchType: 'image',
        q: query.trim(),
      },
    });

    if (!response.data?.items) {
      return { sources: [] };
    }

    const sources: ImageSource[] = response.data.items.map(
      (item: { image?: { thumbnailLink?: string }; link?: string; title?: string }) => ({
        thumbnail: item.image?.thumbnailLink || item.link || '',
        url: item.link || '',
        title: item.title || 'Matching Image Source',
      })
    );

    return { sources };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
    const message = err.response?.data?.error?.message || err.message || 'Error querying search API';
    const isExpired = message.toLowerCase().includes('expired') || message.toLowerCase().includes('key');

    console.warn('Google Custom Search API notice:', message);
    return {
      sources: [],
      error: message,
      isApiKeyMissingOrExpired: isExpired,
    };
  }
}
