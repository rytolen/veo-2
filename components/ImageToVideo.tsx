
import React, { useState, useEffect, useCallback } from 'react';
import { generateScriptFromImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import ImageUploader from './ImageUploader';

const products = [
    'Jam Tangan',
    'Smartwatch',
    'Tas Wanita',
    'Sepatu Sneakers',
    'Parfum',
    'Produk Skincare',
    'Makanan / Minuman',
    'Fashion / Baju',
    'Gadget / Elektronik',
    'Lainnya (Umum)',
];

const ImageToScript: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState(products[0]);
    
    // Script Generation State
    const [generatedScript, setGeneratedScript] = useState<string>('');
    const [isScriptLoading, setIsScriptLoading] = useState<boolean>(false);
    const [scriptError, setScriptError] = useState<string | null>(null);
    const [scriptCopied, setScriptCopied] = useState(false);

    useEffect(() => {
        if (imageFile) {
            const objectUrl = URL.createObjectURL(imageFile);
            setImagePreview(objectUrl);
            
            // Trigger script generation when image OR category changes
            handleGenerateScript(imageFile, selectedProduct);

            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setImagePreview(null);
            setGeneratedScript('');
        }
    }, [imageFile, selectedProduct]);

    const handleGenerateScript = async (file: File, category: string) => {
        setIsScriptLoading(true);
        setScriptError(null);
        try {
            const { base64, mimeType } = await fileToBase64(file);
            const script = await generateScriptFromImage(base64, mimeType, category);
            setGeneratedScript(script);
        } catch (e: any) {
            console.error("Script generation failed", e);
            let msg = "Could not generate script from image.";
            if (e.message?.includes('API Key')) msg = "API Key Error. Please check your key.";
            setScriptError(msg);
        } finally {
            setIsScriptLoading(false);
        }
    };

    const handleImageSelect = (file: File) => {
        setImageFile(file);
        setGeneratedScript(''); // Reset script immediately
    };

    const handleRegenerate = () => {
        if (imageFile) {
            handleGenerateScript(imageFile, selectedProduct);
        }
    };

    const copyScript = () => {
        if (generatedScript) {
            navigator.clipboard.writeText(generatedScript);
            setScriptCopied(true);
            setTimeout(() => setScriptCopied(false), 2000);
        }
    };

    return (
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/10">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Image & Inputs */}
                <div className="flex flex-col space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
                            Image to Script Generator
                        </h2>
                        <ImageUploader onImageSelect={handleImageSelect} imagePreviewUrl={imagePreview} />
                    </div>

                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4">
                        <div>
                            <label htmlFor="product-select" className="block text-sm font-medium text-slate-300 mb-2">
                                Product Category
                            </label>
                            <select
                                id="product-select"
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                disabled={isScriptLoading}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            >
                                {products.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">
                                Helps the AI understand the product context better.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Script Output */}
                <div className="flex flex-col h-full">
                    <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                        Generated Script
                        {isScriptLoading && <span className="text-xs text-cyan-400 font-normal animate-pulse">(Thinking...)</span>}
                    </h3>
                    
                    <div className="flex-grow bg-slate-900/60 rounded-xl border border-slate-700 p-6 shadow-inner relative flex flex-col justify-between min-h-[300px]">
                        {isScriptLoading ? (
                             <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-70">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
                                <p className="text-slate-400 text-sm animate-pulse">Analyzing image & writing hook...</p>
                            </div>
                        ) : !imageFile ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                <p>Upload an image to generate script</p>
                            </div>
                        ) : scriptError ? (
                            <div className="text-center text-red-400 my-auto">
                                <p>{scriptError}</p>
                                <button onClick={handleRegenerate} className="mt-2 text-sm underline hover:text-red-300">Try Again</button>
                            </div>
                        ) : (
                            <div className="relative h-full flex flex-col">
                                <textarea
                                    readOnly
                                    value={generatedScript}
                                    className="w-full h-full bg-transparent border-none text-slate-200 text-lg leading-relaxed focus:ring-0 resize-none font-medium"
                                />
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={handleRegenerate}
                            disabled={!imageFile || isScriptLoading}
                            className="flex-1 py-2 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-colors disabled:opacity-50"
                        >
                            Regenerate
                        </button>
                        <button
                            onClick={copyScript}
                            disabled={!generatedScript || isScriptLoading}
                            className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 text-white font-semibold transition-all disabled:opacity-50"
                        >
                            {scriptCopied ? 'Copied!' : 'Copy Script'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageToScript;
