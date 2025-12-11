import React, { useState, useEffect, useCallback } from 'react';
import ApiKeySelector from './components/ApiKeySelector';
import TextToSpeech from './components/TextToSpeech';
import TikTokGenerator from './components/TikTokGenerator';
import { hasApiKey, clearApiKey } from './services/apiKeyService';

type View = 'tts' | 'tiktok';

const App: React.FC = () => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [activeView, setActiveView] = useState<View>('tts');
    const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

    useEffect(() => {
        setApiKeySelected(hasApiKey());

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleKeySelected = useCallback(() => {
        setApiKeySelected(true);
    }, []);
    
    const handleChangeApiKey = () => {
        clearApiKey();
        setApiKeySelected(false);
    };

    const handleInstallClick = async () => {
        if (!installPrompt) return;
        
        // The type for `installPrompt` is `Event`, but it has a `prompt()` method in this context.
        // We cast it to `any` to access this method.
        const promptEvent = installPrompt as any;
        const result = await promptEvent.prompt();
        
        console.log(`Install prompt outcome: ${result.outcome}`);
        setInstallPrompt(null);
    };

    const NavButton: React.FC<{ view: View; label: string }> = ({ view, label }) => (
        <button
            onClick={() => setActiveView(view)}
            className={`relative px-4 py-2 text-sm sm:text-base font-medium rounded-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                activeView === view
                    ? 'text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
        >
            {activeView === view && (
                <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md -z-10"
                 />
            )}
            {label}
        </button>
    );

    if (!apiKeySelected) {
        return <ApiKeySelector onKeySelected={handleKeySelected} />;
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/40 -z-10" />
            <div className="w-full max-w-5xl mx-auto">
                <header className="flex justify-between items-center mb-6 sm:mb-8">
                    <div className="text-left">
                        <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            Gemini Creative Suite
                        </h1>
                        <p className="mt-1 text-sm sm:text-base text-slate-400">
                            AI-powered content generation
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                         {installPrompt && (
                            <button
                                onClick={handleInstallClick}
                                className="text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 rounded-md border border-purple-500 hover:opacity-90 transition-opacity"
                                title="Install App"
                            >
                                Install App
                            </button>
                        )}
                        <button 
                            onClick={handleChangeApiKey}
                            className="text-xs text-slate-400 hover:text-purple-400 transition-colors bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-700 hover:border-purple-500"
                        >
                            Change Key
                        </button>
                    </div>
                </header>

                <nav className="flex justify-center items-center gap-2 sm:gap-4 mb-8 p-1.5 bg-slate-800/60 rounded-lg border border-slate-700 max-w-md mx-auto">
                    <NavButton view="tts" label="Text to Speech" />
                    <NavButton view="tiktok" label="TikTok Content" />
                </nav>

                <main>
                    {activeView === 'tts' && <TextToSpeech />}
                    {activeView === 'tiktok' && <TikTokGenerator />}
                </main>
            </div>
        </div>
    );
};

export default App;