
import { GoogleGenAI, Modality } from "@google/genai";
import { createWavBlobUrlFromBase64 } from "../utils/audioUtils";
import { getApiKey } from "./apiKeyService";

const getAuthenticatedAi = () => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API Key not found. Please set your API Key.");
    }
    return new GoogleGenAI({ apiKey });
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

// Helper function to get a random hook to avoid templates
const getRandomHook = () => {
    const hooks = [
        "Mulai dengan pertanyaan retoris yang relatable (Contoh: 'Pernah gak sih lo ngerasa...?').",
        "Mulai dengan ekspresi kaget atau kagum (Contoh: 'Jujurly gue kaget banget sama hasilnya...').",
        "Mulai dengan menunjuk masalah spesifik (Contoh: 'Buat lo yang sering badmood gara-gara...').",
        "Mulai dengan solusi 'to-the-point' (Contoh: 'Ini dia rahasia tampil kece tanpa ribet...').",
        "Mulai dengan ajakan santai (Contoh: 'Sini gue kasih tau racun baru...').",
        "Mulai dengan statement kontroversial/unik (Contoh: 'Siapa bilang barang murah gak bisa bagus?')."
    ];
    return hooks[Math.floor(Math.random() * hooks.length)];
};

export const generateScriptFromImage = async (base64Image: string, mimeType: string, productCategory?: string): Promise<string> => {
    const ai = getAuthenticatedAi();
    const randomHook = getRandomHook();

    let prompt = `Analisis gambar ini dengan teliti.`;
    
    if (productCategory && productCategory !== 'Lainnya (Umum)') {
        prompt += `\nKonteks Produk: ${productCategory}.\n`;
    }

    prompt += `
    TUGAS:
    Bertindaklah sebagai teman tongkrongan (Bestie Mode). 
    Buatkan naskah voice-over TikTok **maksimal 10 detik** untuk mempromosikan produk di gambar tersebut.
    
    STYLE GUIDELINE:
    1. **Bahasa:** Bahasa Indonesia percakapan sehari-hari/gaul (Lo/Gue, anjay, banget, nih). Jangan kaku.
    2. **Feel/Vibes:** Deskripsikan visual produk di gambar (warnanya, bentuknya, atau kesannya) lalu hubungkan dengan manfaatnya.
    3. **ANTI TEMPLATE:** Jangan gunakan kalimat pembuka standar. Gunakan variasi.
    4. **Angle Hook:** ${randomHook}
    5. **CTA:** Akhiri dengan: "Cek keranjang kuning sekarang".

    Output: Hanya teks naskah final.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { mimeType, data: base64Image } },
                { text: prompt }
            ]
        }
    });

    const text = response.text;
    if (!text) {
        throw new Error("Failed to generate script from image.");
    }
    return text.trim();
};

export const generateAffiliateText = async (productCategory: string, price: string): Promise<string> => {
    if (!productCategory.trim()) {
        throw new Error("Product category cannot be empty.");
    }

    const ai = getAuthenticatedAi();
    const randomHook = getRandomHook();

    const baseInstruction = `
    Bertindaklah sebagai teman tongkrongan yang lagi merekomendasikan barang bagus (Bestie Mode). 
    Buatkan naskah voice-over TikTok **maksimal 10 detik** (sekitar 20-25 kata).
    
    STYLE GUIDELINE:
    1. **Bahasa:** Gunakan Bahasa Indonesia percakapan sehari-hari yang luwes (Lo/Gue, anjay, banget, nih). HINDARI kata baku atau kaku.
    2. **Feel/Vibes:** Fokus pada "experience" atau rasa saat pakai produk.
    3. **PENTING - ANTI TEMPLATE:** 
       - JANGAN SELALU MULAI dengan kata "Sekali semprot", "Sekali pakai", atau "Produk ini". Itu membosankan.
       - Gunakan variasi kata pembuka yang beda setiap kali generate.
    4. **Angle Hook Kali Ini:** ${randomHook}
    5. **CTA:** Wajib diakhiri dengan: "Cek keranjang kuning sekarang" (atau variasi mirip).
    
    Output: Hanya teks naskah final.
    `;

    let prompt: string;

    if (price && price.trim() !== '') {
        prompt = `${baseInstruction}
        
        Produk: '${productCategory}'
        Harga: '${price}'
        
        Ingat: Jangan kaku. Buat seolah lo lagi ngomong langsung ke temen deket.
        `;
    } else {
        prompt = `${baseInstruction}
        
        Produk: '${productCategory}'
        Fokus: Kualitas/Manfaat utama.
        
        Ingat: Jangan kaku. Eksplorasi kalimat pembuka yang menarik selain "Sekali pakai".
        `;
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

export const optimizeScript = async (originalText: string): Promise<string> => {
    if (!originalText.trim()) {
        throw new Error("Input text cannot be empty.");
    }

    const ai = getAuthenticatedAi();
    
    const hooks = [
        "pertanyaan", 
        "ekspresi kagum", 
        "masalah relatable", 
        "ajakan langsung"
    ];
    const randomHookType = hooks[Math.floor(Math.random() * hooks.length)];

    const prompt = `
    Rewrite teks berikut jadi naskah TikTok yang super santai, natural, dan gak kaku (durasi max 10 detik).
    
    Teks Asli: "${originalText}"
    
    Instruksi Rewrite:
    1. Gunakan bahasa "lo/gue" atau bahasa lisan yang mengalir.
    2. JANGAN GUNAKAN pola "Sekali semprot..." atau template kaku lainnya.
    3. Coba mulai kalimat dengan gaya: ${randomHookType}.
    4. Buat lebih bervariasi dan tidak terdengar seperti robot.
    5. WAJIB Ending: "Cek keranjang kuning sekarang" (atau sejenisnya).
    
    Output: Hanya teks hasil rewrite.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    const text = response.text;
    if (!text) {
        throw new Error("Failed to optimize text.");
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
