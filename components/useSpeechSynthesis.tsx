import { useState, useEffect, useRef, useCallback } from 'react';

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


export const useSpeechSynthesis = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const keepAliveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Effect to populate voices and handle cleanup
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
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
        if (window.speechSynthesis) {
            setIsSpeaking(false);
            if (keepAliveIntervalRef.current) {
                clearInterval(keepAliveIntervalRef.current);
                keepAliveIntervalRef.current = null;
            }
            window.speechSynthesis.cancel();
        }
    }, []);
    
    const speak = useCallback((text: string, options: { voiceName?: string; lang?: 'vi' | 'en'; onEnd?: () => void } = {}) => {
        
        const doSpeak = () => {
            if (!window.speechSynthesis || !text.trim()) {
                console.warn('Speech Synthesis not supported or text is empty.');
                options.onEnd?.();
                return;
            }

            // Cancel any ongoing speech to ensure clean state
            cancel();

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
                    const vietnameseVoices = voices.filter(v => v.lang === 'vi-VN');
                    if (vietnameseVoices.length > 0) {
                        // Priority 1: Specifically requested professional male voice (ideal for business reports)
                        let preferredVoice = vietnameseVoices.find(v => v.name === 'Microsoft Nam Minh Online (Natural) - Vietnamese (Vietnam)');
        
                        // Priority 2: Fallback to high-quality female voice
                        if (!preferredVoice) {
                            preferredVoice = vietnameseVoices.find(v => v.name === 'Microsoft Hoai My Online (Natural) - Vietnamese (Vietnam)');
                        }

                        // Priority 3: Fallback to any male Vietnamese voice.
                        if (!preferredVoice) {
                            preferredVoice = vietnameseVoices.find(v => v.name.toLowerCase().includes('nam') || v.name.toLowerCase().includes('male'));
                        }
                        
                        // Priority 4: Fallback to any female Vietnamese voice.
                        if (!preferredVoice) {
                            preferredVoice = vietnameseVoices.find(v => v.name.toLowerCase().includes('nữ') || v.name.toLowerCase().includes('female'));
                        }
                        
                        // Priority 5: Absolute fallback to the first available Vietnamese voice.
                        selectedVoice = preferredVoice || vietnameseVoices[0];
                    }
                } else { // en-US
                    const englishVoices = voices.filter(v => v.lang.startsWith('en-US'));
                    const enPriorityList = [
                        'Microsoft Ryan Online (Natural) - English (United States)',
                        'Microsoft Jenny Online (Natural) - English (United States)',
                        'Google US English',
                        'Microsoft David - English (United States)',
                    ];
                    for (const name of enPriorityList) {
                        const voice = englishVoices.find(v => v.name === name);
                        if (voice) {
                            selectedVoice = voice;
                            break;
                        }
                    }
                    if (!selectedVoice) {
                        selectedVoice = englishVoices.find(v => v.name.toLowerCase().includes('male')) || englishVoices[0];
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
                if (keepAliveIntervalRef.current) {
                    clearInterval(keepAliveIntervalRef.current);
                    keepAliveIntervalRef.current = null;
                }
                if (options.onEnd) {
                    options.onEnd();
                }
            };

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