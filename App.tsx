import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultGallery } from './components/ResultGallery';
import { generateProductImages, regenerateSingleImage, generateReviewImages } from './services/geminiService';
import { GeneratedImage, GenerationStatus, Language, ReviewSettings } from './types';
import { translations } from './translations';

const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>('uk');
  const [sourceImage, setSourceImage] = useState<{ base64: string, mimeType: string } | null>(null);
  
  // Image Generation State
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Review Generation State
  const [reviewStatus, setReviewStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [reviewResults, setReviewResults] = useState<GeneratedImage[]>([]);
  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>({
    gender: 'female',
    age: '20-30',
  });

  const t = translations[currentLang];

  const handleImageSelected = useCallback((base64: string, mimeType: string) => {
    setSourceImage({ base64, mimeType });
    setResults([]);
    setError(null);
    setStatus(GenerationStatus.IDLE);
    setReviewStatus(GenerationStatus.IDLE);
    setReviewResults([]);
  }, []);

  const handleGenerate = async () => {
    if (!sourceImage) return;

    setStatus(GenerationStatus.LOADING);
    setError(null);

    try {
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

  const handleRegenerateSingle = async (id: string, type: string, feedback: string) => {
    if (!sourceImage) return;

    try {
      const newImageUrl = await regenerateSingleImage(
        sourceImage.base64,
        sourceImage.mimeType,
        type,
        feedback,
        currentLang
      );

      if (newImageUrl) {
        // Check if it's a review image or standard image
        const isReview = type === 'review';
        if (isReview) {
          setReviewResults(prev => prev.map(img => img.id === id ? { ...img, url: newImageUrl, id: `${img.id}-regen` } : img));
        } else {
          setResults(prevResults => prevResults.map(img => img.id === id ? { ...img, url: newImageUrl, id: `${img.id}-regen` } : img));
        }
      }
    } catch (e) {
      console.error("Single regeneration failed", e);
      throw e; // Let the component handle the error display
    }
  };

  const handleGenerateReviews = async () => {
    if (!sourceImage) return;
    setReviewStatus(GenerationStatus.LOADING);
    
    try {
      const images = await generateReviewImages(sourceImage.base64, sourceImage.mimeType, reviewSettings, currentLang);
      setReviewResults(images);
      setReviewStatus(GenerationStatus.SUCCESS);
    } catch (e) {
      console.error(e);
      setReviewStatus(GenerationStatus.ERROR);
    }
  };

  const LanguageSelector = () => (
    <div className="flex space-x-1 bg-white/50 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-sm">
      {(['uk', 'en', 'ru'] as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setCurrentLang(lang)}
          className={`px-3 py-1 rounded-full text-sm font-bold transition-all duration-300 ${
            currentLang === lang 
              ? 'bg-white text-violet-600 shadow-md transform scale-105' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-20 selection:bg-violet-200 selection:text-violet-900">
      
      {/* Decorative background blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200/30 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-200/30 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/30 transform group-hover:rotate-12 transition-transform duration-300">
              AI
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-indigo-700 tracking-tight hidden sm:block">
              {t.headerTitle}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-10">
        <div className="text-center mb-16 animate-fadeIn">
          <span className="inline-block py-1 px-3 rounded-full bg-violet-100/50 border border-violet-200 text-violet-700 text-sm font-bold mb-4 tracking-wide uppercase">
            Gemini 2.5 Flash Powered
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            {t.heroTitle.split(' ').map((word, i) => (
              <span key={i} className={i > 1 ? "text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600" : ""}>
                {word}{' '}
              </span>
            ))}
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            {t.heroSubtitle}
          </p>
        </div>

        {/* Upload Section */}
        <ImageUploader 
          onImageSelected={handleImageSelected} 
          isLoading={status === GenerationStatus.LOADING}
          t={t}
        />

        {/* Generate Images Button */}
        {sourceImage && status !== GenerationStatus.SUCCESS && (
          <div className="flex justify-center mb-16">
            <button
              onClick={handleGenerate}
              disabled={status === GenerationStatus.LOADING}
              className={`
                relative group px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-violet-500/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300
                ${status === GenerationStatus.LOADING 
                  ? 'bg-slate-400 text-white cursor-not-allowed' 
                  : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_auto] hover:bg-right text-white'}
              `}
            >
              <div className="absolute inset-0 rounded-full ring-4 ring-white/30 group-hover:ring-white/50 transition-all" />
              {status === GenerationStatus.LOADING ? (
                <span className="flex items-center space-x-3">
                  <svg className="animate-spin -ml-1 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t.generatingBtn}</span>
                </span>
              ) : (
                <span className="flex items-center">
                  {t.generateBtn}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-10 p-6 bg-red-50/80 border border-red-200 rounded-2xl shadow-lg flex items-center text-red-700 backdrop-blur-sm animate-shake">
             <div className="p-3 bg-red-100 rounded-full mr-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Results */}
        {status === GenerationStatus.SUCCESS && (
          <div className="flex flex-col items-center w-full">
            <ResultGallery 
              images={results} 
              t={t} 
              onRegenerateSingle={handleRegenerateSingle}
            />
            
            {/* Reviews Generator Section */}
            <div className="w-full max-w-6xl mx-auto mt-20 mb-20 px-4 animate-fadeIn">
               <div className="flex items-center justify-center mb-10">
                  <div className="h-px w-20 bg-gradient-to-r from-transparent to-pink-300"></div>
                  <h2 className="text-3xl font-black text-slate-800 mx-6 text-center tracking-tight">{t.reviews.title}</h2>
                  <div className="h-px w-20 bg-gradient-to-l from-transparent to-pink-300"></div>
               </div>
               
               <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">{t.reviews.subtitle}</p>

               <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 mb-10 max-w-3xl mx-auto">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                       <label className="block text-sm font-bold text-slate-700 mb-2">{t.reviews.gender}</label>
                       <select 
                         className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
                         value={reviewSettings.gender}
                         onChange={(e) => setReviewSettings({...reviewSettings, gender: e.target.value as any})}
                       >
                          <option value="female">{t.reviews.options.female}</option>
                          <option value="male">{t.reviews.options.male}</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-slate-700 mb-2">{t.reviews.age}</label>
                       <select 
                         className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
                         value={reviewSettings.age}
                         onChange={(e) => setReviewSettings({...reviewSettings, age: e.target.value as any})}
                       >
                          <option value="20-30">{t.reviews.options.age20_30}</option>
                          <option value="30-40">{t.reviews.options.age30_40}</option>
                          <option value="40-50">{t.reviews.options.age40_50}</option>
                          <option value="50+">{t.reviews.options.age50_plus}</option>
                       </select>
                    </div>
                 </div>
                 
                 <div className="flex justify-center">
                    <button
                      onClick={handleGenerateReviews}
                      disabled={reviewStatus === GenerationStatus.LOADING}
                      className={`
                        px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-pink-500/30 hover:-translate-y-1 transition-all duration-300 flex items-center
                        ${reviewStatus === GenerationStatus.LOADING
                          ? 'bg-slate-300 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'}
                      `}
                    >
                       {reviewStatus === GenerationStatus.LOADING ? (
                         <>
                           <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                           {t.generatingBtn}
                         </>
                       ) : (
                         t.reviews.generateBtn
                       )}
                    </button>
                 </div>
               </div>

               {reviewResults.length > 0 && (
                 <ResultGallery 
                    images={reviewResults} 
                    t={t} 
                    onRegenerateSingle={handleRegenerateSingle}
                 />
               )}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-6">
               <p className="text-slate-500 font-medium">{t.retryTitle}</p>
               <button
                  onClick={handleGenerate}
                  className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-full shadow-lg hover:bg-slate-50 hover:border-violet-300 hover:text-violet-600 transition-all focus:outline-none focus:ring-4 focus:ring-violet-100 flex items-center group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-400 group-hover:text-violet-500 group-hover:rotate-180 transition-all duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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