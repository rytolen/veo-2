import React, { useState, useCallback } from 'react';
import { generateSpeech, generateAffiliateText } from '../services/geminiService';

const voices = [
    { id: 'Algieba', label: 'Algieba (Male - Crisp & Direct)' },
    { id: 'Aoede', label: 'Aoede (Female - Professional & Confident)' },
    { id: 'Charon', label: 'Charon (Male - Authoritative & Deep)' },
    { id: 'Fenrir', label: 'Fenrir (Male - Deep & Intense)' },
    { id: 'Kore', label: 'Kore (Female - Calm & Soothing)' },
    { id: 'Leda', label: 'Leda (Female - Sophisticated & Soft)' },
    { id: 'Mnemosyne', label: 'Mnemosyne (Female - Dreamy & Soft)' },
    { id: 'Orpheus', label: 'Orpheus (Male - Resonant & Confident)' },
    { id: 'Puck', label: 'Puck (Male - Energetic & Playful)' },
    { id: 'Zephyr', label: 'Zephyr (Female - Balanced & Clear)' },
];

const styles = [
    { value: 'none', label: 'Default (Natural)' },
    { value: 'Speak in a friendly and persuasive affiliate tone: ', label: 'Affiliate (Friendly)' },
    { value: 'Speak in a high-energy, hyped-up affiliate tone: ', label: 'Affiliate (Hype)' },
    { value: 'Say cheerfully: ', label: 'Cheerful' },
    { value: 'Speak in a calm and soothing voice: ', label: 'Calm / ASMR-ish' },
    { value: 'Say in a professional and informative tone: ', label: 'Professional / News' },
    { value: 'Exclaim with excitement: ', label: 'Excited' },
    { value: 'Whisper this softly: ', label: 'Whisper' },
    { value: 'Speak like a dramatic storyteller: ', label: 'Dramatic / Storyteller' },
    { value: 'Speak fast and urgently: ', label: 'Urgent / Promo' },
];

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

const prices = ['19k', '29k', '39k', '49k', '99k', 'Custom', 'Tanpa Harga'];


