import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultGallery } from './components/ResultGallery';
import { generateProductImages } from './services/geminiService';
import { GeneratedImage, GenerationStatus, Language } from './types';
import { translations } from './translations';

const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>('uk');
  const [sourceImage, setSourceImage] = useState<{ base64: string, mimeType: string } | null>(null);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  const t = translations[currentLang];

  const handleImageSelected = useCallback((base64: string, mimeType: string) => {
    setSourceImage({ base64, mimeType });
    setResults([]);
    setError(null);
    setStatus(GenerationStatus.IDLE);
    setIsUnlocked(false); // Reset unlock status on new image selection
  }, []);

  const handleGenerate = async () => {
    if (!sourceImage) return;

    setStatus(GenerationStatus.LOADING);
    setError(null);
    setIsUnlocked(false); // Reset unlock status on new generation

    try {
      // Pass the current language to the service
      const generatedImages = await generateProductImages(sourceImage.base64, sourceImage.mimeType, currentLang);
      
      if (generatedImages.length === 0) {
        setError(t.errorNoImage);
        setStatus(GenerationStatus.ERROR);
      } else {
        setResults(generatedImages);
        setStatus(GenerationStatus.SUCCESS);
      }
    } catch (err) {
      console.error(err);
      setError(t.errorGeneric);
      setStatus(GenerationStatus.ERROR);
    }
  };

  const LanguageSelector = () => (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      {(['uk', 'en', 'ru'] as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setCurrentLang(lang)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
            currentLang === lang 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              AI
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">{t.headerTitle}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <div className="text-sm text-gray-500 hidden md:block">
              Powered by Gemini 2.5 Flash
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {t.heroTitle}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.heroSubtitle}
          </p>
        </div>

        {/* Upload Section */}
        <ImageUploader 
          onImageSelected={handleImageSelected} 
          isLoading={status === GenerationStatus.LOADING}
          t={t}
        />

        {/* Generate Button (Initial) */}
        {sourceImage && status !== GenerationStatus.SUCCESS && (
          <div className="flex justify-center mb-12">
            <button
              onClick={handleGenerate}
              disabled={status === GenerationStatus.LOADING}
              className={`
                relative px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300
                ${status === GenerationStatus.LOADING 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 ring-4 ring-indigo-50'}
              `}
            >
              {status === GenerationStatus.LOADING ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.generatingBtn}
                </span>
              ) : (
                t.generateBtn
              )}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             {error}
          </div>
        )}

        {/* Results */}
        {status === GenerationStatus.SUCCESS && (
          <div className="flex flex-col items-center">
            <ResultGallery 
              images={results} 
              t={t} 
              isUnlocked={isUnlocked} 
              onUnlock={() => setIsUnlocked(true)} 
            />
            
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
               <p className="text-gray-500 text-sm">{t.retryTitle}</p>
               <button
                  onClick={handleGenerate}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-full shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t.retryBtn}
               </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;