
import { GeneratedImage } from '../types';
import { Translation } from '../translations';
import React, { useState, useMemo } from 'react';

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
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const groupedImages = useMemo(() => {
    const groups: Record<string, GeneratedImage[]> = {};
    // Moved 'review' to the first place in the order
    const order = ['review', 'model', 'flatlay', 'macro', 'mannequin', 'nature', 'promo', 'other'];

    images.forEach(img => {
      let category = 'other';
      if (img.type.startsWith('model')) category = 'model';
      else if (img.type.startsWith('flatlay')) category = 'flatlay';
      else if (img.type.startsWith('macro')) category = 'macro';
      else if (img.type.startsWith('mannequin')) category = 'mannequin';
      else if (img.type.startsWith('nature')) category = 'nature';
      else if (img.type.startsWith('promo')) category = 'promo';
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

  const handleUpdate = async () => {
    if (!isEditingId || !feedback.trim()) return;
    const img = images.find(i => i.id === isEditingId);
    if (!img) return;

    setIsUpdating(true);
    try {
      await onRegenerateSingle(isEditingId, img.type, feedback);
      setIsEditingId(null);
      setFeedback('');
    } catch (e) {
      alert("Помилка при оновленні.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSuggestion = (text: string) => {
    setFeedback(text);
  };

  if (images.length === 0) return null;

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
                  const isReview = img.type === 'review';
                  const canEdit = img.correctionCount < 3;
                  const aspectRatioClass = isReview ? 'aspect-[3/4]' : 'aspect-square';
                  const containerClass = "bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full transform transition-all hover:shadow-lg";

                  return (
                    <div key={img.id} className={`${containerClass} relative`}>
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
                           <a 
                             href={img.url} 
                             download={`studio-${img.id}.png`}
                             onClick={(e) => e.stopPropagation()}
                             className="bg-indigo-600 px-6 py-2 rounded-xl text-white font-bold text-xs shadow-lg hover:bg-indigo-700 transition-all"
                           >
                             {t.downloadBtn}
                           </a>
                           {canEdit && (
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setIsEditingId(img.id);
                               }}
                               className="bg-white px-6 py-2 rounded-xl text-slate-900 font-bold text-xs shadow-lg hover:bg-indigo-50 transition-all"
                             >
                               {t.singleRegen.editBtn}
                             </button>
                           )}
                        </div>
                        {img.correctionCount > 0 && (
                           <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-black px-2 py-1 rounded-lg text-indigo-600 shadow-sm border border-indigo-100">
                             MOD {img.correctionCount}/3
                           </div>
                        )}
                      </div>
                      
                      <div className="p-4 flex flex-col justify-between flex-grow">
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{img.description}</p>
                          {img.textReview && (
                            <p className="text-sm text-slate-700 italic">"{img.textReview}"</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isEditingId && (
        <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-scaleUp overflow-hidden relative">
            <h3 className="text-2xl font-black text-slate-800 mb-6">{t.singleRegen.modalTitle}</h3>
            
            <div className="mb-6">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{t.singleRegen.suggestions}</p>
               <div className="flex flex-wrap gap-2">
                  {Object.entries(t.singleRegen.mannequinFixes).map(([key, text]) => (
                    <button 
                      key={key} 
                      onClick={() => handleSuggestion(text as string)}
                      className="text-[11px] font-bold bg-slate-100 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-xl transition-all border border-slate-200"
                    >
                      {text as string}
                    </button>
                  ))}
               </div>
            </div>

            <textarea 
              autoFocus
              className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-colors text-slate-700 font-medium resize-none mb-6"
              placeholder={t.singleRegen.placeholder}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            <div className="flex gap-4">
              <button 
                onClick={() => {
                   setIsEditingId(null);
                   setFeedback('');
                }}
                className="flex-1 py-4 font-black text-slate-500 hover:text-slate-800 transition-colors"
                disabled={isUpdating}
              >
                {t.singleRegen.cancel}
              </button>
              <button 
                onClick={handleUpdate}
                disabled={isUpdating || !feedback.trim()}
                className="flex-1 bg-indigo-600 py-4 rounded-2xl font-black text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:bg-slate-200 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>{t.singleRegen.regenerating}</span>
                  </>
                ) : t.singleRegen.submit}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl max-h-[80vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
             <img src={selectedImage.url} alt="View" className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl" />
             <div className="mt-6 flex gap-4">
               <a href={selectedImage.url} download className="bg-white px-8 py-3 rounded-2xl font-black text-slate-900 hover:bg-indigo-50 transition-colors">{t.downloadBtn}</a>
               <button className="bg-white/10 px-8 py-3 rounded-2xl font-black text-white hover:bg-white/20 transition-colors" onClick={() => setSelectedImage(null)}>{t.singleRegen.cancel}</button>
             </div>
          </div>
        </div>
      )}
    </>
  );
};