const TextToSpeech: React.FC = () => {
    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState(voices[4].id); // Default to Kore
    const [selectedStyle, setSelectedStyle] = useState(styles[1].value); // Default to Affiliate style
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [generationCount, setGenerationCount] = useState(0);

    // State for the affiliate text generator
    const [productCategory, setProductCategory] = useState(products[0]);
    const [customProductCategory, setCustomProductCategory] = useState('');
    const [priceOption, setPriceOption] = useState(prices[2]); // Default to 39k
    const [customPrice, setCustomPrice] = useState('');
    const [isGeneratingText, setIsGeneratingText] = useState(false);
    const [textGeneratorError, setTextGeneratorError] = useState<string | null>(null);

    const handleGenerateAffiliateText = useCallback(async () => {
        setIsGeneratingText(true);
        setTextGeneratorError(null);
        setError(null);
        try {
            const finalProduct = productCategory === 'Lainnya (Input Manual)' ? customProductCategory : productCategory;
            if (!finalProduct.trim()) {
                throw new Error("Product category cannot be empty.");
            }

            let finalPrice = '';
            if (priceOption === 'Custom') {
                if (!customPrice.trim()) {
                    throw new Error("Custom price cannot be empty.");
                }
                finalPrice = customPrice;
            } else if (priceOption !== 'Tanpa Harga') {
                finalPrice = priceOption.replace('k', ' ribuan');
            }
            
            const generatedText = await generateAffiliateText(finalProduct, finalPrice);
            setText(generatedText);
        } catch (e: any) {
            setTextGeneratorError(e.message || 'Failed to generate text.');
        } finally {
            setIsGeneratingText(false);
        }
    }, [productCategory, customProductCategory, priceOption, customPrice]);


    const handleGenerateSpeech = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setTextGeneratorError(null);
        setAudioUrl(null);
        try {
            const promptText = selectedStyle === 'none' ? text : `${selectedStyle}${text}`;
            const url = await generateSpeech(promptText, selectedVoice);
            setAudioUrl(url);
            setGenerationCount(prev => prev + 1);
        } catch (e: any) {
            setError(e.message || 'Failed to generate audio.');
        } finally {
            setIsLoading(false);
        }
    }, [text, selectedVoice, selectedStyle]);

    const handleDownload = useCallback(() => {
        if (!audioUrl) return;
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = `soundke${generationCount}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [audioUrl, generationCount]);

    return (
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex flex-col space-y-6 max-w-2xl mx-auto">
                {/* Affiliate Text Generator Section */}
                <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-700 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-200 text-center">
                        Quick Affiliate Script Generator
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="product-category" className="block text-sm font-medium text-slate-300 mb-2">
                                Product Category
                            </label>
                            <select
                                id="product-category"
                                value={productCategory}
                                onChange={(e) => setProductCategory(e.target.value)}
                                disabled={isGeneratingText}
                                className="w-full bg-slate-900/70 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                            >
                                {products.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="price-option" className="block text-sm font-medium text-slate-300 mb-2">
                                Price
                            </label>
                            <select
                                id="price-option"
                                value={priceOption}
                                onChange={(e) => setPriceOption(e.target.value)}
                                disabled={isGeneratingText}
                                className="w-full bg-slate-900/70 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                            >
                                {prices.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    {productCategory === 'Lainnya (Input Manual)' && (
                        <div>
                            <label htmlFor="custom-product-category" className="block text-sm font-medium text-slate-300 mb-2">
                                Manual Product Name
                            </label>
                            <input
                                id="custom-product-category"
                                type="text"
                                value={customProductCategory}
                                onChange={(e) => setCustomProductCategory(e.target.value)}
                                className="w-full bg-slate-900/70 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 placeholder-slate-500"
                                placeholder="e.g., Kemeja Flanel Pria"
                                disabled={isGeneratingText}
                            />
                        </div>
                    )}
                    
                    {priceOption === 'Custom' && (
                        <div>
                            <label htmlFor="custom-price" className="block text-sm font-medium text-slate-300 mb-2">
                                Custom Price (e.g., "150 ribuan")
                            </label>
                            <input
                                id="custom-price"
                                type="text"
                                value={customPrice}
                                onChange={(e) => setCustomPrice(e.target.value)}
                                className="w-full bg-slate-900/70 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 placeholder-slate-500"
                                placeholder="Enter price text, e.g. 150 ribu"
                                disabled={isGeneratingText}
                            />
                        </div>
                    )}
                    <button
                        onClick={handleGenerateAffiliateText}
                        disabled={isGeneratingText}
                        className="w-full py-2 px-4 text-base font-semibold rounded-lg transition-all duration-300 ease-in-out bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingText ? 'Generating Text...' : '✨ Generate Script'}
                    </button>
                    {isGeneratingText && (
                        <div className="flex justify-center items-center gap-2 text-sm text-slate-400">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-cyan-500"></div>
                            <span>AI is writing...</span>
                        </div>
                    )}
                    {textGeneratorError && (
                        <div className="text-center p-2 bg-red-900/30 border border-red-500/50 rounded-lg text-sm">
                            <p className="text-red-400">{textGeneratorError}</p>
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="tts-text" className="block text-sm font-medium text-slate-300 mb-2">
                        Text to Synthesize
                    </label>
                    <textarea
                        id="tts-text"
                        rows={6}
                        className="w-full bg-slate-900/70 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none placeholder-slate-500"
                        placeholder="Generate a script above or enter your own text to convert to speech..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="voice-select" className="block text-sm font-medium text-slate-300 mb-2">
                            Voice
                        </label>
                        <select
                            id="voice-select"
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-slate-900/70 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                        >
                            {voices.map(voice => (
                                <option key={voice.id} value={voice.id}>{voice.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="style-select" className="block text-sm font-medium text-slate-300 mb-2">
                            Speaking Style
                        </label>
                        <select
                            id="style-select"
                            value={selectedStyle}
                            onChange={(e) => setSelectedStyle(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-slate-900/70 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                        >
                            {styles.map(style => (
                                <option key={style.value} value={style.value}>{style.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <button
                    onClick={handleGenerateSpeech}
                    disabled={!text || isLoading}
                    className="w-full py-3 px-4 text-lg font-semibold rounded-lg transition-all duration-300 ease-in-out bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105"
                >
                    {isLoading ? 'Generating Speech...' : 'Generate Speech'}
                </button>

                {error && (
                    <div className="text-center p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                        <p className="text-red-400 font-semibold text-sm">{error}</p>
                    </div>
                )}
                 {isLoading && (
                    <div className="text-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                        <p className="text-slate-400 mt-2 text-sm">Synthesizing audio...</p>
                    </div>
                )}


                {audioUrl && !isLoading && (
                    <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                        <audio controls autoPlay className="w-full" key={audioUrl}>
                            <source src={audioUrl} type="audio/wav" />
                            Your browser does not support the audio element.
                        </audio>
                        <div className="text-center mt-3">
                            <button
                                onClick={handleDownload}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                                aria-label={`Download audio file soundke${generationCount}.wav`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Download (soundke{generationCount}.wav)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TextToSpeech;