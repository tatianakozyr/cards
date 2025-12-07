import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { Translation } from '../translations';

interface ResultGalleryProps {
  images: GeneratedImage[];
  t: Translation;
  isUnlocked: boolean;
  onUnlock: () => void;
}

export const ResultGallery: React.FC<ResultGalleryProps> = ({ images, t, isUnlocked, onUnlock }) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

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

  const WatermarkPattern = ({ size = "normal" }: { size?: "normal" | "large" }) => (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-wrap items-center justify-center content-center overflow-hidden gap-8 p-4 opacity-40">
       {[...Array(size === "large" ? 12 : 6)].map((_, i) => (
          <div 
            key={i} 
            className={`transform -rotate-12 border-2 border-white text-white font-bold uppercase tracking-widest bg-black/10 select-none whitespace-nowrap
              ${size === "large" ? "text-3xl px-8 py-4" : "text-sm px-3 py-1"}`}
          >
            {t.payment.watermark}
          </div>
       ))}
    </div>
  );

  return (
    <>
      <div className="w-full max-w-6xl mx-auto animate-fadeIn relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t.resultsTitle}</h2>
        
        {/* Payment Gate Banner */}
        {!isUnlocked && (
          <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-xl text-center transform hover:scale-[1.01] transition-transform">
            <h3 className="text-2xl font-bold mb-3">{t.payment.title}</h3>
            <p className="mb-6 text-indigo-100 max-w-2xl mx-auto text-lg">{t.payment.description}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handlePayClick}
                className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-full shadow-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337l.756-4.728h-2.239l-1.085 6.86c-.055.356.223.665.583.665h4.28c.316 0 .584-.236.633-.549l.343-2.248h-3.271zm9.648-12.569c-.437-1.782-2.126-2.617-4.757-2.617h-5.068c-.463 0-.872.316-.976.769l-3.376 17.525c-.046.24.139.454.383.454h2.556c.463 0 .872-.317.976-.77l.764-4.832h1.66c3.673 0 6.641-1.503 7.509-5.321.157-.689.231-1.397.231-2.094 0-1.096-.192-2.152-.902-3.114zm-4.321 4.582c-.675 3.018-3.088 3.018-5.088 3.018h-1.002l1.192-7.551h1.492c2.619 0 4.145.474 3.406 4.533z" />
                </svg>
                {t.payment.payBtn}
              </button>
              <button
                onClick={onUnlock}
                className="px-6 py-3 bg-indigo-800/50 hover:bg-indigo-800/70 border border-indigo-400/30 text-white font-medium rounded-full backdrop-blur-sm transition-colors"
              >
                {t.payment.unlockBtn}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <div key={img.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full">
              <div 
                className="relative aspect-[3/4] overflow-hidden bg-gray-100 group cursor-pointer"
                onClick={() => setSelectedImage(img)}
              >
                {/* Main Image - Removed blur */}
                <img 
                  src={img.url} 
                  alt={img.description} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Watermark Overlay if Locked */}
                {!isUnlocked && <WatermarkPattern />}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-30">
                   {/* Zoom Button */}
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       setSelectedImage(img);
                     }}
                     className="bg-white/90 p-3 rounded-full text-gray-800 shadow-lg hover:bg-white hover:scale-110 transition-all"
                     title="Zoom"
                   >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                   </button>

                   {/* Download Button (Only visible if Unlocked) */}
                   {isUnlocked && (
                     <a 
                       href={img.url} 
                       download={`product-ai-${img.id}.png`}
                       onClick={(e) => e.stopPropagation()}
                       className="bg-white/90 p-3 rounded-full text-indigo-600 shadow-lg hover:bg-white hover:scale-110 transition-all"
                       title={t.downloadBtn}
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                       </svg>
                     </a>
                   )}
                </div>

                {/* Lock Icon if Locked (Small indicator corner) */}
                {!isUnlocked && (
                  <div className="absolute top-2 right-2 z-20">
                     <div className="bg-gray-900/80 text-white p-2 rounded-full backdrop-blur-sm shadow-md">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                       </svg>
                     </div>
                  </div>
                )}
              </div>
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-xs font-bold px-2 py-1 rounded bg-indigo-50 text-indigo-700 uppercase tracking-wide">
                       {img.type}
                     </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{img.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[95vh] w-full h-full flex items-center justify-center">
             <button 
               onClick={() => setSelectedImage(null)}
               className="absolute top-4 right-4 z-50 text-white/70 hover:text-white bg-black/20 hover:bg-white/20 rounded-full p-2 transition-colors"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>

             <div className="relative w-auto h-auto max-w-full max-h-full">
                <img 
                  src={selectedImage.url} 
                  alt="Full view" 
                  className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()} 
                />
                
                {/* Watermark in Modal */}
                {!isUnlocked && (
                  <div className="absolute inset-0 z-20 pointer-events-none rounded-lg overflow-hidden">
                     <WatermarkPattern size="large" />
                  </div>
                )}
             </div>

             {isUnlocked && (
                <a 
                   href={selectedImage.url} 
                   download={`product-ai-${selectedImage.id}.png`}
                   onClick={(e) => e.stopPropagation()}
                   className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-900 px-8 py-3 rounded-full font-bold shadow-xl hover:bg-gray-100 transition-colors flex items-center"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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