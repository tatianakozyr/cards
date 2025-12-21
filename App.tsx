import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultGallery } from './components/ResultGallery';
import { generateCategoryImages, regenerateSingleImage, generateReviewImages } from './services/geminiService';
import { GeneratedImage, GenerationStatus, Language, ReviewSettings, ImageCategory } from './types';
import { translations } from './translations';

const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>('uk');
  const [sourceImage, setSourceImage] = useState<{ base64: string, mimeType: string } | null>(null);
  
  // Results categorized
  const [allImages, setAllImages] = useState<GeneratedImage[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Review Generation State
  const [reviewStatus, setReviewStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>({
    gender: 'male',
    age: '30-40',
  });

  const t = translations[currentLang];

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
        // Replace or Append? User usually wants fresh ones for the block
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

    try {
      const newImageUrl = await regenerateSingleImage(
        sourceImage.base64,
        sourceImage.mimeType,
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

  const handleGenerateReviews = async () => {
    if (!sourceImage) return;
    setReviewStatus(GenerationStatus.LOADING);
    
    try {
      const images = await generateReviewImages(sourceImage.base64, sourceImage.mimeType, reviewSettings, currentLang);
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

  const categories: Exclude<ImageCategory, 'review'>[] = ['model', 'flatlay', 'macro', 'mannequin', 'nature'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20 selection:bg-violet-200">
      <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">FS</div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">{t.headerTitle}</h1>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 pt-32">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-slate-900 mb-4">{t.heroTitle}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t.heroSubtitle}</p>
        </div>

        <ImageUploader 
          onImageSelected={handleImageSelected} 
          isLoading={loadingCategories.size > 0}
          t={t}
        />

        {sourceImage && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleGenerateCategory(cat)}
                disabled={loadingCategories.has(cat)}
                className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group
                  ${loadingCategories.has(cat) 
                    ? 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-50' 
                    : 'bg-white border-slate-200 hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1'}
                `}
              >
                <div className="text-slate-800 font-bold mb-2 group-hover:text-indigo-600">{t.gallerySections[cat]}</div>
                {loadingCategories.has(cat) ? (
                  <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
                ) : (
                  <div className="text-xs text-slate-400 font-medium">{t.generateBtn}</div>
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
          <div className="mt-20 max-w-3xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
             <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-slate-800">{t.reviews.title}</h3>
                <p className="text-slate-500">{t.reviews.subtitle}</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                   <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{t.reviews.gender}</label>
                   <select 
                     className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                     value={reviewSettings.gender}
                     onChange={(e) => setReviewSettings({...reviewSettings, gender: e.target.value as any})}
                   >
                      <option value="male">{t.reviews.options.male}</option>
                      <option value="female">{t.reviews.options.female}</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{t.reviews.age}</label>
                   <select 
                     className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                     value={reviewSettings.age}
                     onChange={(e) => setReviewSettings({...reviewSettings, age: e.target.value as any})}
                   >
                      <option value="30-40">{t.reviews.options.age30_40}</option>
                      <option value="40-50">{t.reviews.options.age40_50}</option>
                      <option value="50+">{t.reviews.options.age50_plus}</option>
                   </select>
                </div>
             </div>
             
             <button
               onClick={handleGenerateReviews}
               disabled={reviewStatus === GenerationStatus.LOADING}
               className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black shadow-lg hover:bg-indigo-700 disabled:bg-slate-300 transition-all flex items-center justify-center"
             >
               {reviewStatus === GenerationStatus.LOADING ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : t.reviews.generateBtn}
             </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;