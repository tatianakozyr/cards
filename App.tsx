
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultGallery } from './components/ResultGallery';
import { generateCategoryImages, regenerateSingleImage, generateReviewImages } from './services/geminiService';
import { AuthService } from './services/authService';
import { GeneratedImage, GenerationStatus, Language, ReviewSettings, ImageCategory, User } from './types';
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
    <div className="w-full max-w-5xl mx-auto mb-10 p-8 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 shadow-2xl overflow-hidden relative group">
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
                    <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full" />
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
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [showCabinet, setShowCabinet] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPassChange, setShowPassChange] = useState(false);
  const [passChangeForm, setPassChangeForm] = useState({ old: '', new: '' });
  const [adminUsers, setAdminUsers] = useState<User[]>([]);

  const [sourceImage, setSourceImage] = useState<{ base64: string, mimeType: string } | null>(null);
  const [allImages, setAllImages] = useState<GeneratedImage[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [promoSlogan, setPromoSlogan] = useState('');

  const resultsRef = useRef<HTMLDivElement>(null);
  const t = translations[currentLang];

  const [reviewStatus, setReviewStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>({
    situations: [], 
    reviewLanguage: currentLang,
    age: '30-40',
  });

  // Limits Logic - No limits now
  const isLimitReached = false;

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) setUser(currentUser);
  }, []);

  const scrollToResults = () => {
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      let loggedUser;
      if (authMode === 'register') {
        loggedUser = await AuthService.register(authForm.email, authForm.password, authForm.name);
      } else {
        loggedUser = await AuthService.login(authForm.email, authForm.password);
      }
      setUser(loggedUser);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setShowCabinet(false);
    setShowAdmin(false);
    setShowPassChange(false);
    setAllImages([]);
    setSourceImage(null);
  };

  const handlePassChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsAuthLoading(true);
    try {
      await AuthService.changePassword(user.id, passChangeForm.old, passChangeForm.new);
      alert(t.cabinet.passSuccess);
      setShowPassChange(false);
      setPassChangeForm({ old: '', new: '' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRequestPayment = () => {
    alert(t.billing.success);
  };

  const loadAdminUsers = () => {
    if (!user?.isAdmin) return;
    setAdminUsers(AuthService.getAllUsers());
  };

  useEffect(() => {
    if (showAdmin) loadAdminUsers();
  }, [showAdmin]);

  const handleToggleUserPro = async (userId: string, isPaid: boolean) => {
    await AuthService.updateAnyUserPayment(userId, isPaid);
    loadAdminUsers();
    if (userId === user?.id) {
       const fresh = AuthService.getCurrentUser();
       setUser(fresh);
    }
  };

  const handleImageSelected = useCallback(async (base64: string, mimeType: string) => {
    setSourceImage({ base64, mimeType });
    setAllImages([]);
    setError(null);
    setLoadingCategories(new Set());
    setReviewStatus(GenerationStatus.IDLE);

    if (user) {
      const updatedUser = await AuthService.incrementUploadCount(user.id);
      setUser(updatedUser);
    }
  }, [user]);

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
          const filtered = prev.filter(img => !img.type.startsWith(category));
          return [...filtered, ...images];
        });
        scrollToResults();
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
    if (!currentImg) return;

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
          img.id === id ? { ...img, url: newImageUrl, correctionCount: img.correctionCount + 1 } : img
        ));
      }
    } catch (e) {
      console.error(e);
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

  const handleGenerateReviews = async () => {
    if (!sourceImage || reviewSettings.situations.length === 0) return;
    setReviewStatus(GenerationStatus.LOADING);
    try {
      const situationTexts = reviewSettings.situations.map(key => (t.reviews.situations as any)[key]);
      const settingsForService = { ...reviewSettings, situations: situationTexts };
      const images = await generateReviewImages(sourceImage.base64, sourceImage.mimeType, settingsForService, currentLang);
      setAllImages(prev => [...prev.filter(img => img.type !== 'review'), ...images]);
      setReviewStatus(GenerationStatus.SUCCESS);
      scrollToResults();
    } catch (e) {
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
          onClick={() => setCurrentLang(lang)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
            currentLang === lang ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-indigo-100">
        <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 animate-fadeIn">
           <div className="text-center mb-10">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-2xl mb-6 shadow-xl shadow-indigo-100">MS</div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">{authMode === 'login' ? t.auth.loginTitle : 'Реєстрація'}</h2>
              <p className="text-slate-500 font-medium text-xs leading-relaxed">{t.auth.loginSubtitle}</p>
           </div>
           {authError && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">{authError}</div>}
           <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && <input type="text" required placeholder="Ім'я" value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none focus:border-indigo-500 transition-all font-bold" />}
              <input type="email" required placeholder={t.auth.emailPlaceholder} value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none focus:border-indigo-500 transition-all font-bold" />
              <input type="password" required placeholder={t.auth.passPlaceholder} value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none focus:border-indigo-500 transition-all font-bold" />
              <button type="submit" disabled={isAuthLoading} className="w-full py-5 bg-indigo-600 rounded-2xl text-white font-black text-lg shadow-xl hover:bg-indigo-700 transition-all active:scale-[0.98]">
                {isAuthLoading ? <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full mx-auto" /> : (authMode === 'login' ? t.auth.loginBtn : 'Створити акаунт')}
              </button>
           </form>
           <div className="mt-8 text-center"><button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-indigo-600 font-bold text-sm">{authMode === 'login' ? 'Немає акаунту? Створити' : 'Вже є акаунт? Увійти'}</button></div>
           <div className="mt-8 flex justify-center"><LanguageSelector /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 selection:bg-indigo-100">
      <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">MS</div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">{t.headerTitle}</h1>
          </div>
          <div className="flex items-center space-x-6">
            <LanguageSelector />
            <button onClick={() => setShowCabinet(true)} className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden hover:border-indigo-400 transition-all"><img src={user.avatar} className="w-full h-full object-cover" /></button>
          </div>
        </div>
      </header>

      {showAdmin && user.isAdmin && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-xl p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-10 shadow-2xl animate-scaleUp">
             <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-slate-800">{t.admin.title}</h2>
                <button onClick={() => setShowAdmin(false)} className="text-slate-400 hover:text-slate-800 font-black">CLOSE</button>
             </div>
             
             <div className="mb-6 flex space-x-4">
                <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.admin.userCount}</p>
                   <p className="text-2xl font-black text-indigo-600">{adminUsers.length}</p>
                </div>
                <button onClick={loadAdminUsers} className="bg-indigo-50 text-indigo-600 px-6 rounded-2xl font-black hover:bg-indigo-100 transition-all">{t.admin.refresh}</button>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <th className="pb-4">{t.admin.tableEmail}</th>
                         <th className="pb-4">{t.admin.tableStatus}</th>
                         <th className="pb-4">{t.admin.tableUploads}</th>
                         <th className="pb-4">{t.admin.tableAction}</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {adminUsers.map(u => (
                         <tr key={u.id} className="text-sm">
                            <td className="py-4">
                               <p className="font-bold text-slate-800">{u.email}</p>
                               <p className="text-xs text-slate-400">{u.name}</p>
                            </td>
                            <td className="py-4">
                               <span className={`px-3 py-1 rounded-full text-[10px] font-black ${u.isAdmin ? 'bg-indigo-50 text-indigo-600' : u.isPaid ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                                  {u.isAdmin ? 'ADMIN' : u.isPaid ? 'PRO' : 'FREE'}
                               </span>
                            </td>
                            <td className="py-4 font-bold text-slate-600">
                               {u.uploadCount} / ∞
                            </td>
                            <td className="py-4">
                               {!u.isAdmin && (
                                 <button 
                                   onClick={() => handleToggleUserPro(u.id, !u.isPaid)}
                                   className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${u.isPaid ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                 >
                                    {u.isPaid ? t.admin.freeBtn : t.admin.proBtn}
                                 </button>
                               )}
                               {u.isAdmin && <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Master</span>}
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {showCabinet && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex justify-end animate-fadeIn" onClick={() => setShowCabinet(false)}>
           <div className="w-full max-w-md bg-white h-full shadow-2xl animate-slideInRight p-8 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-12">
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.cabinet.title}</h2>
                 <button onClick={() => setShowCabinet(false)} className="text-slate-400">CLOSE</button>
              </div>
              <div className="text-center mb-10">
                 <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 border border-indigo-100 mx-auto mb-4 overflow-hidden"><img src={user.avatar} className="w-full h-full object-cover" /></div>
                 <h3 className="text-xl font-black text-slate-800">{user.name}</h3>
                 <p className="text-slate-400 font-bold text-sm uppercase">{user.email}</p>
              </div>
              
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-6">
                 <p className="text-xs font-black text-slate-400 uppercase mb-3">{t.limits.title}</p>
                 <div className="flex justify-between text-[11px] font-black">
                    <span className="text-slate-600">
                       Згенеровано: {user.uploadCount} фото
                    </span>
                    <span className="text-indigo-600">
                       {t.limits.freeLimitMsg}
                    </span>
                 </div>
              </div>

              <div className="space-y-4 mb-12">
                 {user.isAdmin && (
                   <button onClick={() => {setShowAdmin(true); setShowCabinet(false);}} className="w-full p-6 text-left bg-indigo-50 text-indigo-600 rounded-3xl font-black flex items-center space-x-4">
                      <span>{t.cabinet.adminBtn}</span>
                   </button>
                 )}
                 {!user.isPaid && !user.isAdmin && <button onClick={handleRequestPayment} className="w-full p-6 text-left bg-green-50 text-green-600 rounded-3xl font-black">Запит на PRO доступ</button>}
                 
                 <button 
                   onClick={() => setShowPassChange(!showPassChange)} 
                   className="w-full p-6 text-left bg-slate-50 rounded-3xl font-black flex items-center justify-between"
                 >
                    <span>{t.cabinet.changePass}</span>
                    <svg className={`h-4 w-4 transform transition-transform ${showPassChange ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                 </button>

                 {showPassChange && (
                    <form onSubmit={handlePassChange} className="p-6 bg-slate-50 rounded-3xl space-y-3 animate-fadeIn">
                       <input 
                         type="password" 
                         required 
                         placeholder={t.cabinet.oldPass} 
                         value={passChangeForm.old}
                         onChange={(e) => setPassChangeForm({...passChangeForm, old: e.target.value})}
                         className="w-full p-3 rounded-xl border border-slate-200 font-bold"
                       />
                       <input 
                         type="password" 
                         required 
                         placeholder={t.cabinet.newPass} 
                         value={passChangeForm.new}
                         onChange={(e) => setPassChangeForm({...passChangeForm, new: e.target.value})}
                         className="w-full p-3 rounded-xl border border-slate-200 font-bold"
                       />
                       <button type="submit" disabled={isAuthLoading} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-all">
                          {isAuthLoading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mx-auto" /> : t.cabinet.passBtn}
                       </button>
                    </form>
                 )}

                 <button onClick={handleLogout} className="w-full p-6 text-left bg-red-50 text-red-600 rounded-3xl font-black">Вийти</button>
              </div>
           </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 pt-24">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{t.heroTitle}</h2>
          <p className="text-slate-500 text-lg">{t.heroSubtitle}</p>
        </div>

        <ImageUploader onImageSelected={handleImageSelected} isLoading={loadingCategories.size > 0} t={t} />

        {sourceImage && (
          <div className="animate-fadeIn">
            <VisualGuide t={t} onGenerate={handleGenerateCategory} loadingCategories={loadingCategories} hasResults={(key) => allImages.some(img => img.type.startsWith(key))} promoSlogan={promoSlogan} setPromoSlogan={setPromoSlogan} />
          </div>
        )}

        <div ref={resultsRef} className="scroll-mt-24">
          {allImages.length > 0 && <div className="mb-16"><ResultGallery images={allImages} t={t} onRegenerateSingle={handleRegenerateSingle} /></div>}
        </div>

        {sourceImage && (
          <div className="mt-8 mb-16 max-w-5xl mx-auto bg-white rounded-[3rem] p-10 border border-slate-200 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
             <div className="text-center mb-12">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-1.5 rounded-full mb-4 inline-block">UGC Lifestyle Engine</span>
                <h3 className="text-3xl font-black text-slate-800 mb-3">{t.reviews.title}</h3>
                <p className="text-slate-500 text-lg font-medium">{t.reviews.subtitle}</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="md:col-span-2">
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 h-80 overflow-y-auto p-3 bg-slate-50/30 rounded-[2rem] border-2 border-slate-50">
                      {Object.keys(t.reviews.situations).map(key => {
                        const isSelected = reviewSettings.situations.includes(key);
                        return (
                          <button key={key} onClick={() => toggleSituation(key)} className={`p-4 text-left text-xs font-bold rounded-2xl border-2 transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-600'}`}>
                            {(t.reviews.situations as any)[key]}
                          </button>
                        );
                      })}
                   </div>
                </div>
                <div className="space-y-8 flex flex-col justify-center">
                   <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t.reviews.age}</label>
                      <select className="w-full p-4 rounded-2xl bg-white border-2 border-slate-100 font-bold outline-none" value={reviewSettings.age} onChange={(e) => setReviewSettings({...reviewSettings, age: e.target.value as any})}>
                         <option value="30-40">{t.reviews.options.age30_40}</option>
                         <option value="40-50">{t.reviews.options.age40_50}</option>
                         <option value="50+">{t.reviews.options.age50_plus}</option>
                      </select>
                   </div>
                   <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t.reviews.reviewLang}</label>
                      <select className="w-full p-4 rounded-2xl bg-white border-2 border-slate-100 font-bold outline-none" value={reviewSettings.reviewLanguage} onChange={(e) => setReviewSettings({...reviewSettings, reviewLanguage: e.target.value as any})}>
                         <option value="uk">Українська</option>
                         <option value="en">English</option>
                         <option value="ru">Русский</option>
                      </select>
                   </div>
                </div>
             </div>
             
             <button onClick={handleGenerateReviews} disabled={reviewStatus === GenerationStatus.LOADING || reviewSettings.situations.length === 0} className="w-full py-6 rounded-[2rem] bg-indigo-600 text-white font-black shadow-2xl hover:bg-indigo-700 disabled:bg-slate-300 transition-all flex items-center justify-center space-x-4">
               {reviewStatus === GenerationStatus.LOADING ? <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full" /> : <span className="text-lg">{t.reviews.generateBtn} ({reviewSettings.situations.length})</span>}
             </button>
          </div>
        )}

        {error && <div className="max-w-xl mx-auto mb-10 p-5 bg-red-50 border-2 border-red-100 rounded-3xl text-red-700 font-bold text-center">{error}</div>}
      </main>
    </div>
  );
};

export default App;
