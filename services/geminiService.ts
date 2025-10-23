
import { GoogleGenAI, Modality } from "@google/genai";
import { createWavBlobUrlFromBase64 } from "../utils/audioUtils";
import { getApiKey } from "./apiKeyService";

// Polling interval in milliseconds
const POLLING_INTERVAL = 10000;

const getAuthenticatedAi = () => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API Key not found. Please set your API Key.");
    }
    return new GoogleGenAI({ apiKey });
};

export const generateVideoFromImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = getAuthenticatedAi();
    const apiKey = getApiKey(); // Also needed for the fetch call

    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt || 'Animate this image beautifully.', // Provide a default prompt if empty
        image: {
            imageBytes: base64Image,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1,
            aspectRatio: '9:16'
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
        throw new Error("Video generation succeeded, but no download link was found.");
    }
    
    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Video download failed:", errorBody);
        if (response.status === 403 || response.status === 400) {
             throw new Error("API Key is invalid or lacks permissions to access the video file.");
        }
        throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};

export const generateSpeech = async (text: string, voice: string): Promise<string> => {
    if (!text.trim()) {
        throw new Error("Text cannot be empty.");
    }
    
    const ai = getAuthenticatedAi();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
        throw new Error("Audio generation failed. No audio data received.");
    }

    return createWavBlobUrlFromBase64(base64Audio);
};
