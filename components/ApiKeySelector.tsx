import React, { useState } from 'react';
import { setApiKey } from '../services/apiKeyService';

interface ApiKeySelectorProps {
    onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
    const [key, setKey] = useState('');

    const handleSaveKey = (e: React.FormEvent) => {
        e.preventDefault();
        if (key.trim()) {
            setApiKey(key.trim());
            onKeySelected();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="relative max-w-lg w-full bg-slate-800/30 backdrop-blur-lg p-8 rounded-2xl shadow-2xl text-center border border-white/10">
                 <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
                 <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-pink-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-4000"></div>

                <div className="relative">
                    <h2 className="text-3xl font-bold text-white mb-4">Enter Your Gemini API Key</h2>
                    <p className="text-slate-400 mb-6">
                        Your key is stored securely in your browser's local storage and is never sent to any server except Google's API.
                    </p>
                    <form onSubmit={handleSaveKey}>
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 placeholder-slate-500"
                            placeholder="Paste your API Key here"
                            aria-label="API Key Input"
                        />
                        <button
                            type="submit"
                            disabled={!key.trim()}
                            className="w-full mt-4 py-3 px-4 text-lg font-semibold rounded-lg transition-all duration-300 ease-in-out bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                            Save and Continue
                        </button>
                    </form>
                    <a 
                        href="https://ai.google.dev/gemini-api/docs/api-key" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        How to get an API key
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ApiKeySelector;
