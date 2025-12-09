import React, { useRef, useState } from 'react';
import { Translation } from '../translations';

interface ImageUploaderProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  isLoading: boolean;
  t: Translation;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading, t }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t.uploadError);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageSelected(result, file.type);
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        disabled={isLoading}
      />
      
      {!preview ? (
        <div 
          onClick={isLoading ? undefined : triggerUpload}
          className={`relative border-4 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden group
            ${isLoading 
              ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed' 
              : 'border-indigo-200 hover:border-violet-400 bg-white/60 hover:bg-white/90 shadow-xl hover:shadow-2xl hover:shadow-violet-200/50 backdrop-blur-sm'}
          `}
        >
          {/* Subtle animated background gradient on hover */}
          {!isLoading && (
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-indigo-50/50 group-hover:via-purple-50/50 group-hover:to-pink-50/50 transition-all duration-500" />
          )}

          <div className="relative z-10">
            <div className={`mx-auto h-20 w-20 mb-6 rounded-2xl flex items-center justify-center transition-all duration-300
              ${isLoading ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-500 group-hover:bg-violet-100 group-hover:text-violet-600 group-hover:scale-110'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2 group-hover:text-violet-700 transition-colors">{t.uploadTitle}</h3>
            <p className="text-slate-500 font-medium">{t.uploadSubtitle}</p>
          </div>
        </div>
      ) : (
        <div className="relative group rounded-3xl overflow-hidden shadow-2xl border border-white/50 bg-white ring-1 ring-black/5 transform transition-transform hover:scale-[1.02] duration-300">
          <div className="absolute top-0 left-0 w-full h-full bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 backdrop-blur-[2px]">
            {!isLoading && (
              <button 
                onClick={triggerUpload}
                className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-violet-50 hover:text-violet-700 transition-all transform hover:scale-105"
              >
                {t.changePhoto}
              </button>
            )}
          </div>
          <div className="aspect-video w-full relative bg-slate-100/50">
            <img 
              src={preview} 
              alt="Source" 
              className="w-full h-full object-contain p-6"
            />
          </div>
          <div className="p-5 bg-white border-t border-slate-100 flex justify-between items-center">
            <div className="flex items-center space-x-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-sm font-bold text-slate-600">{t.yourPhoto}</span>
            </div>
            {isLoading && (
              <span className="text-sm text-violet-600 animate-pulse font-bold flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t.processing}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};