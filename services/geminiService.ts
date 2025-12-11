
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

export const generateAffiliateText = async (productCategory: string, price: string): Promise<string> => {
    if (!productCategory.trim()) {
        throw new Error("Product category cannot be empty.");
    }

    const ai = getAuthenticatedAi();
    let prompt: string;

    const baseInstruction = `
    Tugas: Buat skrip voice-over untuk video TikTok afiliasi.
    Durasi: Maksimal 10 detik (sekitar 20-30 kata).
    Tone: Santai, Elegan, dan Profesional (hindari bahasa yang terlalu "lebay" atau "hype" berlebihan).
    Struktur Wajib:
    1. Deskripsi Singkat: Jelaskan solusi atau keunggulan utama produk dalam 1 kalimat yang mengalir.
    2. Closing: Kalimat penutup yang meyakinkan.
    3. CTA (Call to Action): Wajib diakhiri dengan kalimat "Checkout di keranjang kuning sekarang".
    
    PENTING: Output hanya teks skripnya saja, jangan pakai tanda kutip atau label.`;

    if (price && price.trim() !== '') {
        prompt = `${baseInstruction}
        
        Produk: '${productCategory}'
        Harga Promo: '${price}'
        
        Contoh Output:
        Tampil lebih percaya diri dengan Smartwatch desain premium ini, fitur kesehatannya lengkap banget. Mumpung lagi promo cuma 99 ribuan aja. Yuk, checkout di keranjang kuning sekarang.`;
    } else {
        prompt = `${baseInstruction}
        
        Produk: '${productCategory}'
        Fokus: Keunggulan kualitas atau stok terbatas.
        
        Contoh Output:
        Smartwatch ini punya desain premium yang bikin penampilan kamu makin elegan setiap hari. Stoknya makin menipis nih. Jangan sampai kehabisan, checkout di keranjang kuning sekarang.`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    const text = response.text;
    if (!text) {
        throw new Error("Failed to generate text. The model returned an empty response.");
    }
    
    return text.trim();
};

export const generateTikTokContent = async (productName: string): Promise<string> => {
    if (!productName.trim()) {
        throw new Error("Product name cannot be empty.");
    }

    const ai = getAuthenticatedAi();
    const prompt = `Buat deskripsi video TikTok yang menarik dan singkat (1-2 kalimat) untuk mempromosikan produk afiliasi '${productName}'. Langsung lanjutkan dengan daftar tagar yang relevan di baris baru.

PENTING: Jangan sertakan judul atau label apa pun seperti "Deskripsi:" atau "Tagar:". Hanya berikan teks deskripsi dan tagar yang bisa langsung disalin.

Contoh:
Upgrade gayamu dengan jam tangan canggih ini! Desainnya keren, fiturnya lengkap. Checkout di keranjang kuning!
#racuntiktok #tiktokaffiliate #${productName.toLowerCase().replace(/\s/g, '')} #smartwatchkeren`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const text = response.text;
    if (!text) {
        throw new Error("Failed to generate content. The model returned an empty response.");
    }
    
    return text.trim();
};
