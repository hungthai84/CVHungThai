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
    // isCursorEffectOn: boolean;
    // setCursorEffect: (isOn: boolean) => void;
    isSoundOn: boolean;
    setSoundOn: (isOn: boolean) => void;
    isAiVoiceOn: boolean;
    setAiVoiceOn: (isOn: boolean) => void;
    selectedAiVoiceName: string;
    setSelectedAiVoiceName: (name: string) => void;
    aiVoicePitch: number;
    setAiVoicePitch: (pitch: number) => void;
    aiVoiceRate: number;
    setAiVoiceRate: (rate: number) => void;
    projectFilter: string[];
    setProjectFilter: (filter: string[]) => void;
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
    
    
    const [isSoundOn, setSoundOnState] = useState<boolean>(true);
    const [isAiVoiceOn, setAiVoiceOnState] = useState<boolean>(true);
    const [selectedAiVoiceName, setSelectedAiVoiceNameState] = useState<string>('Google tiếng Việt');
    const [aiVoicePitch, setAiVoicePitchState] = useState<number>(1);
    const [aiVoiceRate, setAiVoiceRateState] = useState<number>(0.95);
    const [projectFilter, setProjectFilterState] = useState<string[]>([]);
    const [wallpaper, setWallpaperState] = useState<WallpaperType>('https://cdn.dribbble.com/userupload/16718734/file/original-f2df9314dbf922d5452d7a8a5885d744.mp4');
    
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

    const setAiVoicePitch = (pitch: number) => {
        setAiVoicePitchState(pitch);
        localStorage.setItem('aiVoicePitch', String(pitch));
    };

    const setAiVoiceRate = (rate: number) => {
        setAiVoiceRateState(rate);
        localStorage.setItem('aiVoiceRate', String(rate));
    };

    const setProjectFilter = (filter: string[]) => {
        setProjectFilterState(filter);
        localStorage.setItem('projectFilter', JSON.stringify(filter));
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
        
        const savedSound = localStorage.getItem('isSoundOn');
        const savedAiVoice = localStorage.getItem('isAiVoiceOn');
        const savedVoiceName = localStorage.getItem('selectedAiVoiceName');
        const savedVoicePitch = localStorage.getItem('aiVoicePitch');
        const savedVoiceRate = localStorage.getItem('aiVoiceRate');
        const savedProjectFilter = localStorage.getItem('projectFilter');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const currentMode = savedMode || (prefersDark ? 'dark' : 'light');
        setThemeModeState(currentMode);

        if (savedLightColor) setLightThemeColorState(savedLightColor);
        if (savedDarkColor) setDarkThemeColorState(savedDarkColor);
        
        // setCursorEffectState(savedCursor === null ? true : savedCursor === 'true');
        setSoundOnState(savedSound === null ? true : savedSound === 'true');
        setAiVoiceOnState(savedAiVoice === null ? true : savedAiVoice === 'true');
        if (savedVoiceName) setSelectedAiVoiceNameState(savedVoiceName);
        if (savedVoicePitch) setAiVoicePitchState(parseFloat(savedVoicePitch));
        if (savedVoiceRate) setAiVoiceRateState(parseFloat(savedVoiceRate));
        if (savedProjectFilter) {
            try {
                const parsedFilter = JSON.parse(savedProjectFilter);
                if (Array.isArray(parsedFilter)) {
                    setProjectFilterState(parsedFilter);
                }
            } catch (e) {
                setProjectFilterState([]);
            }
        }

        // Migration from old 'video' value to the new URL-based system
        if (savedWallpaper === 'video') {
            savedWallpaper = 'https://cdn.scena.ai/project/9626/3831bf105bab4a399b35e79c5a8b4f1d3cfc4fe5ea48812f948fa55c90792dc4.mp4';
        }

        if (savedWallpaper) {
            setWallpaperState(savedWallpaper);
        } else {
            setWallpaperState('https://cdn.dribbble.com/userupload/16718734/file/original-f2df9314dbf922d5452d7a8a5885d744.mp4');
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

    const value: ThemeContextType = {
        themeMode,
        setThemeMode,
        lightThemeColor,
        setLightThemeColor,
        darkThemeColor,
        setDarkThemeColor,
        // isCursorEffectOn,
        // setCursorEffect,
        isSoundOn,
        setSoundOn,
        isAiVoiceOn,
        setAiVoiceOn,
        selectedAiVoiceName,
        setSelectedAiVoiceName,
        aiVoicePitch,
        setAiVoicePitch,
        aiVoiceRate,
        setAiVoiceRate,
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