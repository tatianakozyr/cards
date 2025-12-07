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
    <div className="w-full max-w-2xl mx-auto mb-8">
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
          className={`border-3 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer
            ${isLoading ? 'border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 bg-white shadow-sm'}
          `}
        >
          <div className="mx-auto h-16 w-16 text-indigo-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">{t.uploadTitle}</h3>
          <p className="text-gray-500">{t.uploadSubtitle}</p>
        </div>
      ) : (
        <div className="relative group rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">
          <div className="absolute top-0 left-0 w-full h-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
            {!isLoading && (
              <button 
                onClick={triggerUpload}
                className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors"
              >
                {t.changePhoto}
              </button>
            )}
          </div>
          <div className="aspect-video w-full relative bg-gray-100">
            <img 
              src={preview} 
              alt="Source" 
              className="w-full h-full object-contain p-4"
            />
          </div>
          <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">{t.yourPhoto}</span>
            {isLoading && (
              <span className="text-sm text-indigo-600 animate-pulse font-medium">{t.processing}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};