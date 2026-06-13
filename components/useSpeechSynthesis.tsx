import { useState, useEffect, useRef, useCallback } from 'react';

function splitTextForGtts(text: string, maxLength = 160): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    let currentChunk = '';
    for (const word of words) {
        if ((currentChunk + ' ' + word).length <= maxLength) {
            currentChunk += (currentChunk ? ' ' : '') + word;
        } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = word;
        }
    }
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
}

function splitTextIntoSentences(text: string, maxLength = 160): string[] {
    // Split by sentence boundaries (. ! ?) to preserve natural intonation and pauses
    const sentences = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+(\s+|$)/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (!trimmed) continue;

        if (trimmed.length <= maxLength) {
            if ((currentChunk + ' ' + trimmed).length <= maxLength) {
                currentChunk += (currentChunk ? ' ' : '') + trimmed;
            } else {
                if (currentChunk) chunks.push(currentChunk);
                currentChunk = trimmed;
            }
        } else {
            // Sentence is too long, split by words to fit within maxLength
            if (currentChunk) {
                chunks.push(currentChunk);
                currentChunk = '';
            }
            const words = trimmed.split(/\s+/);
            for (const word of words) {
                if ((currentChunk + ' ' + word).length <= maxLength) {
                    currentChunk += (currentChunk ? ' ' : '') + word;
                } else {
                    if (currentChunk) chunks.push(currentChunk);
                    currentChunk = word;
                }
            }
        }
    }
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
}

// --- Module-level state to handle browser's auto-play restrictions ---

// This flag ensures the event listeners are attached only once per application lifecycle.
let interactionListenerAttached = false;
// This flag becomes true after the first user interaction (click, keydown, etc.).
let hasInteracted = false;
// A queue to hold the first speech request if it's made before any user interaction.
const speechQueue: Array<() => void> = [];

