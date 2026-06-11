import { useState, useEffect, useRef, useCallback } from 'react';

function splitTextForGtts(text: string, maxLength = 200): string[] {
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
    { name: 'Google Translate TTS (gTTS)', lang: 'vi-VN', default: false, localService: false, voiceURI: 'gtts-vi' } as any,
    { name: 'Google Translate TTS (gTTS)', lang: 'en-US', default: false, localService: false, voiceURI: 'gtts-en' } as any,
];

let globalGttsAudioQueue: HTMLAudioElement[] = [];

export const useSpeechSynthesis = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const keepAliveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    
    const speak = useCallback((text: string, options: { voiceName?: string; lang?: 'vi' | 'en'; pitch?: number; rate?: number; onEnd?: () => void } = {}) => {
        
        const doSpeak = async () => {
            if (!text.trim()) {
                options.onEnd?.();
                return;
            }

            // Cancel any ongoing speech to ensure clean state
            cancel();

            const isGttsVoice = options.voiceName && options.voiceName.includes('gTTS');

            if (isGttsVoice) {
                try {
                    setIsSpeaking(true);
                    const targetLangCode = options.lang === 'en' ? 'en' : 'vi';
                    const chunks = splitTextForGtts(text, 200);
                    const isSlow = options.rate !== undefined && options.rate < 0.8;
                    const urls = chunks.map(chunk => ({
                        url: `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${targetLangCode}&client=tw-ob&ttsspeed=${isSlow ? 0.24 : 1}`
                    }));
                    
                    if (urls.length > 0) {
                        let currentIndex = 0;

                        const playNext = () => {
                            if (currentIndex >= urls.length) {
                                setIsSpeaking(false);
                                window.dispatchEvent(new Event('speech-synthesis-stopped'));
                                options.onEnd?.();
                                return;
                            }

                            const audio = new Audio(urls[currentIndex].url);
                            if (options.rate !== undefined) audio.playbackRate = options.rate;
                            if (options.pitch !== undefined && (audio as any).mozPreservesPitch !== undefined) {
                                (audio as any).preservesPitch = options.pitch === 1;
                            }

                            globalGttsAudioQueue.push(audio);

                            audio.onended = () => {
                                globalGttsAudioQueue = globalGttsAudioQueue.filter(a => a !== audio);
                                currentIndex++;
                                playNext();
                            };
                            audio.onerror = () => {
                                globalGttsAudioQueue = globalGttsAudioQueue.filter(a => a !== audio);
                                currentIndex++;
                                playNext(); // Skip error and try next
                            };
                            
                            audio.play().catch(err => {
                                console.error('gTTS Audio Play Error:', err);
                                setIsSpeaking(false);
                                window.dispatchEvent(new Event('speech-synthesis-stopped'));
                                options.onEnd?.();
                            });
                        };

                        playNext();
                    } else {
                        setIsSpeaking(false);
                        options.onEnd?.();
                    }
                } catch (err) {
                    console.error('gTTS Error:', err);
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

            const utterance = new SpeechSynthesisUtterance(text);
            utteranceRef.current = utterance;

            const targetLangCode = options.lang === 'en' ? 'en-US' : 'vi-VN';
            utterance.lang = targetLangCode;
            
            let selectedVoice: SpeechSynthesisVoice | undefined;

            // 1. Try to find the specifically requested voice
            if (options.voiceName) {
                selectedVoice = voices.find(voice => voice.name === options.voiceName);
            }

            // 2. If no specific voice or specific voice not found, apply smart fallback based on language
            if (!selectedVoice) {
                if (targetLangCode === 'vi-VN') {
                    const vietnameseVoices = voices.filter(v => v.lang === 'vi-VN' || v.lang.startsWith('vi'));
                    if (vietnameseVoices.length > 0) {
                        let preferredVoice = vietnameseVoices.find(v => v.name === 'Google tiếng Việt' || v.name === 'Google Vietnamese');
                        if (!preferredVoice) {
                            preferredVoice = vietnameseVoices.find(v => v.name.toLowerCase().includes('vietnam') || v.name.toLowerCase().includes('tiếng việt'));
                        }
                        
                        // Absolute fallback
                        selectedVoice = preferredVoice || vietnameseVoices[0];
                    }
                } else { // en-US
                    const englishVoices = voices.filter(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-'));
                    const enPriorityList = [
                        'Google US English',
                        'Google UK English Male',
                        'Google UK English Female',
                    ];
                    for (const name of enPriorityList) {
                        const voice = englishVoices.find(v => v.name === name);
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


            if (selectedVoice) {
                utterance.voice = selectedVoice;
            } else {
                 if (voices.length > 0) {
                    console.warn(`${targetLangCode} voice not found, using browser default for language.`);
                }
            }


            const cleanup = () => {
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

            if (options.pitch !== undefined) utterance.pitch = options.pitch;
            if (options.rate !== undefined) utterance.rate = options.rate;

            utterance.onstart = () => {
                setIsSpeaking(true);
                // Start keep-alive ping, a workaround for browsers like Chrome
                if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
                keepAliveIntervalRef.current = setInterval(() => {
                    if (window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
                        window.speechSynthesis.resume();
                    }
                }, 5000);
            };

            utterance.onend = cleanup;
            utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
                // Handle the "not-allowed" error which occurs when speech is initiated without user gesture.
                if (event.error === 'not-allowed') {
                    console.warn('Speech synthesis was blocked by the browser. It will retry after user interaction.');
                } else if (event.error !== 'interrupted') {
                    console.error('SpeechSynthesisUtterance.onerror:', event.error);
                }
                cleanup();
            };

            window.speechSynthesis.speak(utterance);
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