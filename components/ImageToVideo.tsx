import React, { useState, useEffect, useCallback } from 'react';
import { generateVideoFromImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import ImageUploader from './ImageUploader';
import LoadingIndicator from './LoadingIndicator';
import VideoPlayer from './VideoPlayer';

const ImageToVideo: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (imageFile) {
            const objectUrl = URL.createObjectURL(imageFile);
            setImagePreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
        setImagePreview(null);
    }, [imageFile]);

    const handleImageSelect = (file: File) => {
        setImageFile(file);
        setGeneratedVideoUrl(null);
        setError(null);
    };

    const handleGenerateVideo = useCallback(async () => {
        if (!imageFile) {
            setError('Please upload an image first.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedVideoUrl(null);

        try {
            const { base64, mimeType } = await fileToBase64(imageFile);
            const videoBlobUrl = await generateVideoFromImage(base64, mimeType, prompt);
            setGeneratedVideoUrl(videoBlobUrl);
        } catch (e: any) {
            console.error(e);
            let errorMessage = e.message || 'An unexpected error occurred.';
            if (e.message?.includes('API Key')) {
                 errorMessage = `There's an issue with your API Key. Please click "Change API Key" to enter a valid one. Error: ${e.message}`;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, prompt]);

    return (
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col space-y-6">
                    <ImageUploader onImageSelect={handleImageSelect} imagePreviewUrl={imagePreview} />
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">
                            Prompt (Optional)
                        </label>
                        <textarea
                            id="prompt"
                            rows={4}
                            className="w-full bg-slate-900/70 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none placeholder-slate-500"
                            placeholder="e.g., A gentle breeze rustles the leaves, cinematic lighting"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        onClick={handleGenerateVideo}
                        disabled={!imageFile || isLoading}
                        className="w-full py-3 px-4 text-lg font-semibold rounded-lg transition-all duration-300 ease-in-out bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105"
                    >
                        {isLoading ? 'Generating Video...' : 'Generate Video'}
                    </button>
                </div>

                <div className="flex items-center justify-center bg-slate-900/50 rounded-xl border border-dashed border-slate-700 min-h-[400px] lg:min-h-full aspect-[9/16] max-h-[70vh] mx-auto">
                    {isLoading && <LoadingIndicator />}
                    {error && !isLoading && (
                        <div className="text-center p-4">
                            <p className="text-red-400 font-semibold">Error</p>
                            <p className="text-slate-400 mt-2 text-sm max-w-sm">{error}</p>
                        </div>
                    )}
                    {generatedVideoUrl && !isLoading && (
                        <VideoPlayer videoUrl={generatedVideoUrl} />
                    )}
                    {!isLoading && !error && !generatedVideoUrl && (
                        <div className="text-center text-slate-500 p-4">
                            <p className="font-semibold">Your 9:16 video will appear here</p>
                            <p className="text-sm mt-1">Upload an image and click generate</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageToVideo;
