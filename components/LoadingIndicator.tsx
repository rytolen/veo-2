
import React, { useState, useEffect } from 'react';

const messages = [
    "Warming up the digital canvas...",
    "Teaching pixels to dance...",
    "Assembling the video frames...",
    "This can take a few minutes, please wait...",
    "Rendering the final masterpiece...",
    "Almost there, adding the final touches..."
];

const LoadingIndicator: React.FC = () => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="text-center p-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-300">Generating Video</p>
            <p className="text-gray-400 mt-2">{messages[currentMessageIndex]}</p>
        </div>
    );
};

export default LoadingIndicator;
