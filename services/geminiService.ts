
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAIClient = () => {
    // Note: In a real app, API key should come from env. 
    // Here we assume process.env.API_KEY is available as per instructions.
    if (!process.env.API_KEY) {
        throw new Error("API Key missing");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const editImageWithGemini = async (base64Image: string, prompt: string, mimeType: string): Promise<string> => {
    const ai = getAIClient();
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Image
                        }
                    },
                    {
                        text: prompt
                    }
                ]
            }
        });

        // Parse response for image
        if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                }
            }
        }
        throw new Error("No image generated");
    } catch (error) {
        console.error("Gemini Image Edit Error", error);
        throw error;
    }
};

export interface SearchResult {
    text: string;
    links: { title: string; uri: string }[];
}

export const searchTeachingResources = async (query: string): Promise<SearchResult> => {
    const ai = getAIClient();
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Search for this topic related to Arabic teaching: ${query}. Provide a summary and list relevant resources.`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text || "No results found.";
        
        const links: { title: string; uri: string }[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        if (chunks) {
            chunks.forEach((chunk: any) => {
                if (chunk.web) {
                    links.push({ title: chunk.web.title, uri: chunk.web.uri });
                }
            });
        }

        return { text, links };
    } catch (error) {
        console.error("Gemini Search Error", error);
        throw error;
    }
};

export const generateReportComment = async (studentName: string, avgFormatif: number, avgSumatif: number, nilaiSas: number, finalScore: number): Promise<string> => {
    const ai = getAIClient();
    try {
        const prompt = `
            Anda adalah Wali Kelas di MTsN 2 Bulukumba. Buatkan catatan rapor singkat (maksimal 2 kalimat) dalam Bahasa Indonesia untuk siswa bernama "${studentName}".
            
            Data Nilai (Bahasa Arab):
            - Rata-rata Formatif (Tugas/Harian): ${avgFormatif.toFixed(0)}
            - Rata-rata Sumatif (Ulangan): ${avgSumatif.toFixed(0)}
            - Sumatif Akhir Semester (Ujian): ${nilaiSas.toFixed(0)}
            - Nilai Akhir: ${finalScore.toFixed(0)}
            - KKM (Batas Tuntas): 72

            Aturan:
            1. Jika Nilai Akhir >= 90: Puji pencapaian luar biasa dan pertahankan.
            2. Jika Nilai Akhir >= 72 dan < 90: Apresiasi usaha, namun berikan saran spesifik (misal: tingkatkan hafalan kosa kata jika formatif rendah, atau teliti saat ujian jika SAS rendah).
            3. Jika Nilai Akhir < 72: Gunakan bahasa yang memotivasi (jangan memarahi), sarankan belajar lebih giat dan bertanya pada guru.
            4. Gunakan nada bicara yang bijak, islami, dan menyemangati.
        `;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        return response.text || "Teruslah belajar dengan giat.";
    } catch (error) {
        console.error("Gemini Comment Gen Error", error);
        return "Teruslah belajar dan berdoa untuk kesuksesanmu.";
    }
};
