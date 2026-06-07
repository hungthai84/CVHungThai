import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

export const useSpeechSynthesis = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const cancel = useCallback(() => {
        if (audioSourceRef.current) {
            try {
                audioSourceRef.current.stop();
                audioSourceRef.current.disconnect();
            } catch(e) {}
            audioSourceRef.current = null;
        }
        setIsSpeaking(false);
    }, []);

    const speak = useCallback(async (text: string, options: { voiceName?: string; lang?: 'vi' | 'en'; onEnd?: () => void; rate?: number } = {}) => {
        cancel();
        
        if (!text.trim()) {
            options.onEnd?.();
            return;
        }

        setIsSpeaking(true);
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                console.warn("GEMINI_API_KEY is not defined. Cannot use Gemini TTS.");
                setIsSpeaking(false);
                options.onEnd?.();
                return;
            }

            const ai = new GoogleGenAI({ apiKey });
            
            // Determine Gemini TTS prebuilt voice based on requested voice properties:
            // - Male voices: "Fenrir", "Puck", "Charon"
            // - Female voices: "Kore", "Aoede"
            let voiceName = 'Fenrir'; // default to a professional male voice
            if (options.voiceName) {
                const lowerName = options.voiceName.toLowerCase();
                if (lowerName.includes('hoài my') || lowerName.includes('female') || lowerName.includes('nữ')) {
                    voiceName = 'Aoede'; // female voice for user/feedback
                } else if (lowerName.includes('nam') || lowerName.includes('male') || lowerName.includes('minh')) {
                    voiceName = 'Fenrir'; // male voice
                } else {
                    voiceName = 'Fenrir'; // default male voice
                }
            }

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text }] }],
                config: {
                    responseModalities: ["AUDIO"] as any,
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                audioCtxRef.current = audioCtx;
                
                const binaryString = atob(base64Audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const buffer = new Int16Array(bytes.buffer);
                const float32Data = new Float32Array(buffer.length);
                for (let i = 0; i < buffer.length; i++) {
                    float32Data[i] = buffer[i] / 32768.0;
                }
                const audioBuffer = audioCtx.createBuffer(1, float32Data.length, 24000);
                audioBuffer.getChannelData(0).set(float32Data);
                
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                // Increase the playback speed for faster reading
                source.playbackRate.value = options.rate || 1.25;
                source.connect(audioCtx.destination);
                source.onended = () => {
                   setIsSpeaking(false);
                   options.onEnd?.();
                };
                audioSourceRef.current = source;
                source.start();
            } else {
                setIsSpeaking(false);
                options.onEnd?.();
            }
        } catch (err) {
            console.error("Gemini TTS Error:", err);
            setIsSpeaking(false);
            options.onEnd?.();
        }
    }, [cancel]);

    return { isSpeaking, speak, cancel, voices: [] };
};