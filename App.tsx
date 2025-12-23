
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultGallery } from './components/ResultGallery';
import { generateCategoryImages, regenerateSingleImage, generateReviewImages } from './services/geminiService';
import { GeneratedImage, GenerationStatus, Language, ReviewSettings, ImageCategory } from './types';
import { translations } from './translations';

const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>('uk');
  const [sourceImage, setSourceImage] = useState<{ base64: string, mimeType: string } | null>(null);
  
  const [allImages, setAllImages] = useState<GeneratedImage[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const t = translations[currentLang];

  const [reviewStatus, setReviewStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>({
    situations: [], // Changed to empty array initially
    reviewLanguage: currentLang,
    age: '30-40',
  });

  const handleImageSelected = useCallback((base64: string, mimeType: string) => {
    setSourceImage({ base64, mimeType });
    setAllImages([]);
    setError(null);
    setLoadingCategories(new Set());
    setReviewStatus(GenerationStatus.IDLE);
  }, []);

  const handleGenerateCategory = async (category: Exclude<ImageCategory, 'review'>) => {
    if (!sourceImage) return;

    setLoadingCategories(prev => new Set(prev).add(category));
    setError(null);

    try {
      const images = await generateCategoryImages(sourceImage.base64, sourceImage.mimeType, category, currentLang);
      
      if (images.length === 0) {
        setError(t.errorNoImage);
      } else {
        setAllImages(prev => {
          const filtered = prev.filter(img => {
             if (category === 'model') return !img.type.startsWith('model');
             if (category === 'flatlay') return !img.type.startsWith('flatlay');
             if (category === 'macro') return !img.type.startsWith('macro');
             if (category === 'mannequin') return !img.type.startsWith('mannequin');
             if (category === 'nature') return !img.type.startsWith('nature');
             return true;
          });
          return [...filtered, ...images];
        });
      }
    } catch (err) {
      console.error(err);
      setError(t.errorGeneric);
    } finally {
      setLoadingCategories(prev => {
        const next = new Set(prev);
        next.delete(category);
        return next;
      });
    }
  };

  const handleRegenerateSingle = async (id: string, type: string, feedback: string) => {
    if (!sourceImage) return;
    
    // Find the image to fix in the state
    const currentImg = allImages.find(img => img.id === id);
    if (!currentImg) return;

    try {
      const newImageUrl = await regenerateSingleImage(
        sourceImage.base64,
        sourceImage.mimeType,
        currentImg.url, // Passing current image URL for consistency
        type,
        feedback,
        currentLang
      );

      if (newImageUrl) {
        setAllImages(prev => prev.map(img => 
          img.id === id 
            ? { ...img, url: newImageUrl, correctionCount: img.correctionCount + 1 } 
            : img
        ));
      }
    } catch (e) {
      console.error("Single regeneration failed", e);
      throw e;
    }
  };

  const toggleSituation = (key: string) => {
    setReviewSettings(prev => {
      const situations = prev.situations.includes(key)
        ? prev.situations.filter(s => s !== key)
        : [...prev.situations, key];
      return { ...prev, situations };
    });
  };

  const handleClearReviewSettings = () => {
    setReviewSettings(prev => ({ ...prev, situations: [] }));
  };

  const handleGenerateReviews = async () => {
    if (!sourceImage || reviewSettings.situations.length === 0) return;
    setReviewStatus(GenerationStatus.LOADING);
    
    try {
      // Map keys to their translated texts
      const situationTexts = reviewSettings.situations.map(key => (t.reviews.situations as any)[key]);
      const settingsForService = { ...reviewSettings, situations: situationTexts };

      const images = await generateReviewImages(sourceImage.base64, sourceImage.mimeType, settingsForService, currentLang);
      setAllImages(prev => {
        const filtered = prev.filter(img => img.type !== 'review');
        return [...filtered, ...images];
      });
      setReviewStatus(GenerationStatus.SUCCESS);
    } catch (e) {
      console.error(e);
      setReviewStatus(GenerationStatus.ERROR);
    } finally {
      setReviewStatus(GenerationStatus.IDLE);
    }
  };

  const LanguageSelector = () => (
    <div className="flex space-x-1 bg-white/50 backdrop-blur-md p-1 rounded-full border border-slate-200 shadow-sm">
      {(['uk', 'en', 'ru'] as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => {
            setCurrentLang(lang);
            setReviewSettings(prev => ({ ...prev, reviewLanguage: lang }));
          }}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
            currentLang === lang 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-500 hover:text-indigo-600'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );

  const categories: Exclude<ImageCategory, 'review'>[] = ['model', 'flatlay', 'macro', 'mannequin', 'nature'];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 selection:bg-indigo-100">
      <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">MS</div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">{t.headerTitle}</h1>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-2">{t.heroTitle}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">{t.heroSubtitle}</p>
        </div>

        <ImageUploader 
          onImageSelected={handleImageSelected} 
          isLoading={loadingCategories.size > 0}
          t={t}
        />

        {sourceImage && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleGenerateCategory(cat)}
                disabled={loadingCategories.has(cat)}
                className={`flex items-center space-x-2 px-6 py-4 rounded-2xl border-2 transition-all font-bold text-sm
                  ${loadingCategories.has(cat) 
                    ? 'bg-slate-100 border-slate-100 cursor-not-allowed text-slate-400' 
                    : 'bg-white border-slate-200 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-md'}
                `}
              >
                <span>{t.gallerySections[cat]}</span>
                {loadingCategories.has(cat) && (
                  <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto mb-10 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 font-medium text-center">
             {error}
          </div>
        )}

        {allImages.length > 0 && (
          <ResultGallery 
            images={allImages} 
            t={t} 
            onRegenerateSingle={handleRegenerateSingle}
          />
        )}

        {sourceImage && (
          <div className="mt-16 max-w-5xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
             <div className="text-center mb-10">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full mb-4 inline-block">UGC Generator</span>
                <h3 className="text-2xl font-black text-slate-800 mb-2">{t.reviews.title}</h3>
                <p className="text-slate-500">{t.reviews.subtitle}</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="md:col-span-2">
                   <div className="flex justify-between items-center mb-4 ml-1">
                      <label className="block text-xs font-black text-slate-400 uppercase">{t.reviews.situation} (виберіть декілька)</label>
                      {reviewSettings.situations.length > 0 && (
                        <button 
                          onClick={handleClearReviewSettings}
                          className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 transition-colors flex items-center space-x-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>{t.reviews.clearBtn}</span>
                        </button>
                      )}
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 h-64 overflow-y-auto p-2 border border-slate-100 rounded-2xl bg-slate-50/50">
                      {Object.keys(t.reviews.situations).map(key => {
                        const isSelected = reviewSettings.situations.includes(key);
                        return (
                          <button
                            key={key}
                            onClick={() => toggleSituation(key)}
                            className={`p-3 text-left text-xs font-bold rounded-xl border transition-all ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                                : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'
                            }`}
                          >
                            {(t.reviews.situations as any)[key]}
                          </button>
                        );
                      })}
                   </div>
                </div>
                
                <div className="space-y-6">
                   <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{t.reviews.age}</label>
                      <select 
                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={reviewSettings.age}
                        onChange={(e) => setReviewSettings({...reviewSettings, age: e.target.value as any})}
                      >
                         <option value="30-40">{t.reviews.options.age30_40}</option>
                         <option value="40-50">{t.reviews.options.age40_50}</option>
                         <option value="50+">{t.reviews.options.age50_plus}</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{t.reviews.reviewLang}</label>
                      <select 
                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={reviewSettings.reviewLanguage}
                        onChange={(e) => setReviewSettings({...reviewSettings, reviewLanguage: e.target.value as any})}
                      >
                         <option value="uk">Українська</option>
                         <option value="en">English</option>
                         <option value="ru">Русский</option>
                      </select>
                   </div>
                </div>
             </div>
             
             <button
               onClick={handleGenerateReviews}
               disabled={reviewStatus === GenerationStatus.LOADING || reviewSettings.situations.length === 0}
               className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black shadow-lg hover:bg-indigo-700 disabled:bg-slate-300 transition-all flex items-center justify-center space-x-3 group"
             >
               {reviewStatus === GenerationStatus.LOADING ? (
                 <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
               ) : (
                 <>
                   <span>{t.reviews.generateBtn} ({reviewSettings.situations.length})</span>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                   </svg>
                 </>
               )}
             </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
