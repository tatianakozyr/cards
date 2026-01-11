
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultGallery } from './components/ResultGallery';
import { generateCategoryImages, regenerateSingleImage, generateReviewImages } from './services/geminiService';
import { GeneratedImage, GenerationStatus, Language, ReviewSettings, ImageCategory } from './types';
import { translations } from './translations';

interface VisualGuideProps {
  t: any;
  onGenerate: (category: Exclude<ImageCategory, 'review'>) => void;
  loadingCategories: Set<string>;
  hasResults: (category: string) => boolean;
  promoSlogan: string;
  setPromoSlogan: (val: string) => void;
}

const VisualGuide: React.FC<VisualGuideProps> = ({ t, onGenerate, loadingCategories, hasResults, promoSlogan, setPromoSlogan }) => {
  const guideItems = [
    { key: 'model', icon: '👤', text: t.guide.model, color: 'hover:border-blue-400 hover:bg-blue-50/50', iconColor: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
    { key: 'flatlay', icon: '👕', text: t.guide.flatlay, color: 'hover:border-purple-400 hover:bg-purple-50/50', iconColor: 'bg-purple-50 text-purple-600', dot: 'bg-purple-500' },
    { key: 'macro', icon: '🔍', text: t.guide.macro, color: 'hover:border-emerald-400 hover:bg-emerald-50/50', iconColor: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
    { key: 'mannequin', icon: '✨', text: t.guide.mannequin, color: 'hover:border-amber-400 hover:bg-amber-50/50', iconColor: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' },
    { key: 'nature', icon: '🌲', text: t.guide.nature, color: 'hover:border-teal-400 hover:bg-teal-50/50', iconColor: 'bg-teal-50 text-teal-600', dot: 'bg-teal-500' },
    { key: 'promo', icon: '📢', text: t.guide.promo, color: 'hover:border-rose-400 hover:bg-rose-50/50', iconColor: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mb-16 p-8 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 text-center mb-10">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{t.guide.title}</h3>
        <p className="text-slate-500 font-medium">{t.guide.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
        {guideItems.map((item) => {
          const isLoading = loadingCategories.has(item.key);
          const completed = hasResults(item.key);
          const isPromo = item.key === 'promo';

          return (
            <div key={item.key} className="flex flex-col space-y-2">
              <button
                disabled={isLoading}
                onClick={() => onGenerate(item.key as any)}
                className={`w-full flex flex-col items-center p-4 rounded-3xl bg-white/70 border-2 border-transparent shadow-sm transition-all duration-300 transform 
                  ${isLoading ? 'animate-pulse scale-95 border-indigo-200' : `${item.color} hover:-translate-y-2 hover:shadow-xl active:scale-95`}
                  ${completed && !isLoading ? 'border-slate-100 shadow-inner' : 'border-white/80'}
                `}
              >
                <div className={`w-14 h-14 ${item.iconColor} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm relative`}>
                  {isLoading ? (
                    <div className="animate-spin h-6 w-6 border-3 border-current border-t-transparent rounded-full" />
                  ) : (
                    <>
                      {item.icon}
                      {completed && (
                        <div className={`absolute -top-1 -right-1 w-4 h-4 ${item.dot} rounded-full border-2 border-white shadow-sm ring-4 ring-white/50 animate-bounce`}></div>
                      )}
                    </>
                  )}
                </div>
                <span className="text-[11px] font-black text-slate-700 uppercase text-center leading-tight tracking-wide">
                  {item.text}
                </span>
                
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isLoading ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    {isLoading ? t.processing : (completed ? t.retryBtn : t.generateBtn)}
                  </span>
                </div>
              </button>
              
              {isPromo && (
                <div className="px-2">
                  <input 
                    type="text" 
                    placeholder={t.promoSloganPlaceholder}
                    value={promoSlogan}
                    onChange={(e) => setPromoSlogan(e.target.value)}
                    className="w-full text-[10px] p-2 rounded-xl bg-white/80 border border-slate-200 outline-none focus:border-rose-300 transition-all font-medium text-slate-600 placeholder:text-slate-300"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>('uk');
  const [sourceImage, setSourceImage] = useState<{ base64: string, mimeType: string } | null>(null);
  
  const [allImages, setAllImages] = useState<GeneratedImage[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [promoSlogan, setPromoSlogan] = useState('');

  const t = translations[currentLang];

  const [reviewStatus, setReviewStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>({
    situations: [], 
    reviewLanguage: currentLang,
    age: '30-40',
  });

  const hasResults = (category: string) => {
    return allImages.some(img => img.type.startsWith(category));
  };

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
      const images = await generateCategoryImages(
        sourceImage.base64, 
        sourceImage.mimeType, 
        category, 
        currentLang,
        category === 'promo' ? promoSlogan : undefined
      );
      
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
             if (category === 'promo') return !img.type.startsWith('promo');
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
    
    const currentImg = allImages.find(img => img.id === id);
    if (!currentImg || currentImg.correctionCount >= 3) return;

    try {
      const newImageUrl = await regenerateSingleImage(
        sourceImage.base64,
        sourceImage.mimeType,
        currentImg.url,
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
          <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{t.heroTitle}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">{t.heroSubtitle}</p>
        </div>

        <ImageUploader 
          onImageSelected={handleImageSelected} 
          isLoading={loadingCategories.size > 0}
          t={t}
        />

        {sourceImage && (
          <div className="animate-fadeIn">
            <VisualGuide 
              t={t} 
              onGenerate={handleGenerateCategory} 
              loadingCategories={loadingCategories}
              hasResults={hasResults}
              promoSlogan={promoSlogan}
              setPromoSlogan={setPromoSlogan}
            />
          </div>
        )}

        {sourceImage && (
          <div className="mt-8 mb-16 max-w-5xl mx-auto bg-white rounded-[3rem] p-10 border border-slate-200 shadow-2xl relative overflow-hidden animate-fadeIn">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
             
             <div className="text-center mb-12">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-4 py-1.5 rounded-full mb-4 inline-block shadow-sm">UGC Lifestyle Engine</span>
                <h3 className="text-3xl font-black text-slate-800 mb-3">{t.reviews.title}</h3>
                <p className="text-slate-500 text-lg font-medium">{t.reviews.subtitle}</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="md:col-span-2">
                   <div className="flex justify-between items-center mb-5 ml-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t.reviews.situation} (виберіть декілька)</label>
                      {reviewSettings.situations.length > 0 && (
                        <button 
                          onClick={handleClearReviewSettings}
                          className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 transition-colors flex items-center space-x-1.5 bg-red-50 px-3 py-1 rounded-full border border-red-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>{t.reviews.clearBtn}</span>
                        </button>
                      )}
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 h-80 overflow-y-auto p-3 border-2 border-slate-50 rounded-[2rem] bg-slate-50/30 scrollbar-hide">
                      {Object.keys(t.reviews.situations).map(key => {
                        const isSelected = reviewSettings.situations.includes(key);
                        return (
                          <button
                            key={key}
                            onClick={() => toggleSituation(key)}
                            className={`p-4 text-left text-xs font-bold rounded-2xl border-2 transition-all duration-200 ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 translate-y-[-2px]' 
                                : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'
                            }`}
                          >
                            {(t.reviews.situations as any)[key]}
                          </button>
                        );
                      })}
                   </div>
                </div>
                
                <div className="space-y-8 flex flex-col justify-center">
                   <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">{t.reviews.age}</label>
                      <select 
                        className="w-full p-4 rounded-2xl bg-white border-2 border-slate-100 outline-none focus:border-indigo-500 transition-all font-bold text-slate-700"
                        value={reviewSettings.age}
                        onChange={(e) => setReviewSettings({...reviewSettings, age: e.target.value as any})}
                      >
                         <option value="30-40">{t.reviews.options.age30_40}</option>
                         <option value="40-50">{t.reviews.options.age40_50}</option>
                         <option value="50+">{t.reviews.options.age50_plus}</option>
                      </select>
                   </div>
                   <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">{t.reviews.reviewLang}</label>
                      <select 
                        className="w-full p-4 rounded-2xl bg-white border-2 border-slate-100 outline-none focus:border-indigo-500 transition-all font-bold text-slate-700"
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
               className="w-full py-6 rounded-[2rem] bg-indigo-600 text-white font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 disabled:bg-slate-300 transition-all flex items-center justify-center space-x-4 group"
             >
               {reviewStatus === GenerationStatus.LOADING ? (
                 <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full" />
               ) : (
                 <>
                   <span className="text-lg">{t.reviews.generateBtn} ({reviewSettings.situations.length})</span>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                   </svg>
                 </>
               )}
             </button>
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto mb-10 p-5 bg-red-50 border-2 border-red-100 rounded-3xl text-red-700 font-bold text-center shadow-sm">
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
      </main>
    </div>
  );
};

export default App;