// This function is called on the first user interaction.
const handleFirstInteraction = () => {
    if (!hasInteracted) {
        hasInteracted = true;
        // Some browsers suspend the audio context until a user gesture. This attempts to resume it.
        if (window.speechSynthesis && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
        // Process any speech task that was queued before interaction.
        while (speechQueue.length > 0) {
            const speechTask = speechQueue.shift();
            speechTask?.();
        }
    }
    // Clean up the listeners as they are no longer needed.
    window.removeEventListener('click', handleFirstInteraction, true);
    window.removeEventListener('keydown', handleFirstInteraction, true);
    window.removeEventListener('touchstart', handleFirstInteraction, true);
};

// Attach the interaction listeners globally when the module is first loaded.
if (typeof window !== 'undefined' && !interactionListenerAttached) {
    // We listen for various events to maximize the chance of capturing a user gesture.
    window.addEventListener('click', handleFirstInteraction, true);
    window.addEventListener('keydown', handleFirstInteraction, true);
    window.addEventListener('touchstart', handleFirstInteraction, true);
    interactionListenerAttached = true;
}

const gTTSVoices: SpeechSynthesisVoice[] = [
    { name: 'Gemini 3.5 Turbo AI (Mới nhất)', lang: 'en-US', default: false, localService: false, voiceURI: 'gemini-ai-turbo' } as any,
    { name: 'Gemini 3.5 Live Translate', lang: 'en-US', default: false, localService: false, voiceURI: 'gemini-ai-translate' } as any,
    { name: 'Google Translate (Tiếng Việt)', lang: 'vi-VN', default: false, localService: false, voiceURI: 'gtts-vi' } as any,
    { name: 'Google Translate (English)', lang: 'en-US', default: false, localService: false, voiceURI: 'gtts-en' } as any,
    { name: 'Google Translate (Multilingual/Auto)', lang: 'en-US', default: false, localService: false, voiceURI: 'gtts-multi' } as any,
];

let globalGttsAudioQueue: HTMLAudioElement[] = [];

export const useSpeechSynthesis = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const keepAliveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const activeSessionRef = useRef<string | null>(null);

    useEffect(() => {
        const handleGlobalStop = () => setIsSpeaking(false);
        window.addEventListener('speech-synthesis-stopped', handleGlobalStop);
        return () => window.removeEventListener('speech-synthesis-stopped', handleGlobalStop);
    }, []);

    // Effect to populate voices and handle cleanup
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            
            // Collect all available voices but put Google voices first if they exist
            const googleVoices = availableVoices.filter(v => v.name.includes('Google'));
            const otherVoices = availableVoices.filter(v => !v.name.includes('Google'));
            
            setVoices([...gTTSVoices, ...googleVoices, ...otherVoices]);
        };

        // Load voices initially and on change
        loadVoices();
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

        // Cleanup function
        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            if (keepAliveIntervalRef.current) {
                clearInterval(keepAliveIntervalRef.current);
            }
        };
    }, []);

    const cancel = useCallback(() => {
        activeSessionRef.current = null;
        setIsSpeaking(false);
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        if (globalGttsAudioQueue.length > 0) {
            globalGttsAudioQueue.forEach(a => a.pause());
            globalGttsAudioQueue = [];
        }
        window.dispatchEvent(new Event('speech-synthesis-stopped'));
        if (keepAliveIntervalRef.current) {
            clearInterval(keepAliveIntervalRef.current);
            keepAliveIntervalRef.current = null;
        }
    }, []);
    
    const speak = useCallback((text: string, options: { voiceName?: string; lang?: 'vi' | 'en' | string; pitch?: number; rate?: number; onEnd?: () => void } = {}) => {
        
        const doSpeak = async () => {
            if (!text.trim()) {
                options.onEnd?.();
                return;
            }

            // Cancel any ongoing speech to ensure clean state
            cancel();
            
            const sessionId = Math.random().toString(36).substring(2);
            activeSessionRef.current = sessionId;

            const isGttsVoice = options.voiceName && (options.voiceName.includes('gTTS') || options.voiceName.includes('Google Translate'));
            const isGeminiVoice = options.voiceName && options.voiceName.includes('Gemini');

            if (isGeminiVoice || isGttsVoice) {
                try {
                    setIsSpeaking(true);
                    const targetLangCode = options.lang === 'en' ? 'en' : 'vi';
                    const chunks = splitTextIntoSentences(text, isGeminiVoice ? 500 : 160);
                    
                    if (isGeminiVoice) {
                        let currentIndex = 0;
                        const playNextGemini = async () => {
                            if (activeSessionRef.current !== sessionId) return;

                            if (currentIndex >= chunks.length) {
                                setIsSpeaking(false);
                                window.dispatchEvent(new Event('speech-synthesis-stopped'));
                                options.onEnd?.();
                                return;
                            }

                            try {
                                const res = await fetch('/api/tts/gemini', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        text: chunks[currentIndex],
                                        lang: targetLangCode,
                                        voice: 'Zephyr'
                                    })
                                });
                                
                                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                                
                                const data = await res.json();
                                if (data.audio) {
                                    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                                    const binaryString = atob(data.audio);
                                    const bytes = new Uint8Array(binaryString.length);
                                    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                                    
                                    const pcm16 = new Int16Array(bytes.buffer);
                                    const float32 = new Float32Array(pcm16.length);
                                    for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 32768.0;
                                    
                                    const buffer = audioCtx.createBuffer(1, float32.length, 24000);
                                    buffer.getChannelData(0).set(float32);
                                    
                                    const source = audioCtx.createBufferSource();
                                    source.buffer = buffer;
                                    source.connect(audioCtx.destination);
                                    source.onended = () => {
                                        if (activeSessionRef.current === sessionId) {
                                            currentIndex++;
                                            playNextGemini();
                                        }
                                        audioCtx.close();
                                    };
                                    source.start();
                                } else {
                                    throw new Error('No audio data');
                                }
                            } catch (err) {
                                console.warn('Gemini TTS failed, falling back to gTTS:', err);
                                if (activeSessionRef.current !== sessionId) return;

                                try {
                                    const chunk = chunks[currentIndex];
                                    const isSlow = options.rate !== undefined && options.rate < 0.8;
                                    const googleLang = targetLangCode === 'en' ? 'en' : 'vi';
                                    const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${googleLang}&client=gtx&ttsspeed=${isSlow ? 0.24 : 1}`;
                                    
                                    const audio = new Audio();
                                    audio.src = fallbackUrl;
                                    audio.preload = 'auto';
                                    if (options.rate !== undefined) audio.playbackRate = options.rate;
                                    
                                    globalGttsAudioQueue.push(audio);
                                    
                                    const cleanupAudio = () => {
                                        audio.onended = null;
                                        audio.onerror = null;
                                        globalGttsAudioQueue = globalGttsAudioQueue.filter(a => a !== audio);
                                    };
                                    
                                    audio.onended = () => {
                                        if (activeSessionRef.current !== sessionId) return;
                                        cleanupAudio();
                                        currentIndex++;
                                        playNextGemini();
                                    };
                                    
                                    audio.onerror = (e) => {
                                        console.warn('Fallback gTTS failed:', e);
                                        cleanupAudio();
                                        currentIndex++;
                                        playNextGemini();
                                    };
                                    
                                    audio.play().catch(() => {
                                        cleanupAudio();
                                        currentIndex++;
                                        playNextGemini();
                                    });
                                } catch (fallbackErr) {
                                    console.error('Fallback failed:', fallbackErr);
                                    currentIndex++;
                                    playNextGemini();
                                }
                            }
                        };
                        playNextGemini();
                        return;
                    }

                    // Pure gTTS logic
                    const isSlow = options.rate !== undefined && options.rate < 0.8;
                    const urls = chunks.map(chunk => ({
                        url: `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${targetLangCode}&client=gtx&ttsspeed=${isSlow ? 0.24 : 1}`
                    }));
                    
                    if (urls.length > 0) {
                        let currentIndex = 0;
                        const playNext = () => {
                            if (activeSessionRef.current !== sessionId) return;
                            if (currentIndex >= urls.length) {
                                setIsSpeaking(false);
                                window.dispatchEvent(new Event('speech-synthesis-stopped'));
                                options.onEnd?.();
                                return;
                            }

                            const audio = new Audio();
                            audio.src = urls[currentIndex].url;
                            audio.preload = 'auto';
                            if (options.rate !== undefined) audio.playbackRate = options.rate;
                            globalGttsAudioQueue.push(audio);

                            const cleanupAudio = () => {
                                audio.onended = null;
                                audio.onerror = null;
                                globalGttsAudioQueue = globalGttsAudioQueue.filter(a => a !== audio);
                            };

                            audio.onended = () => {
                                if (activeSessionRef.current !== sessionId) return;
                                cleanupAudio();
                                currentIndex++;
                                playNext();
                            };
                            audio.onerror = () => {
                                cleanupAudio();
                                currentIndex++;
                                playNext();
                            };
                            audio.play().catch(() => {
                                cleanupAudio();
                                currentIndex++;
                                playNext();
                            });
                        };
                        playNext();
                    } else {
                        setIsSpeaking(false);
                        options.onEnd?.();
                    }
                } catch (err) {
                    console.error('TTS execution error:', err);
                    setIsSpeaking(false);
                    options.onEnd?.();
                }
                return;
            }

            if (!window.speechSynthesis) {
                console.warn('Speech Synthesis not supported.');
                options.onEnd?.();
                return;
            }

            let targetLangCode = 'vi-VN';
            if (options.lang === 'en') {
                targetLangCode = 'en-US';
            } else if (options.lang === 'vi') {
                targetLangCode = 'vi-VN';
            } else if (options.lang) {
                targetLangCode = options.lang;
            }
            
            let selectedVoice: SpeechSynthesisVoice | undefined;

            // 1. Try to find the specifically requested voice
            if (options.voiceName) {
                selectedVoice = voices.find(voice => voice.name === options.voiceName);
            }

            // 2. If no specific voice or specific voice not found, apply smart fallback based on language
            if (!selectedVoice) {
                if (targetLangCode === 'vi-VN' || targetLangCode.startsWith('vi')) {
                    const vietnameseVoices = voices.filter(v => v.lang === 'vi-VN' || v.lang.startsWith('vi'));
                    if (vietnameseVoices.length > 0) {
                        const viPriorityList = [
                            'Microsoft HoaiMy Online',
                            'Microsoft NamMinh Online',
                            'Google tiếng Việt',
                            'Google Vietnamese',
                        ];
                        
                        let preferredVoice: SpeechSynthesisVoice | undefined;
                        for (const name of viPriorityList) {
                            preferredVoice = vietnameseVoices.find(v => v.name.includes(name));
                            if (preferredVoice) break;
                        }

                        if (!preferredVoice) {
                            preferredVoice = vietnameseVoices.find(v => v.name.toLowerCase().includes('vietnam') || v.name.toLowerCase().includes('tiếng việt'));
                        }
                        
                        // Absolute fallback
                        selectedVoice = preferredVoice || vietnameseVoices[0];
                    }
                } else { // en-US
                    const englishVoices = voices.filter(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-'));
                    const enPriorityList = [
                        'Microsoft Onyx Turbo Multilingual Online',
                        'Microsoft Brian Online',
                        'Microsoft Christopher Online',
                        'Microsoft Aria Online',
                        'Microsoft Guy Online',
                        'Microsoft AvaMultilingual Online',
                        'Google US English',
                        'Google UK English Male',
                        'Google UK English Female',
                    ];
                    for (const name of enPriorityList) {
                        const voice = englishVoices.find(v => v.name.includes(name));
                        if (voice) {
                            selectedVoice = voice;
                            break;
                        }
                    }
                    if (!selectedVoice) {
                        selectedVoice = englishVoices[0];
                    }
                }
            }

            // Fallback strategy: if the selected voice is remote network-based and might trigger "synthesis-failed",
            // pre-locate a localService fallback voice in the same language family.
            let backupVoice: SpeechSynthesisVoice | undefined;
            if (selectedVoice && !selectedVoice.localService) {
                const langPrefix = targetLangCode.split('-')[0].toLowerCase();
                backupVoice = voices.find(v => v.localService && v.lang.toLowerCase().startsWith(langPrefix));
            }

            const chunks = splitTextIntoSentences(text, 160);
            if (chunks.length === 0) {
                options.onEnd?.();
                return;
            }

            setIsSpeaking(true);
            let currentIndex = 0;
            let retryWithBackup = false;

            const playNextChunk = () => {
                if (activeSessionRef.current !== sessionId) return;

                if (currentIndex >= chunks.length) {
                    cleanup();
                    return;
                }

                const chunkText = chunks[currentIndex];
                const utterance = new SpeechSynthesisUtterance(chunkText);
                utteranceRef.current = utterance;
                
                utterance.lang = targetLangCode;
                
                // Real voices from window.speechSynthesis.getVoices() have extra properties 
                // and methods that our gTTS mock objects lack. 
                // We check if it is truly a SpeechSynthesisVoice by checking if it exists in the 
                // original browser voices list or has standard behavior.
                const isRealVoice = selectedVoice && 
                                   window.speechSynthesis.getVoices().some(v => v.name === selectedVoice.name && v.lang === selectedVoice.lang);

                if (retryWithBackup && backupVoice) {
                    utterance.voice = backupVoice;
                } else if (selectedVoice && isRealVoice) {
                    utterance.voice = selectedVoice;
                    
                    // Special handling for Multilingual voices: they often prefer their base language
                    // even when reading other languages.
                    if (selectedVoice.name.toLowerCase().includes('multilingual')) {
                        utterance.lang = selectedVoice.lang;
                    }
                }

                if (options.pitch !== undefined) utterance.pitch = options.pitch;
                if (options.rate !== undefined) utterance.rate = options.rate;

                utterance.onstart = () => {
                    if (activeSessionRef.current !== sessionId) return;
                    setIsSpeaking(true);
                    
                    // Start or refresh keep-alive ping for Chrome
                    if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
                    keepAliveIntervalRef.current = setInterval(() => {
                        if (window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
                            window.speechSynthesis.resume();
                        }
                    }, 5000);
                };

                utterance.onend = () => {
                    if (activeSessionRef.current !== sessionId) return;
                    currentIndex++;
                    playNextChunk();
                };

                utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
                    if (activeSessionRef.current !== sessionId) return;

                    if (event.error === 'not-allowed') {
                        console.warn('Speech synthesis was blocked by browser. Stopping.');
                        cleanup();
                    } else if (event.error === 'interrupted') {
                        console.log('Speech synthesis chunk was interrupted.');
                    } else if (event.error === 'synthesis-failed' || event.error === 'network') {
                        console.warn(`Speech synthesis error (${event.error}). Retrying with gTTS fallback...`);
                        
                        const remainingText = chunks.slice(currentIndex).join('. ');
                        
                        if (keepAliveIntervalRef.current) {
                            clearInterval(keepAliveIntervalRef.current);
                            keepAliveIntervalRef.current = null;
                        }
                        
                        // Default to the first Vietnamese gTTS voice if we were speaking Vietnamese, otherwise English
                        const fallbackVoiceName = targetLangCode.startsWith('vi') 
                            ? 'Google Translate (Tiếng Việt)' 
                            : 'Google Translate (English)';

                        // Small delay before switching to HTTP mode
                        setTimeout(() => {
                            if (activeSessionRef.current === sessionId) {
                                speak(remainingText, {
                                    ...options,
                                    voiceName: fallbackVoiceName
                                });
                            }
                        }, 300);
                        return;
                    } else {
                        console.error('SpeechSynthesisUtterance error:', event.error);
                        
                        if (!retryWithBackup && backupVoice) {
                            console.warn('Voice failed. Trying offline backup voice:', backupVoice.name);
                            retryWithBackup = true;
                            playNextChunk();
                        } else {
                            currentIndex++;
                            playNextChunk();
                        }
                    }
                };

                window.speechSynthesis.speak(utterance);
            };

            const cleanup = () => {
                if (activeSessionRef.current !== sessionId) return;
                setIsSpeaking(false);
                window.dispatchEvent(new Event('speech-synthesis-stopped'));
                if (keepAliveIntervalRef.current) {
                    clearInterval(keepAliveIntervalRef.current);
                    keepAliveIntervalRef.current = null;
                }
                if (options.onEnd) {
                    options.onEnd();
                }
            };

            // Begin speaking the first chunk
            playNextChunk();
        };

        // If the user has already interacted, speak immediately.
        // Otherwise, queue the speech task to be run after the first interaction.
        if (hasInteracted) {
            doSpeak();
        } else {
            // Only queue the very first message to avoid a backlog of spoken text.
            if (speechQueue.length === 0) {
                speechQueue.push(doSpeak);
            }
        }
    }, [voices, cancel]);

    return { isSpeaking, speak, cancel, voices };
};
