import React, { useState, useCallback } from 'react';
import { generateSpeech } from '../services/geminiService';

const voices = ['Kore', 'Puck', 'Zephyr', 'Fenrir', 'Charon'];

const styles = [
    { value: 'none', label: 'Default' },
    { value: 'Speak in a friendly and persuasive affiliate tone: ', label: 'Affiliate' },
    { value: 'Say cheerfully: ', label: 'Cheerful' },
    { value: 'Speak in a calm and soothing voice: ', label: 'Calm' },
    { value: 'Say in a professional and informative tone: ', label: 'Professional' },
    { value: 'Exclaim with excitement: ', label: 'Excited' },
];


const TextToSpeech: React.FC = () => {
    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState(voices[0]);
    const [selectedStyle, setSelectedStyle] = useState(styles[1].value); // Default to Affiliate style
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateSpeech = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setAudioUrl(null);
        try {
            const promptText = selectedStyle === 'none' ? text : `${selectedStyle}${text}`;
            const url = await generateSpeech(promptText, selectedVoice);
            setAudioUrl(url);
        } catch (e: any) {
            setError(e.message || 'Failed to generate audio.');
        } finally {
            setIsLoading(false);
        }
    }, [text, selectedVoice, selectedStyle]);

    return (
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex flex-col space-y-6 max-w-2xl mx-auto">
                <div>
                    <label htmlFor="tts-text" className="block text-sm font-medium text-slate-300 mb-2">
                        Text to Synthesize
                    </label>
                    <textarea
                        id="tts-text"
                        rows={6}
                        className="w-full bg-slate-900/70 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none placeholder-slate-500"
                        placeholder="Enter text to convert to speech..."
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
                                <option key={voice} value={voice}>{voice}</option>
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default TextToSpeech;
