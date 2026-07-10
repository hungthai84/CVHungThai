import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';

type ThemeColor = string;
type ThemeMode = 'light' | 'dark' | 'system';
type WallpaperType = string; // 'gradient' or a video URL

interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    lightThemeColor: ThemeColor;
    setLightThemeColor: (color: ThemeColor) => void;
    darkThemeColor: ThemeColor;
    setDarkThemeColor: (color: ThemeColor) => void;
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
    cardOpacity: number;
    setCardOpacity: (opacity: number) => void;
    sidebarOpacity: number;
    setSidebarOpacity: (opacity: number) => void;
    gridCardOpacity: number;
    setGridCardOpacity: (opacity: number) => void;
    contentOpacity: number;
    setContentOpacity: (opacity: number) => void;
    layoutOpacity: number;
    setLayoutOpacity: (opacity: number) => void;
    subComponentOpacity: number;
    setSubComponentOpacity: (opacity: number) => void;
    isMirrorOn: boolean;
    setIsMirrorOn: (isOn: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const hexToRgb = (hex: string): string => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    if (!result) return "0, 0, 0";
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r}, ${g}, ${b}`;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const [lightThemeColor, setLightThemeColorState] = useState<ThemeColor>('#101733');
    const [darkThemeColor, setDarkThemeColorState] = useState<ThemeColor>('#FFFFFF'); // Dark mode default is now white
    
    
    const [isSoundOn, setSoundOnState] = useState<boolean>(true);
    const [isAiVoiceOn, setAiVoiceOnState] = useState<boolean>(true);
    const [selectedAiVoiceName, setSelectedAiVoiceNameState] = useState<string>('Nam Minh');
    const [aiVoicePitch, setAiVoicePitchState] = useState<number>(1);
    const [aiVoiceRate, setAiVoiceRateState] = useState<number>(0.95);
    const [projectFilter, setProjectFilterState] = useState<string[]>([]);
    const [wallpaper, setWallpaperState] = useState<WallpaperType>('https://cdn.dribbble.com/userupload/13498087/file/original-b120f6a1a15d71e493f8d4b2d13b0296.mp4');
    const [cardOpacity, setCardOpacityState] = useState<number>(0.4);
    const [sidebarOpacity, setSidebarOpacityState] = useState<number>(0.4);
    const [gridCardOpacity, setGridCardOpacityState] = useState<number>(0.45);
    const [contentOpacity, setContentOpacityState] = useState<number>(0.05);
    const [layoutOpacity, setLayoutOpacityState] = useState<number>(0.02);
    const [subComponentOpacity, setSubComponentOpacityState] = useState<number>(0.8);
    const [isMirrorOn, setIsMirrorOnState] = useState<boolean>(false);
    
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

    const setCardOpacity = (opacity: number) => {
        setCardOpacityState(opacity);
        localStorage.setItem('cardOpacity', String(opacity));
    };

    const setSidebarOpacity = (opacity: number) => {
        setSidebarOpacityState(opacity);
        localStorage.setItem('sidebarOpacity', String(opacity));
    };

    const setGridCardOpacity = (opacity: number) => {
        setGridCardOpacityState(opacity);
        localStorage.setItem('gridCardOpacity', String(opacity));
    };

    const setContentOpacity = (opacity: number) => {
        setContentOpacityState(opacity);
        localStorage.setItem('contentOpacity', String(opacity));
    };

    const setLayoutOpacity = (opacity: number) => {
        setLayoutOpacityState(opacity);
        localStorage.setItem('layoutOpacity', String(opacity));
    };

    const setSubComponentOpacity = (opacity: number) => {
        setSubComponentOpacityState(opacity);
        localStorage.setItem('subComponentOpacity', String(opacity));
    };

    const setIsMirrorOn = (isOn: boolean) => {
        setIsMirrorOnState(isOn);
        localStorage.setItem('isMirrorOn', String(isOn));
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
        const savedCardOpacity = localStorage.getItem('cardOpacity');
        const savedSidebarOpacity = localStorage.getItem('sidebarOpacity');
        const savedGridCardOpacity = localStorage.getItem('gridCardOpacity');
        const savedContentOpacity = localStorage.getItem('contentOpacity');
        const savedLayoutOpacity = localStorage.getItem('layoutOpacity');
        const savedSubComponentOpacity = localStorage.getItem('subComponentOpacity');

        const currentMode = savedMode || 'system';
        setThemeModeState(currentMode);

        if (savedLightColor) setLightThemeColorState(savedLightColor);
        if (savedDarkColor) setDarkThemeColorState(savedDarkColor);
        
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

        if (savedCardOpacity) setCardOpacityState(parseFloat(savedCardOpacity));
        if (savedSidebarOpacity) setSidebarOpacityState(parseFloat(savedSidebarOpacity));
        if (savedGridCardOpacity) setGridCardOpacityState(parseFloat(savedGridCardOpacity));
        if (savedContentOpacity) setContentOpacityState(parseFloat(savedContentOpacity));
        if (savedLayoutOpacity) setLayoutOpacityState(parseFloat(savedLayoutOpacity));
        if (savedSubComponentOpacity) setSubComponentOpacityState(parseFloat(savedSubComponentOpacity));

        const savedMirror = localStorage.getItem('isMirrorOn');
        setIsMirrorOnState(savedMirror === 'true');

        // Migration from old 'video' value to the new URL-based system
        if (savedWallpaper === 'video') {
            savedWallpaper = 'https://cdn.dribbble.com/userupload/13498087/file/original-b120f6a1a15d71e493f8d4b2d13b0296.mp4';
        }

        if (savedWallpaper) {
            setWallpaperState(savedWallpaper);
        } else {
            setWallpaperState('https://cdn.dribbble.com/userupload/13498087/file/original-b120f6a1a15d71e493f8d4b2d13b0296.mp4');
        }

    }, []);

    // Effect to apply theme (mode and color) to the document
    useEffect(() => {
        const root = window.document.documentElement;
        
        const applyTheme = (isDark: boolean) => {
            if (isDark) {
                root.classList.add('dark');
                root.style.setProperty('--accent-color', darkThemeColor);
                root.style.setProperty('--accent-color-rgb', hexToRgb(darkThemeColor));
            } else {
                root.classList.remove('dark');
                root.style.setProperty('--accent-color', lightThemeColor);
                root.style.setProperty('--accent-color-rgb', hexToRgb(lightThemeColor));
            }
        };

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e: MediaQueryListEvent) => {
            if (themeMode === 'system') {
                applyTheme(e.matches);
            }
        };

        if (themeMode === 'system') {
            applyTheme(mediaQuery.matches);
            mediaQuery.addEventListener('change', handleChange);
        } else {
            applyTheme(themeMode === 'dark');
        }

        root.style.setProperty('--card-opacity', String(cardOpacity));
        root.style.setProperty('--sidebar-opacity', String(sidebarOpacity));
        root.style.setProperty('--grid-card-opacity', String(gridCardOpacity));
        root.style.setProperty('--content-opacity', String(contentOpacity));
        root.style.setProperty('--layout-opacity', String(layoutOpacity));
        root.style.setProperty('--sub-component-opacity', String(subComponentOpacity));

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [themeMode, lightThemeColor, darkThemeColor, cardOpacity, sidebarOpacity, gridCardOpacity]);

    const value: ThemeContextType = {
        themeMode,
        setThemeMode,
        lightThemeColor,
        setLightThemeColor,
        darkThemeColor,
        setDarkThemeColor,
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
        cardOpacity,
        setCardOpacity,
        sidebarOpacity,
        setSidebarOpacity,
        gridCardOpacity,
        setGridCardOpacity,
        contentOpacity,
        setContentOpacity,
        layoutOpacity,
        setLayoutOpacity,
        subComponentOpacity,
        setSubComponentOpacity,
        isMirrorOn,
        setIsMirrorOn,
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