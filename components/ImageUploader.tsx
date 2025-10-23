import React, { useRef } from 'react';

interface ImageUploaderProps {
    onImageSelect: (file: File) => void;
    imagePreviewUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, imagePreviewUrl }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageSelect(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                Upload Image
            </label>
            <div
                onClick={handleClick}
                className="mt-1 flex justify-center p-6 border-2 border-slate-700 border-dashed rounded-md cursor-pointer hover:border-purple-500 transition-colors bg-slate-900/50 hover:bg-slate-900"
            >
                <div className="space-y-1 text-center w-full">
                    {imagePreviewUrl ? (
                        <img src={imagePreviewUrl} alt="Preview" className="mx-auto h-48 w-auto rounded-lg object-contain" />
                    ) : (
                        <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 4v.01M28 8L16 20m12-12v12m0 0h12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                    <div className="flex text-sm text-slate-400 justify-center">
                        <p className="pl-1 font-semibold">{imagePreviewUrl ? 'Click to change image' : 'Click to upload an image'}</p>
                    </div>
                    <p className="text-xs text-slate-500">
                        PNG, JPG, GIF up to 10MB
                    </p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
};

export default ImageUploader;
