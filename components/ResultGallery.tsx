import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { Translation } from '../translations';

interface ResultGalleryProps {
  images: GeneratedImage[];
  t: Translation;
  isUnlocked: boolean;
  onUnlock: () => void;
  onRegenerateSingle: (id: string, type: string, feedback: string) => Promise<void>;
}

export const ResultGallery: React.FC<ResultGalleryProps> = ({ 
  images, 
  t, 
  isUnlocked, 
  onUnlock,
  onRegenerateSingle 
}) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  if (images.length === 0) return null;

  const handlePayClick = () => {
    // Construct PayPal link
    const email = "worktati.ai@gmail.com";
    const amount = "4.99";
    const currency = "USD";
    const itemName = "AI Fashion Studio Photos";
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${email}&currency_code=${currency}&amount=${amount}&item_name=${encodeURIComponent(itemName)}`;
    
    window.open(paypalUrl, '_blank');
  };

  const handleEditClick = (e: React.MouseEvent, img: GeneratedImage) => {
    e.stopPropagation();
    setEditingImage(img);
    setFeedback("");
  };

  const submitRegeneration = async () => {
    if (!editingImage || !feedback.trim()) return;
    
    const id = editingImage.id;
    setLoadingIds(prev => new Set(prev).add(id));
    setEditingImage(null); // Close modal

    try {
      await onRegenerateSingle(id, editingImage.type, feedback);
    } catch (e) {
      console.error(e);
      alert("Failed to regenerate image.");
    } finally {
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const WatermarkPattern = ({ size = "normal" }: { size?: "normal" | "large" }) => (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-wrap items-center justify-center content-center overflow-hidden gap-12 p-8 opacity-30">
       {[...Array(size === "large" ? 16 : 8)].map((_, i) => (
          <div 
            key={i} 
            className={`transform -rotate-12 border-2 border-white/80 text-white font-black uppercase tracking-widest mix-blend-overlay shadow-sm select-none
              ${size === "large" ? "text-4xl px-10 py-5" : "text-sm px-4 py-2"}`}
          >
            {t.payment.watermark}
          </div>
       ))}
    </div>
  );

  return (
    <>
      <div className="w-full max-w-6xl mx-auto animate-fadeIn relative">
        <div className="flex items-center justify-center mb-10">
           <div className="h-px w-20 bg-gradient-to-r from-transparent to-violet-300"></div>
           <h2 className="text-3xl font-black text-slate-800 mx-6 text-center tracking-tight">{t.resultsTitle}</h2>
           <div className="h-px w-20 bg-gradient-to-l from-transparent to-violet-300"></div>
        </div>
        
        {/* Payment Gate Banner */}
        {!isUnlocked && (
          <div className="mb-12 relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-[1.01] transition-transform duration-500 group">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 animate-gradient-xy"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="relative p-8 md:p-12 text-white text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-white/50">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                 </svg>
              </div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 drop-shadow-md">{t.payment.title}</h3>
              <p className="mb-8 text-pink-50 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">{t.payment.description}</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <button
                  onClick={handlePayClick}
                  className="px-10 py-4 bg-white text-violet-600 font-bold text-lg rounded-full shadow-xl hover:bg-slate-50 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center group/btn"
                >
                  <span className="bg-violet-100 p-1 rounded-full mr-3 group-hover/btn:bg-violet-200 transition-colors">
                    <svg className="w-5 h-5 text-violet-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337l.756-4.728h-2.239l-1.085 6.86c-.055.356.223.665.583.665h4.28c.316 0 .584-.236.633-.549l.343-2.248h-3.271zm9.648-12.569c-.437-1.782-2.126-2.617-4.757-2.617h-5.068c-.463 0-.872.316-.976.769l-3.376 17.525c-.046.24.139.454.383.454h2.556c.463 0 .872-.317.976-.77l.764-4.832h1.66c3.673 0 6.641-1.503 7.509-5.321.157-.689.231-1.397.231-2.094 0-1.096-.192-2.152-.902-3.114zm-4.321 4.582c-.675 3.018-3.088 3.018-5.088 3.018h-1.002l1.192-7.551h1.492c2.619 0 4.145.474 3.406 4.533z" />
                    </svg>
                  </span>
                  {t.payment.payBtn}
                </button>
                <button
                  onClick={onUnlock}
                  className="px-8 py-4 bg-black/20 hover:bg-black/30 text-white font-semibold rounded-full backdrop-blur-sm border border-white/20 transition-all"
                >
                  {t.payment.unlockBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((img) => {
            const isLoading = loadingIds.has(img.id);
            return (
              <div key={img.id} className="bg-white rounded-3xl shadow-xl hover:shadow-2xl shadow-indigo-100 hover:shadow-violet-200 overflow-hidden transition-all duration-300 flex flex-col h-full transform hover:-translate-y-2 ring-1 ring-black/5 relative">
                
                {isLoading && (
                  <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center flex-col">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-3"></div>
                    <p className="text-violet-800 font-bold animate-pulse">{t.singleRegen.regenerating}</p>
                  </div>
                )}

                <div 
                  className="relative aspect-[3/4] overflow-hidden bg-slate-100 group cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                >
                  {/* Main Image */}
                  <img 
                    src={img.url} 
                    alt={img.description} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay for Text Visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                  
                  {/* Watermark Overlay if Locked */}
                  {!isUnlocked && <WatermarkPattern />}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-violet-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-wrap items-center justify-center gap-3 z-30 backdrop-blur-[2px] p-4 content-center">
                     {/* Edit Button */}
                     <button 
                       onClick={(e) => handleEditClick(e, img)}
                       className="bg-white px-4 py-2 rounded-full text-slate-800 font-bold shadow-xl hover:bg-violet-50 hover:text-violet-700 transition-all duration-300 flex items-center text-sm"
                       title="Refine this image"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                       </svg>
                       {t.singleRegen.editBtn}
                     </button>

                     {/* Zoom Button */}
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedImage(img);
                       }}
                       className="bg-white p-3 rounded-full text-violet-600 shadow-xl hover:bg-violet-50 hover:scale-110 transition-all duration-300"
                       title="Zoom"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                     </button>

                     {/* Download Button (Only visible if Unlocked) */}
                     {isUnlocked && (
                       <a 
                         href={img.url} 
                         download={`product-ai-${img.id}.png`}
                         onClick={(e) => e.stopPropagation()}
                         className="bg-violet-600 p-3 rounded-full text-white shadow-xl hover:bg-violet-700 hover:scale-110 transition-all duration-300"
                         title={t.downloadBtn}
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                         </svg>
                       </a>
                     )}
                  </div>

                  {/* Lock Icon if Locked */}
                  {!isUnlocked && (
                    <div className="absolute top-3 right-3 z-20">
                       <div className="bg-black/40 text-white p-2 rounded-full backdrop-blur-md border border-white/20 shadow-lg">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                         </svg>
                       </div>
                    </div>
                  )}
                  
                  {/* Type Tag over image */}
                  <div className="absolute bottom-4 left-4 z-20">
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/90 text-violet-900 uppercase tracking-wide shadow-lg backdrop-blur-sm">
                         {img.type}
                      </span>
                  </div>
                </div>
                
                <div className="p-6 flex-grow bg-white relative z-10">
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{img.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editing Modal */}
      {editingImage && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl transform transition-all scale-100 ring-1 ring-white/20">
             <h3 className="text-2xl font-bold text-slate-800 mb-4">{t.singleRegen.modalTitle}</h3>
             
             <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
               <span className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-1 block">Selected Style</span>
               <p className="text-sm text-slate-700">{editingImage.description}</p>
             </div>

             <div className="mb-6">
               <label className="block text-sm font-bold text-slate-700 mb-2">
                 {t.singleRegen.placeholder}
               </label>
               <textarea
                 className="w-full p-4 rounded-xl border-2 border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all outline-none resize-none h-32"
                 placeholder="e.g. Remove the cuff on the pants..."
                 value={feedback}
                 onChange={(e) => setFeedback(e.target.value)}
                 autoFocus
               />
             </div>

             <div className="flex justify-end space-x-3">
               <button 
                 onClick={() => setEditingImage(null)}
                 className="px-6 py-3 rounded-full font-bold text-slate-500 hover:bg-slate-100 transition-colors"
               >
                 {t.singleRegen.cancel}
               </button>
               <button 
                 onClick={submitRegeneration}
                 disabled={!feedback.trim()}
                 className={`px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5
                    ${feedback.trim() ? 'bg-violet-600 hover:bg-violet-700 hover:shadow-violet-500/30' : 'bg-slate-300 cursor-not-allowed'}
                 `}
               >
                 {t.singleRegen.submit}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Full Screen Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[95vh] w-full h-full flex items-center justify-center">
             <button 
               onClick={() => setSelectedImage(null)}
               className="absolute top-4 right-4 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>

             <div className="relative w-auto h-auto max-w-full max-h-full">
                <img 
                  src={selectedImage.url} 
                  alt="Full view" 
                  className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
                  onClick={(e) => e.stopPropagation()} 
                />
                
                {/* Watermark in Modal */}
                {!isUnlocked && (
                  <div className="absolute inset-0 z-20 pointer-events-none rounded-2xl overflow-hidden">
                     <WatermarkPattern size="large" />
                  </div>
                )}
             </div>

             {isUnlocked && (
                <a 
                   href={selectedImage.url} 
                   download={`product-ai-${selectedImage.id}.png`}
                   onClick={(e) => e.stopPropagation()}
                   className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-violet-700 px-10 py-4 rounded-full font-bold shadow-2xl hover:bg-violet-50 hover:scale-105 transition-all flex items-center"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                   </svg>
                   {t.downloadBtn}
                </a>
             )}
          </div>
        </div>
      )}
    </>
  );
};