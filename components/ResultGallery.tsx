
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

  const MAX_CORRECTIONS = 3;

  const groupedImages = useMemo(() => {
    const groups: Record<string, GeneratedImage[]> = {};
    const order = ['model', 'flatlay', 'macro', 'mannequin', 'nature', 'review', 'other'];

    images.forEach(img => {
      let category = 'other';
      if (img.type.startsWith('model')) category = 'model';
      else if (img.type.startsWith('flatlay')) category = 'flatlay';
      else if (img.type.startsWith('macro')) category = 'macro';
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
    if (img.correctionCount >= MAX_CORRECTIONS) return;
    setEditingImage(img);
    setFeedback("");
  };

  const submitRegeneration = async (forcedFeedback?: string) => {
    const finalFeedback = forcedFeedback || feedback;
    if (!editingImage || !finalFeedback.trim()) return;
    const id = editingImage.id;
    setLoadingIds(prev => new Set(prev).add(id));
    setEditingImage(null);

    try {
      await onRegenerateSingle(id, editingImage.type, finalFeedback);
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
      <div className="w-full max-w-6xl mx-auto relative mt-10">
        <div className="space-y-16">
          {groupedImages.map((section) => (
            <div key={section.key} className="animate-fadeIn">
              <div className="mb-6 flex items-center">
                 <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                   {section.title}
                 </h3>
                 <div className="h-px flex-grow bg-slate-200 ml-4"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.items.map((img) => {
                  const isLoading = loadingIds.has(img.id);
                  const isReview = img.type === 'review';
                  const aspectRatioClass = isReview ? 'aspect-[3/4]' : 'aspect-square';
                  const containerClass = "bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full transform transition-all hover:shadow-lg";
                  const limitReached = img.correctionCount >= MAX_CORRECTIONS;

                  return (
                    <div key={img.id} className={`${containerClass} relative`}>
                      {isLoading && (
                        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center flex-col">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                          <p className="text-indigo-800 text-xs font-black uppercase tracking-widest">{t.singleRegen.regenerating}</p>
                        </div>
                      )}

                      <div 
                        className={`relative ${aspectRatioClass} overflow-hidden bg-slate-50 group cursor-pointer`}
                        onClick={() => setSelectedImage(img)}
                      >
                        <img 
                          src={img.url} 
                          alt={img.description} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           {!limitReached && (
                             <button 
                               onClick={(e) => handleEditClick(e, img)}
                               className="bg-white px-4 py-2 rounded-xl text-slate-900 font-bold text-xs shadow-lg hover:bg-indigo-50 transition-all"
                             >
                               {t.singleRegen.editBtn}
                             </button>
                           )}
                           <a 
                             href={img.url} 
                             download={`studio-${img.id}.png`}
                             onClick={(e) => e.stopPropagation()}
                             className="bg-indigo-600 px-4 py-2 rounded-xl text-white font-bold text-xs shadow-lg hover:bg-indigo-700 transition-all"
                           >
                             {t.downloadBtn}
                           </a>
                        </div>
                      </div>
                      
                      <div className="p-4 flex flex-col justify-between flex-grow">
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{img.description}</p>
                          {img.textReview && (
                            <p className="text-sm text-slate-700 italic">"{img.textReview}"</p>
                          )}
                        </div>
                        
                        {!isReview && (
                          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                            <span className={`text-[10px] font-black uppercase ${limitReached ? 'text-red-400' : 'text-slate-300'}`}>
                              {limitReached ? t.singleRegen.limitReached : `${t.singleRegen.remaining}${MAX_CORRECTIONS - img.correctionCount}`}
                            </span>
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

      {editingImage && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
             <h3 className="text-xl font-black text-slate-900 mb-6">{t.singleRegen.modalTitle}</h3>
             
             <textarea
               className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none h-32 text-sm"
               placeholder={t.singleRegen.placeholder}
               value={feedback}
               onChange={(e) => setFeedback(e.target.value)}
             />
             <div className="flex justify-end space-x-2 mt-6">
               <button onClick={() => setEditingImage(null)} className="px-6 py-3 font-bold text-slate-400">{t.singleRegen.cancel}</button>
               <button onClick={() => submitRegeneration()} disabled={!feedback.trim()} className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black shadow-lg disabled:opacity-50">
                 {t.singleRegen.submit}
               </button>
             </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl max-h-[80vh] flex flex-col items-center">
             <img src={selectedImage.url} alt="View" className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl" />
             <div className="mt-6 flex gap-4">
               <a href={selectedImage.url} download className="bg-white px-8 py-3 rounded-2xl font-black text-slate-900">{t.downloadBtn}</a>
               <button className="bg-white/10 px-8 py-3 rounded-2xl font-black text-white" onClick={() => setSelectedImage(null)}>{t.singleRegen.cancel}</button>
             </div>
          </div>
        </div>
      )}
    </>
  );
};
