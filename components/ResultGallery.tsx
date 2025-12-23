
import { GeneratedImage } from '../types';
import { Translation } from '../translations';
import React, { useState, useMemo } from 'react';

interface ResultGalleryProps {
  images: GeneratedImage[];
  t: Translation;
}

export const ResultGallery: React.FC<ResultGalleryProps> = ({ 
  images, 
  t 
}) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

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
                        </div>
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
