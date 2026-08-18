import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  ExternalLink,
  AlertTriangle,
  Globe,
  Compass,
  FileText,
  Info,
  RefreshCw,
} from 'lucide-react';
import { NSFWAnalysis, ImageSource, ImageDetails } from '../types';
import { findImageSources } from '../services/api';

interface AnalysisResultsProps {
  imageUrl: string;
  imageDetails: ImageDetails | null;
  nsfw: NSFWAnalysis | null;
  isLoading: boolean;
}

export function AnalysisResults({
  imageUrl,
  imageDetails,
  nsfw,
  isLoading,
}: AnalysisResultsProps) {
  const [sources, setSources] = useState<ImageSource[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  // Initialize search query from filename when a new image is selected
  useEffect(() => {
    if (imageDetails?.name) {
      const cleanName = imageDetails.name
        .replace(/\.[^/.]+$/, '') // remove extension
        .replace(/[-_]/g, ' ') // replace dashes/underscores with spaces
        .trim();
      setSearchQuery(cleanName || 'image');
    }
  }, [imageDetails?.name]);

  // Execute web source search
  const performSearch = async (query: string) => {
    if (!query) return;
    setLoadingSources(true);
    setApiNotice(null);

    try {
      const res = await findImageSources(query);
      setSources(res.sources);
      if (res.isApiKeyMissingOrExpired || res.error) {
        setApiNotice(
          res.error ||
            'Google Custom Search API requires a valid API key in environment variables (VITE_GOOGLE_API_KEY & VITE_GOOGLE_CX).'
        );
      }
    } catch (err) {
      console.error('Failed to search image sources:', err);
      setSources([]);
    } finally {
      setLoadingSources(false);
    }
  };

  useEffect(() => {
    if (imageUrl && !isLoading && searchQuery) {
      performSearch(searchQuery);
    }
  }, [imageUrl, isLoading, searchQuery]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  if (!imageUrl || isLoading) {
    return null;
  }

  // Generate external reverse image search links
  const reverseSearchEngines = [
    {
      name: 'Google Lens',
      url: `https://lens.google.com/`,
      description: 'Search visual matches and similar images across Google',
      iconColor: 'text-red-500 dark:text-red-400',
    },
    {
      name: 'Bing Visual Search',
      url: `https://www.bing.com/visualsearch`,
      description: 'Find where this image appears and related items on Bing',
      iconColor: 'text-blue-500 dark:text-blue-400',
    },
    {
      name: 'TinEye Reverse Search',
      url: `https://tineye.com/search`,
      description: 'Find exact image source occurrences, duplicates & modifications',
      iconColor: 'text-purple-500 dark:text-purple-400',
    },
    {
      name: 'Yandex Images',
      url: `https://yandex.com/images/`,
      description: 'Deep visual facial & scenery recognition search',
      iconColor: 'text-amber-500 dark:text-amber-400',
    },
  ];

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-dark-border transition-colors">
        {/* Preview image */}
        <div className="relative bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-dark-border flex items-center justify-center p-4">
          <img
            src={imageUrl}
            alt="Analyzed Preview"
            className="max-h-80 w-auto object-contain rounded-lg shadow-sm"
          />
        </div>

        <div className="p-6 space-y-6">
          {/* File Metadata Overview */}
          {imageDetails && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl text-xs border border-gray-100 dark:border-gray-700/50">
              <div>
                <span className="text-gray-500 dark:text-gray-400 block font-medium">File Name</span>
                <span className="text-gray-900 dark:text-gray-200 font-mono font-semibold truncate block" title={imageDetails.name}>
                  {imageDetails.name}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block font-medium">File Size</span>
                <span className="text-gray-900 dark:text-gray-200 font-semibold">{imageDetails.size}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block font-medium">Dimensions</span>
                <span className="text-gray-900 dark:text-gray-200 font-semibold">
                  {imageDetails.width && imageDetails.height ? `${imageDetails.width} × ${imageDetails.height} px` : 'Detecting...'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block font-medium">Aspect Ratio</span>
                <span className="text-gray-900 dark:text-gray-200 font-semibold">{imageDetails.aspectRatio || 'N/A'}</span>
              </div>
            </div>
          )}

          {/* Content Safety Section */}
          <div className="flex items-start gap-3">
            {nsfw?.isNSFW ? (
              <ShieldAlert className="w-6 h-6 flex-shrink-0 text-red-500 mt-0.5" />
            ) : (
              <ShieldCheck className="w-6 h-6 flex-shrink-0 text-green-500 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                Content Safety Analysis
              </h3>
              <p
                className={`text-sm ${
                  nsfw?.isNSFW
                    ? 'text-red-600 dark:text-red-400 font-medium'
                    : 'text-green-600 dark:text-green-400 font-medium'
                }`}
              >
                {nsfw?.isNSFW
                  ? `NSFW Content Detected (${(nsfw.confidence * 100).toFixed(1)}% confidence)`
                  : 'Safe Content'}
              </p>

              {nsfw && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center text-sm">
                    <span className="w-24 text-gray-600 dark:text-gray-300 font-medium">Nudity:</span>
                    <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, nsfw.details.nudity * 100))}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-mono text-gray-700 dark:text-gray-300 font-semibold">
                      {(nsfw.details.nudity * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <span className="w-24 text-gray-600 dark:text-gray-300 font-medium">Suggestive:</span>
                    <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, nsfw.details.suggestive * 100))}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-mono text-gray-700 dark:text-gray-300 font-semibold">
                      {(nsfw.details.suggestive * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <span className="w-24 text-gray-600 dark:text-gray-300 font-medium">Violence:</span>
                    <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, nsfw.details.violence * 100))}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-mono text-gray-700 dark:text-gray-300 font-semibold">
                      {(nsfw.details.violence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* NSFW Alert Banner */}
          {nsfw?.isNSFW && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-400">
                <p className="font-semibold mb-1">Content Warning</p>
                <p>
                  This image has been flagged as potentially inappropriate content. Please review and ensure it complies with your intended safety policies.
                </p>
              </div>
            </div>
          )}

          {/* Reverse Image Search Engines (1-Click Lookup) */}
          <div className="border-t border-gray-200 dark:border-dark-border pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Compass className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                    Reverse Image Search Engines
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Lookup matching visual sources, origins, and duplicates on major search engines
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reverseSearchEngines.map((engine) => (
                <a
                  key={engine.name}
                  href={engine.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe className={`w-5 h-5 flex-shrink-0 ${engine.iconColor}`} />
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {engine.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {engine.description}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>

          {/* Web Sources Discovery & Keywords Search */}
          <div className="border-t border-gray-200 dark:border-dark-border pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                    Matching Web Sources
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Discovered web pages and matching image instances
                  </p>
                </div>
              </div>

              {/* Keyword Search Bar */}
              <form onSubmit={handleManualSearch} className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search keywords..."
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={loadingSources}
                  className="p-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh search"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingSources ? 'animate-spin' : ''}`} />
                </button>
              </form>
            </div>

            {/* API Key Notice */}
            {apiNotice && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Direct Search Engine Integration Active</p>
                  <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                    Use the 1-click <strong>Reverse Image Search Engines</strong> above (Google Lens, Bing, TinEye) for live instant lookups, or add your custom <code className="bg-amber-100 dark:bg-amber-950 px-1 py-0.5 rounded font-mono">VITE_GOOGLE_API_KEY</code> in Netlify settings.
                  </p>
                </div>
              </div>
            )}

            {/* Results List */}
            {loadingSources ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
                    <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sources.length > 0 ? (
              <div className="space-y-2.5">
                {sources.map((source, index) => (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                  >
                    <img
                      src={source.thumbnail}
                      alt={source.title}
                      className="w-14 h-14 object-cover rounded-lg bg-gray-100 dark:bg-gray-900 flex-shrink-0 border border-gray-200 dark:border-gray-700"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {source.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {source.url}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  Ready to search across the web
                </p>
                <p className="text-xs mt-1">
                  Click on any reverse search engine above or customize search keywords to discover matching web sources.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
