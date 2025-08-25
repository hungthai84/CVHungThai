import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';

type ThemeColor = string;
type ThemeMode = 'light' | 'dark';
type WallpaperType = string; // 'gradient' or a video URL

interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    lightThemeColor: ThemeColor;
    setLightThemeColor: (color: ThemeColor) => void;
    darkThemeColor: ThemeColor;
    setDarkThemeColor: (color: ThemeColor) => void;
    isCursorEffectOn: boolean;
    setCursorEffect: (isOn: boolean) => void;
    isSoundOn: boolean;
    setSoundOn: (isOn: boolean) => void;
    isAiVoiceOn: boolean;
    setAiVoiceOn: (isOn: boolean) => void;
    selectedAiVoiceName: string;
    setSelectedAiVoiceName: (name: string) => void;
    projectFilter: string;
    setProjectFilter: (filter: string) => void;
    wallpaper: WallpaperType;
    setWallpaper: (wallpaper: WallpaperType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const hexToRgb = (hex: string): string => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    if (!result) return "0, 0, 0";
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r}, ${g}, ${b}`;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
    const [lightThemeColor, setLightThemeColorState] = useState<ThemeColor>('#101733');
    const [darkThemeColor, setDarkThemeColorState] = useState<ThemeColor>('#FFFFFF'); // Dark mode default is now white
    
    const [isCursorEffectOn, setCursorEffectState] = useState<boolean>(false);
    const [isSoundOn, setSoundOnState] = useState<boolean>(true);
    const [isAiVoiceOn, setAiVoiceOnState] = useState<boolean>(true);
    const [selectedAiVoiceName, setSelectedAiVoiceNameState] = useState<string>('');
    const [projectFilter, setProjectFilterState] = useState<string>('all');
    const [wallpaper, setWallpaperState] = useState<WallpaperType>('');
    
    // --- Setter Functions that include saving to localStorage ---

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
        localStorage.setItem('themeMode', mode);
    };

    const setLightThemeColor = (color: ThemeColor) => {
        setLightThemeColorState(color);
        localStorage.setItem('lightThemeColor', color);
    };

    const setDarkThemeColor = (color: ThemeColor) => {
        setDarkThemeColorState(color);
        localStorage.setItem('darkThemeColor', color);
    };

    const setCursorEffect = (isOn: boolean) => {
        setCursorEffectState(isOn);
        localStorage.setItem('isCursorEffectOn', String(isOn));
    };

    const setSoundOn = (isOn: boolean) => {
        setSoundOnState(isOn);
        localStorage.setItem('isSoundOn', String(isOn));
    };
    
    const setAiVoiceOn = (isOn: boolean) => {
        setAiVoiceOnState(isOn);
        localStorage.setItem('isAiVoiceOn', String(isOn));
    };

    const setSelectedAiVoiceName = (name: string) => {
        setSelectedAiVoiceNameState(name);
        localStorage.setItem('selectedAiVoiceName', name);
    };

    const setProjectFilter = (filter: string) => {
        setProjectFilterState(filter);
        localStorage.setItem('projectFilter', filter);
    }

    const setWallpaper = (wp: WallpaperType) => {
        setWallpaperState(wp);
        localStorage.setItem('wallpaper', wp);
    };

    // Effect to load settings from localStorage on initial mount
    useEffect(() => {
        const savedMode = localStorage.getItem('themeMode') as ThemeMode | null;
        const savedLightColor = localStorage.getItem('lightThemeColor');
        const savedDarkColor = localStorage.getItem('darkThemeColor');
        let savedWallpaper = localStorage.getItem('wallpaper');
        const savedCursor = localStorage.getItem('isCursorEffectOn');
        const savedSound = localStorage.getItem('isSoundOn');
        const savedAiVoice = localStorage.getItem('isAiVoiceOn');
        const savedVoiceName = localStorage.getItem('selectedAiVoiceName');
        const savedProjectFilter = localStorage.getItem('projectFilter');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const currentMode = savedMode || (prefersDark ? 'dark' : 'light');
        setThemeModeState(currentMode);

        if (savedLightColor) setLightThemeColorState(savedLightColor);
        if (savedDarkColor) setDarkThemeColorState(savedDarkColor);
        
        setCursorEffectState(savedCursor === null ? false : savedCursor === 'true');
        setSoundOnState(savedSound === null ? true : savedSound === 'true');
        setAiVoiceOnState(savedAiVoice === null ? true : savedAiVoice === 'true');
        if (savedVoiceName) setSelectedAiVoiceNameState(savedVoiceName);
        if (savedProjectFilter) setProjectFilterState(savedProjectFilter);

        // Migration from old 'video' value to the new URL-based system
        if (savedWallpaper === 'video') {
            savedWallpaper = 'https://cdn.scena.ai/project/9626/3831bf105bab4a399b35e79c5a8b4f1d3cfc4fe5ea48812f948fa55c90792dc4.mp4';
        }

        if (savedWallpaper) {
            setWallpaperState(savedWallpaper);
        } else {
            if (currentMode === 'dark') {
                setWallpaperState('dark-dotted-pattern');
            } else {
                setWallpaperState('dotted-pattern');
            }
        }

    }, []);

    // Effect to apply theme (mode and color) to the document
    useEffect(() => {
        const root = window.document.documentElement;
        if (themeMode === 'dark') {
            root.classList.add('dark');
            root.style.setProperty('--accent-color', darkThemeColor);
            root.style.setProperty('--accent-color-rgb', hexToRgb(darkThemeColor));
        } else {
            root.classList.remove('dark');
            root.style.setProperty('--accent-color', lightThemeColor);
            root.style.setProperty('--accent-color-rgb', hexToRgb(lightThemeColor));
        }
    }, [themeMode, lightThemeColor, darkThemeColor]);

    // Effect to set the default AI voice based on browser and availability
    useEffect(() => {
        // Don't run if a voice has already been saved and loaded
        if (localStorage.getItem('selectedAiVoiceName')) {
            return;
        }

        const setInitialVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) {
                return; // Voices not loaded yet.
            }

            let finalVoice: SpeechSynthesisVoice | undefined;

            // --- Prioritize "Nam Minh" or Google's default male Vietnamese voice ---
            finalVoice = voices.find(v => v.lang === 'vi-VN' && (v.name.includes('Nam Minh') || v.name === 'Google Tiếng Việt'));

            // If preferred voice not found, use existing fallback logic
            if (!finalVoice) {
                const vietnameseVoices = voices.filter(v => v.lang === 'vi-VN');
                const standardVietnameseVoice = 
                    vietnameseVoices.find(v => v.name.toLowerCase().includes('nam') || v.name.toLowerCase().includes('male')) ||
                    vietnameseVoices[0]; // Fallback to the first available Vietnamese voice

                const isEdge = navigator.userAgent.includes("Edg/");
                if (isEdge) {
                    const remyVoice = voices.find(v => v.name === 'Microsoft Rémy Multilingue Online (Natural) - French (France)');
                    finalVoice = remyVoice || standardVietnameseVoice; // Fallback to standard if Rémy not found
                } else {
                    finalVoice = standardVietnameseVoice;
                }
            }

            // --- Fallback to English if no suitable Vietnamese voice is found ---
            if (!finalVoice) {
                console.warn("No suitable Vietnamese voice found. Falling back to English voice.");
                const englishVoices = voices.filter(v => v.lang.startsWith('en-US'));
                finalVoice = 
                    voices.find(v => v.name === 'Microsoft David - English (United States)') || // Prefer David
                    englishVoices.find(v => v.name.toLowerCase().includes('male')) || // Prefer other male
                    englishVoices[0]; // Fallback to first US English
            }
            
            if (finalVoice) {
                // This calls the setter which also saves to localStorage
                setSelectedAiVoiceName(finalVoice.name);
            } else {
                console.warn("No suitable voices found. Using browser default.");
                setSelectedAiVoiceName('');
            }
        };

        if (window.speechSynthesis.getVoices().length) {
            setInitialVoice();
        } else {
            window.speechSynthesis.addEventListener('voiceschanged', setInitialVoice, { once: true });
        }
        
        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', setInitialVoice);
        }
    }, []);

    const value: ThemeContextType = {
        themeMode,
        setThemeMode,
        lightThemeColor,
        setLightThemeColor,
        darkThemeColor,
        setDarkThemeColor,
        isCursorEffectOn,
        setCursorEffect,
        isSoundOn,
        setSoundOn,
        isAiVoiceOn,
        setAiVoiceOn,
        selectedAiVoiceName,
        setSelectedAiVoiceName,
        projectFilter,
        setProjectFilter,
        wallpaper,
        setWallpaper,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
