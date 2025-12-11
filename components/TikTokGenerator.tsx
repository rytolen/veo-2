import React, { useState, useCallback } from 'react';
import { generateTikTokContent } from '../services/geminiService';

const products = [
    'Jam Tangan',
    'Smartwatch',
    'Cincin Jam Tangan',
    'Tas Wanita',
    'Sepatu Wanita',
    'Headset Bluetooth',
    'Power Bank',
    'Lampu LED Estetik',
    'Speaker Bluetooth',
    'T-Shirt Polos',
    'Sepatu Sneakers',
    'Produk Skincare',
    'Lainnya (Input Manual)',
];

const TikTokGenerator: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState(products[0]);
    const [customProduct, setCustomProduct] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedContent(null);
        setIsCopied(false);
        try {
            const finalProduct = selectedProduct === 'Lainnya (Input Manual)' ? customProduct : selectedProduct;
            if (!finalProduct.trim()) {
                throw new Error("Product name cannot be empty.");
            }
            const content = await generateTikTokContent(finalProduct);
            setGeneratedContent(content);
        } catch (e: any) {
            setError(e.message || 'Failed to generate content.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedProduct, customProduct]);

    const handleCopy = () => {
        if (generatedContent) {
            navigator.clipboard.writeText(generatedContent);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex flex-col space-y-6 max-w-2xl mx-auto">
                <div>
                    <h2 className="text-xl font-bold text-center mb-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">TikTok Affiliate Content</h2>
                    <p className="text-center text-slate-400 text-sm mb-6">Generate descriptions & tags for your affiliate videos.</p>
                </div>

                <div>
                    <label htmlFor="product-select" className="block text-sm font-medium text-slate-300 mb-2">
                        Select Product
                    </label>
                    <select
                        id="product-select"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-slate-900/70 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    >
                        {products.map(product => (
                            <option key={product} value={product}>{product}</option>
                        ))}
                    </select>
                </div>
                
                {selectedProduct === 'Lainnya (Input Manual)' && (
                    <div>
                        <label htmlFor="custom-product" className="block text-sm font-medium text-slate-300 mb-2">
                            Manual Product Name
                        </label>
                        <input
                            id="custom-product"
                            type="text"
                            value={customProduct}
                            onChange={(e) => setCustomProduct(e.target.value)}
                            className="w-full bg-slate-900/70 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 placeholder-slate-500"
                            placeholder="e.g., Kemeja Flanel Pria"
                            disabled={isLoading}
                        />
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full py-3 px-4 text-lg font-semibold rounded-lg transition-all duration-300 ease-in-out bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105"
                >
                    {isLoading ? 'Generating...' : 'Generate Content'}
                </button>

                {error && (
                    <div className="text-center p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                        <p className="text-red-400 font-semibold text-sm">{error}</p>
                    </div>
                )}
                 {isLoading && (
                    <div className="text-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                        <p className="text-slate-400 mt-2 text-sm">Thinking of catchy phrases...</p>
                    </div>
                )}

                {generatedContent && !isLoading && (
                    <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4">
                        <div className="flex justify-between items-center">
                             <h3 className="text-lg font-semibold text-slate-200">Generated Content</h3>
                             <button onClick={handleCopy} className="px-3 py-1 text-sm rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors disabled:opacity-50" disabled={isCopied}>
                                {isCopied ? 'Copied!' : 'Copy'}
                             </button>
                        </div>
                       
                        <pre className="whitespace-pre-wrap break-words font-sans text-slate-300 bg-slate-900/70 p-4 rounded-md text-sm">
                            {generatedContent}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TikTokGenerator;