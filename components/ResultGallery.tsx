import React, { useState, useMemo } from 'react';
import { GeneratedImage } from '../types';
import { Translation } from '../translations';

interface ResultGalleryProps {
  images: GeneratedImage[];
  t: Translation;
  onRegenerateSingle: (id: string, type: string, feedback: string) => Promise<void>;
}

export const ResultGallery: React.FC<ResultGalleryProps> = ({ 
  images, 
  t, 
  onRegenerateSingle 
}) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  // Group images by category for display
  const groupedImages = useMemo(() => {
    const groups: Record<string, GeneratedImage[]> = {};
    const order = ['model', 'flatlay', 'macro', 'mannequin', 'nature', 'review', 'other'];

    images.forEach(img => {
      let category = 'other';
      if (img.type.startsWith('model')) category = 'model';
      else if (img.type.startsWith('flatlay')) category = 'flatlay';
      else if (img.type.startsWith('macro')) category = 'macro';
      // Updated check for new mannequin-far and mannequin-close types
      else if (img.type.startsWith('mannequin')) category = 'mannequin';
      else if (img.type.startsWith('nature')) category = 'nature';
      else if (img.type === 'review') category = 'review';
      
      if (!groups[category]) groups[category] = [];
      groups[category].push(img);
    });

    return order
      .filter(key => groups[key] && groups[key].length > 0)
      .map(key => ({
        key,
        title: t.gallerySections[key as keyof typeof t.gallerySections] || key,
        items: groups[key]
      }));
  }, [images, t]);

  if (images.length === 0) return null;

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

  return (
    <>
      <div className="w-full max-w-6xl mx-auto animate-fadeIn relative">
        <div className="flex items-center justify-center mb-10">
           <div className="h-px w-20 bg-gradient-to-r from-transparent to-violet-300"></div>
           <h2 className="text-3xl font-black text-slate-800 mx-6 text-center tracking-tight">{t.resultsTitle}</h2>
           <div className="h-px w-20 bg-gradient-to-l from-transparent to-violet-300"></div>
        </div>
        
        <div className="space-y-16">
          {groupedImages.map((section) => (
            <div key={section.key} className="animate-fadeIn">
              {/* Section Header */}
              <div className="mb-6 flex items-center">
                 <h3 className="text-xl font-bold text-slate-700 uppercase tracking-wider bg-white/50 px-4 py-1 rounded-full border border-slate-200 shadow-sm backdrop-blur-sm">
                   {section.title}
                 </h3>
                 <div className="h-px flex-grow bg-slate-200 ml-4"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.items.map((img) => {
                  const isLoading = loadingIds.has(img.id);
                  const isReview = img.type === 'review';
                  
                  // Styles specifically for review items vs normal product items
                  const aspectRatioClass = isReview ? 'aspect-[3/4]' : 'aspect-square';
                  const containerClass = isReview 
                     ? "bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1" // Phone post style
                     : "bg-white rounded-3xl shadow-xl hover:shadow-2xl shadow-indigo-100 hover:shadow-violet-200 overflow-hidden transition-all duration-300 flex flex-col h-full transform hover:-translate-y-2 ring-1 ring-black/5"; // Premium card style

                  return (
                    <div key={img.id} className={`${containerClass} relative`}>
                      
                      {isLoading && (
                        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center flex-col">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-3"></div>
                          <p className="text-violet-800 font-bold animate-pulse">{t.singleRegen.regenerating}</p>
                        </div>
                      )}

                      <div 
                        className={`relative ${aspectRatioClass} overflow-hidden bg-slate-100 group cursor-pointer`}
                        onClick={() => setSelectedImage(img)}
                      >
                        {/* Main Image */}
                        <img 
                          src={img.url} 
                          alt={img.description} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        
                        {/* Gradient Overlay for Text Visibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                        
                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-wrap items-center justify-center gap-3 z-30 backdrop-blur-[2px] p-4 content-center">
                           {/* Edit Button */}
                           <button 
                             onClick={(e) => handleEditClick(e, img)}
                             className="bg-white px-4 py-2 rounded-full text-slate-800 font-bold shadow-xl hover:bg-violet-50 hover:text-violet-700 transition-all duration-300 flex items-center text-sm"
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
                           >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                           </button>

                           {/* Download Button */}
                           <a 
                             href={img.url} 
                             download={`product-ai-${img.id}.png`}
                             onClick={(e) => e.stopPropagation()}
                             className="bg-violet-600 p-3 rounded-full text-white shadow-xl hover:bg-violet-700 hover:scale-110 transition-all duration-300"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                             </svg>
                           </a>
                        </div>
                      </div>
                      
                      <div className="p-4 flex-grow bg-white relative z-10 flex flex-col justify-between">
                        {/* Only show description for non-reviews or very briefly for reviews */}
                        {!isReview && (
                            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-3">{img.description}</p>
                        )}
                        
                        {/* Review Text Display - Styled like a social comment */}
                        {img.textReview && isReview && (
                          <div className="mt-1">
                             <div className="flex items-center space-x-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                   {/* Random initials simulation based on ID */}
                                   U{img.id.slice(-1)}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-xs font-bold text-slate-800">User_{img.id.slice(0,4)}</span>
                                   <div className="flex text-yellow-400 text-[10px]">
                                     {[1,2,3,4,5].map(i => <span key={i}>★</span>)}
                                   </div>
                                </div>
                             </div>
                             <p className="text-sm text-slate-700 leading-snug">
                               {img.textReview}
                             </p>
                             <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide">{img.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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

             <div className="relative w-auto h-auto max-w-full max-h-full flex flex-col items-center">
                <img 
                  src={selectedImage.url} 
                  alt="Full view" 
                  className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
                  onClick={(e) => e.stopPropagation()} 
                />
                
                {/* Text Review in Full Screen */}
                {selectedImage.textReview && (
                   <div className="mt-6 bg-white/10 backdrop-blur-md p-6 rounded-2xl max-w-2xl text-center border border-white/20">
                      <div className="flex justify-center text-yellow-400 mb-2 text-xl">★★★★★</div>
                      <p className="text-white text-lg font-medium italic">"{selectedImage.textReview}"</p>
                   </div>
                )}
             </div>

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
          </div>
        </div>
      )}
    </>
  );
};