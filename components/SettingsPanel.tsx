import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/i18n';
import * as Icons from './Icons';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import PageLayout from './PageLayout';
import CardTitle from './CardTitle';

interface SettingsPageProps {
    id?: string;
}

// Removed data management helpers


const lightGradientWallpapers = [
    'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 100%)',
    'linear-gradient(45deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(45deg, #fad0c4 0%, #ffd1ff 100%)',
    'linear-gradient(45deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(45deg, #c1dfc4 0%, #deecdd 100%)',
    'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(45deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(45deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(45deg, #dfe9f3 0%, #ffffff 100%)',
    'linear-gradient(45deg, #5ee7df 0%, #b490ca 100%)',
    'linear-gradient(45deg, #dff4e4 0%, #f0ddee 24%, #dee7f5 49%, #e9dae4 73%, #cbffff 100%)',
].map(grad => ({ id: grad, type: 'gradient' as const, thumbnail: grad }));

const darkGradientWallpapers = [
    'linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)',
    'linear-gradient(45deg, #13547a 0%, #80d0c7 100%)',
    'linear-gradient(45deg, #ed6ea0 0%, #ec8c69 100%)',
    'linear-gradient(45deg, #000428 0%, #004e92 100%)',
    'linear-gradient(45deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    'linear-gradient(45deg, #373b44 0%, #4286f4 100%)',
    'linear-gradient(45deg, #7028e4 0%, #e5b2ca 100%)',
    'linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)',
    'linear-gradient(45deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(45deg, #0250c5 0%, #d43f8d 100%)',
].map(grad => ({ id: grad, type: 'gradient' as const, thumbnail: grad }));

const specialAndVideoWallpapers = [
    {
        id: 'glassmorphism-effect',
        type: 'custom' as const,
        thumbnail: 'linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)',
    },
    {
        id: 'gradient',
        type: 'gradient' as const,
        thumbnail: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/18230475/file/original-d7ab36998c2277e97c1996d837a4673c.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/9438742/file/original-9334dd4051bb585cc561e8be06870b39.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/4241992/file/original-1fcb82b5ace105f3ec88a2deb08e842d.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/34993295/file/original-2ea4b30fcd7c6eac3ca0f4d5bfd3d67b.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/32536603/file/original-db8060ba2540c3bf1cd2f30b4984cd51.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/32480516/file/original-f4a88d4031fee315e3175bf1834c24b4.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/32404914/file/original-57644971c47c0d16f90a68404a5e65c1.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/16365481/file/original-527fee647d12f31fce8a309ad136c4bb.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/15594644/file/original-6008d4b0ddcff73c116cb7989a144a71.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/14779635/file/original-1aca59fc5dc52bee9dcd291a27effcbf.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/10782874/file/original-06f7280dda982b62cd9452b0da032598.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/32524948/file/original-3c68e4ad227ae70e1875ef71289be2b0.mp4',
        type: 'video' as const,
        thumbnail: 'https://i.postimg.cc/jS3rSGdF/videoframe-8901.png',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/13498087/file/original-b120f6a1a15d71e493f8d4b2d13b0296.mp4',
        type: 'video' as const,
        thumbnail: 'https://i.postimg.cc/BnmJ1jNN/videoframe-3046.png',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/16718734/file/original-f2df9314dbf922d5452d7a8a5885d744.mp4',
        type: 'video' as const,
        thumbnail: 'https://i.postimg.cc/NfYtJ6zp/videoframe-1990.png',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/43797830/file/original-b9bafe56dd75a7ae175f827cfc662738.mp4',
        type: 'video' as const,
        thumbnail: 'https://i.postimg.cc/yNJW1hB0/videoframe-3097.png',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/16365364/file/original-dcc3ad4c0f5802c6670d36fcca720e5e.mp4',
        type: 'video' as const,
        thumbnail: 'https://i.postimg.cc/vBgPtKyD/videoframe-4678.png',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/43797856/file/original-46c91cbdf46a3cbc3f30a85f061ed817.mp4',
        type: 'video' as const,
        thumbnail: 'https://i.postimg.cc/L6TVLSPN/videoframe-3537.png',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/12532568/file/original-816b8af88c5a4336e9f0467a7848033e.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/9535990/file/original-3a87c5fdf2433287d096795a11fa9ee4.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/13253460/file/original-85659da2508a303a516780470e3ae354.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/9783516/file/original-47f57ffecea5c7874ff6d6c2f0ce42bf.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'orbiting-planets',
        type: 'custom' as const,
        thumbnail: 'https://images.pexels.com/photos/1655166/pexels-photo-1655166.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    },
    {
        id: 'dotted-pattern',
        type: 'custom' as const,
        thumbnail: `radial-gradient(circle at 25% 25%, #a3b1c6 15%, transparent 15%), radial-gradient(circle at 75% 75%, #a3b1c6 15%, transparent 15%)`,
        thumbnailBgColor: '#e0e7ed',
        thumbnailBgSize: '10px 10px',
    },
    {
        id: 'dark-dotted-pattern',
        type: 'custom' as const,
        thumbnail: `radial-gradient(circle, rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
        thumbnailBgColor: '#1d1f20',
        thumbnailBgSize: '11px 11px',
    },
];

const videoWallpapers = specialAndVideoWallpapers.filter(w => w.type === 'video');

const imageWallpapers = [
    { id: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', type: 'image' as const, thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' },
    { id: 'https://images.unsplash.com/photo-1633534571871-36baac48a8eb?q=80&w=2670&auto=format&fit=crop', type: 'image' as const, thumbnail: 'https://images.unsplash.com/photo-1633534571871-36baac48a8eb?q=80&w=600&auto=format&fit=crop' },
    { id: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?q=80&w=2670&auto=format&fit=crop', type: 'image' as const, thumbnail: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?q=80&w=600&auto=format&fit=crop' },
    { id: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2758&auto=format&fit=crop', type: 'image' as const, thumbnail: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=600&auto=format&fit=crop' },
    { id: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop', type: 'image' as const, thumbnail: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600&auto=format&fit=crop' },
    { id: 'https://i.ibb.co/G47jTb1g/minimalist-white-background-3840x2160-bright-space-clean-aesthetic-27644.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/G47jTb1g/minimalist-white-background-3840x2160-bright-space-clean-aesthetic-27644.jpg' },
    { id: 'https://i.ibb.co/q2X19rq/geometric-mountain-wallpaper-3840x2160-calming-visuals-simple-patterns-26760.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/q2X19rq/geometric-mountain-wallpaper-3840x2160-calming-visuals-simple-patterns-26760.jpg' },
    { id: 'https://i.ibb.co/R4P1zff0/ta-i-xu-ng-15.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/R4P1zff0/ta-i-xu-ng-15.jpg' },
    { id: 'https://i.ibb.co/TDnD5NB1/ta-i-xu-ng-14.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/TDnD5NB1/ta-i-xu-ng-14.jpg' },
    { id: 'https://i.ibb.co/S49fBKcv/ta-i-xu-ng-13.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/S49fBKcv/ta-i-xu-ng-13.jpg' },
    { id: 'https://i.ibb.co/04qypw8/ta-i-xu-ng-12.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/04qypw8/ta-i-xu-ng-12.jpg' },
    { id: 'https://i.ibb.co/ch1yf4Dz/AVv-Xs-Egn6ve-Lq-M6aj-Fr-XO6-YYuy-NTs-Wt-x9-qxb2w-O8-Xt-OWdn-JECETXTri7-Ps-rnb2-Td-Jnln6xu-kddyc-Yisi1xf.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/ch1yf4Dz/AVv-Xs-Egn6ve-Lq-M6aj-Fr-XO6-YYuy-NTs-Wt-x9-qxb2w-O8-Xt-OWdn-JECETXTri7-Ps-rnb2-Td-Jnln6xu-kddyc-Yisi1xf.jpg' },
    { id: 'https://i.ibb.co/d0Fw0xdW/Best-wallpaper-1.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/d0Fw0xdW/Best-wallpaper-1.jpg' },
    { id: 'https://i.ibb.co/rKL4ffH2/2.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/rKL4ffH2/2.jpg' },
    { id: 'https://i.ibb.co/nq9GHB11/ta-i-xu-ng-12.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/nq9GHB11/ta-i-xu-ng-12.jpg' },
    { id: 'https://i.ibb.co/PZhKjDjP/Abstract-minimalistic-background-image-with-minimal-details-in-silvery-pearlescent-hues-subtle-tex.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/PZhKjDjP/Abstract-minimalistic-background-image-with-minimal-details-in-silvery-pearlescent-hues-subtle-tex.jpg' },
    { id: 'https://i.ibb.co/Fc1dczn/Wallpaper.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/Fc1dczn/Wallpaper.jpg' },
    { id: 'https://i.ibb.co/DDCj9TBk/ta-i-xu-ng-15.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/DDCj9TBk/ta-i-xu-ng-15.jpg' },
    { id: 'https://i.ibb.co/jPN1bS9c/Pastel-Minimal-Wallpaper-Clean-Aesthetic-for-Mac-Book.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/jPN1bS9c/Pastel-Minimal-Wallpaper-Clean-Aesthetic-for-Mac-Book.jpg' },
    { id: 'https://i.ibb.co/chRZYCFs/ta-i-xu-ng-14.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/chRZYCFs/ta-i-xu-ng-14.jpg' },
    { id: 'https://i.ibb.co/k2jTwnTp/ta-i-xu-ng-13.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/k2jTwnTp/ta-i-xu-ng-13.jpg' },
    { id: 'https://i.ibb.co/G4tGQZbB/ta-i-xu-ng-16.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/G4tGQZbB/ta-i-xu-ng-16.jpg' },
    { id: 'https://i.ibb.co/r2w5qZCT/Download-Abstract-Gradient-Circle-Background-for-free.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/r2w5qZCT/Download-Abstract-Gradient-Circle-Background-for-free.jpg' },
    { id: 'https://i.ibb.co/zhc5bK7G/Ton-mental-a-aussi-besoin-de-repos.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/zhc5bK7G/Ton-mental-a-aussi-besoin-de-repos.jpg' },
];

const SettingsPage: React.FC<SettingsPageProps> = ({ id }) => {
    const { t, language } = useI18n();
    const pageData = t.settingsPage;
    const settingsText = t.settings;
    const {
        themeMode, setThemeMode,
        lightThemeColor, setLightThemeColor,
        darkThemeColor, setDarkThemeColor,
        isSoundOn, setSoundOn,
        isAiVoiceOn, setAiVoiceOn,
        selectedAiVoiceName, setSelectedAiVoiceName,
        aiVoicePitch, setAiVoicePitch,
        aiVoiceRate, setAiVoiceRate,
        wallpaper, setWallpaper,
        cardOpacity, setCardOpacity,
        sidebarOpacity, setSidebarOpacity,
        gridCardOpacity, setGridCardOpacity,
        contentOpacity, setContentOpacity,
        layoutOpacity, setLayoutOpacity,
        subComponentOpacity, setSubComponentOpacity,
        isMirrorOn, setIsMirrorOn,
    } = useTheme();

    const { voices, speak, cancel, isSpeaking } = useSpeechSynthesis();


    // --- Local State for pending changes ---
    const [localThemeMode, setLocalThemeMode] = useState(themeMode);
    const [localLightThemeColor, setLocalLightThemeColor] = useState(lightThemeColor);
    const [localDarkThemeColor, setLocalDarkThemeColor] = useState(darkThemeColor);
    const [localSound, setLocalSound] = useState(isSoundOn);
    const [localAiVoice, setLocalAiVoice] = useState(isAiVoiceOn);
    const [localVoiceName, setLocalVoiceName] = useState(selectedAiVoiceName);
    const [localVoicePitch, setLocalVoicePitch] = useState(aiVoicePitch);
    const [localVoiceRate, setLocalVoiceRate] = useState(aiVoiceRate);
    const [localWallpaper, setLocalWallpaper] = useState(wallpaper);
    const [localCardOpacity, setLocalCardOpacity] = useState(cardOpacity);
    const [localSidebarOpacity, setLocalSidebarOpacity] = useState(sidebarOpacity);
    const [localGridCardOpacity, setLocalGridCardOpacity] = useState(gridCardOpacity);
    const [localContentOpacity, setLocalContentOpacity] = useState(contentOpacity);
    const [localLayoutOpacity, setLocalLayoutOpacity] = useState(layoutOpacity);
    const [localSubComponentOpacity, setLocalSubComponentOpacity] = useState(subComponentOpacity);
    const [localMirrorOn, setLocalMirrorOn] = useState(isMirrorOn);
    const [settingsTab, setSettingsTab] = useState<'giao-dien' | 'hinh-nen' | 'voice' | 'data'>('giao-dien');
    const [activeTab, setActiveTab] = useState<'gradient' | 'video' | 'image'>(() => {
        if (videoWallpapers.some(w => w.id === wallpaper)) return 'video';
        if (imageWallpapers.some(w => w.id === wallpaper)) return 'image';
        return 'gradient';
    });
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    // This is derived state for the UI to use for the color picker
    const resolvedMode = useMemo(() => {
        if (localThemeMode !== 'system') return localThemeMode;
        if (typeof window === 'undefined') return 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }, [localThemeMode]);

    const localThemeColor = resolvedMode === 'light' ? localLightThemeColor : localDarkThemeColor;

    // This sets the color for the currently selected local mode
    const setLocalThemeColor = (color: string) => {
        if (resolvedMode === 'light') {
            setLocalLightThemeColor(color);
        } else {
            setLocalDarkThemeColor(color);
        }
    };

    // Reset local state if context changes (e.g., settings loaded initially)
    useEffect(() => {
        setLocalThemeMode(themeMode);
        setLocalLightThemeColor(lightThemeColor);
        setLocalDarkThemeColor(darkThemeColor);
        setLocalSound(isSoundOn);
        setLocalAiVoice(isAiVoiceOn);
        setLocalVoiceName(selectedAiVoiceName);
        setLocalVoicePitch(aiVoicePitch);
        setLocalVoiceRate(aiVoiceRate);
        setLocalWallpaper(wallpaper);
        setLocalCardOpacity(cardOpacity);
        setLocalSidebarOpacity(sidebarOpacity);
        setLocalGridCardOpacity(gridCardOpacity);
        setLocalContentOpacity(contentOpacity);
        setLocalLayoutOpacity(layoutOpacity);
        setLocalSubComponentOpacity(subComponentOpacity);
        setLocalMirrorOn(isMirrorOn);
    }, [themeMode, lightThemeColor, darkThemeColor, isSoundOn, isAiVoiceOn, selectedAiVoiceName, aiVoicePitch, aiVoiceRate, wallpaper, cardOpacity, sidebarOpacity, gridCardOpacity, contentOpacity, layoutOpacity, subComponentOpacity, isMirrorOn]);

    const handleSaveChanges = () => {
        setThemeMode(localThemeMode);
        setLightThemeColor(localLightThemeColor);
        setDarkThemeColor(localDarkThemeColor);
        setSoundOn(localSound);
        setAiVoiceOn(localAiVoice);
        setSelectedAiVoiceName(localVoiceName);
        setAiVoicePitch(localVoicePitch);
        setAiVoiceRate(localVoiceRate);
        setWallpaper(localWallpaper);
        setCardOpacity(localCardOpacity);
        setSidebarOpacity(localSidebarOpacity);
        setGridCardOpacity(localGridCardOpacity);
        setContentOpacity(localContentOpacity);
        setLayoutOpacity(localLayoutOpacity);
        setSubComponentOpacity(localSubComponentOpacity);
        setIsMirrorOn(localMirrorOn);
        setShowSaveSuccess(true);
        setTimeout(() => {
            setShowSaveSuccess(false);
        }, 3000);
    };

    const handleResetChanges = () => {
        // Revert local state to the master context state
        setLocalThemeMode(themeMode);
        setLocalLightThemeColor(lightThemeColor);
        setLocalDarkThemeColor(darkThemeColor);
        setLocalSound(isSoundOn);
        setLocalAiVoice(isAiVoiceOn);
        setLocalVoiceName(selectedAiVoiceName);
        setLocalVoicePitch(aiVoicePitch);
        setLocalVoiceRate(aiVoiceRate);
        setLocalWallpaper(wallpaper);
        setLocalCardOpacity(cardOpacity);
        setLocalSidebarOpacity(sidebarOpacity);
        setLocalGridCardOpacity(gridCardOpacity);
        setLocalContentOpacity(contentOpacity);
        setLocalLayoutOpacity(layoutOpacity);
        setLocalSubComponentOpacity(subComponentOpacity);
        setLocalMirrorOn(isMirrorOn);
    };


    const availableVoices = useMemo(() => {
        return voices.filter(v => {
            const nameLower = v.name.toLowerCase();
            const isCustomNatural = nameLower.includes('natural') || nameLower.includes('multilingual');
            return v.lang.toLowerCase().startsWith('vi') || v.name.includes('tiếng Việt') || v.name.includes('gTTS') || isCustomNatural;
        });
    }, [voices]);

    const groupedVoices = useMemo(() => {
        if (!availableVoices.length) return { vi: [] };

        const vi: typeof availableVoices = [];
        const seenKeys = new Set<string>();

        availableVoices.forEach(voice => {
            const key = `${voice.name}_${voice.lang}`;
            if (seenKeys.has(key)) return;
            seenKeys.add(key);

            vi.push(voice);
        });

        return { vi };
    }, [availableVoices]);

    useEffect(() => {
        if (groupedVoices.vi.length > 0) {
            const matchedVoice = groupedVoices.vi.find(v => v.name === localVoiceName) || 
                                 groupedVoices.vi.find(v => {
                                     const searchClean = localVoiceName.toLowerCase().replace(/\s+/g, '');
                                     const voiceClean = v.name.toLowerCase().replace(/\s+/g, '');
                                     return voiceClean.includes(searchClean) || searchClean.includes(voiceClean);
                                 });

            if (matchedVoice) {
                if (matchedVoice.name !== localVoiceName) {
                    setLocalVoiceName(matchedVoice.name);
                }
            } else {
                // If we are still in the initial state with only the mock gTTS voice,
                // and localVoiceName equals the actual saved selectedAiVoiceName,
                // do NOT reset yet because real system voices are likely still loading in the background.
                if (groupedVoices.vi.length === 1 && groupedVoices.vi[0].name.includes('gTTS') && localVoiceName === selectedAiVoiceName) {
                    return;
                }

                const defaultVi = groupedVoices.vi.find(v => v.name.includes('gTTS')) || 
                                  groupedVoices.vi.find(v => v.name.includes('Google tiếng Việt') || v.lang.startsWith('vi')) || 
                                  groupedVoices.vi[0];
                if (defaultVi) {
                    setLocalVoiceName(defaultVi.name);
                }
            }
        }
    }, [groupedVoices.vi, localVoiceName, selectedAiVoiceName]);

    const accentColors = ['#101733', '#ED1B2F', '#AE2070', '#FF6525', '#FFB300', '#49C16C', '#0078D4', '#6C6CE5', '#FFFFFF', '#001D39', '#0A4174', '#49769F', '#4E8EA2', '#6EA2B3', '#7BBDE8', '#BDD8E9'];
    
    const gradientWallpapers = useMemo(() => {
        const themeGradients = resolvedMode === 'light' ? lightGradientWallpapers : darkGradientWallpapers;
        const animatedGradient = specialAndVideoWallpapers.find(w => w.id === 'gradient');
        const customWallpapers = specialAndVideoWallpapers.filter(w => w.type === 'custom');
        return [animatedGradient, ...themeGradients, ...customWallpapers].filter(Boolean);
    }, [resolvedMode]);


    const exportToTxt = () => {
        const d = t; // Entire translation object for current language
        const pInfo = d.aboutPage || {};
        const letter = d.coverLetterPage || {};
        const work = d.workExperiencePage || {};
        const edu = d.educationPage || {};
        const srv = d.servicesPage || {};
        const skl = d.skillsPage || {};
        const prj = d.projectsPage || {};
        
        let content = "";
        
        // Helper: Section Separator
        const addSeparator = (title: string) => {
            const line = "============================================================";
            return `\n${line}\n   ${title.toUpperCase()}\n${line}\n\n`;
        };
        
        const addSubSeparator = (title: string) => {
            const line = "----------------------------------------";
            return `\n${title.toUpperCase()}\n${line}\n`;
        };

        // 1. HEADER
        content += "============================================================\n";
        content += `                  HỒ SƠ NĂNG LỰC / PORTFOLIO\n`;
        content += `                     NĂNG LỰC THỰC CHIẾN\n`;
        content += "============================================================\n\n";
        
        content += `${d.sidebar?.name || "Nguyễn Hùng Thái"}\n`;
        content += `${d.sidebar?.jobTitle || "Giám đốc Dịch vụ Khách hàng"}\n\n`;
        
        // Taglines
        if (d.hero?.taglines) {
            content += `${d.hero.taglines.join(" | ")}\n\n`;
        }
        
        // 2. PERSONAL INFO
        content += addSeparator(pInfo.personalInfoTitle || "Thông tin cá nhân");
        if (pInfo.infoItems) {
            pInfo.infoItems.forEach((item: any) => {
                content += `- ${item.label}: ${item.value}\n`;
            });
        }
        content += "\n";
        
        // 3. COVER LETTER
        content += addSeparator(letter.badge || "Thư ngỏ");
        content += `${letter.greeting || "Kính gửi Quý Công ty,"}\n\n`;
        if (letter.paragraphs) {
            letter.paragraphs.forEach((p: string) => {
                content += `${p.replace(/\n/g, "\n")}\n\n`;
            });
        }
        content += `${letter.closing || "Trân trọng,"}\n`;
        content += `${letter.signature || "Nguyễn Hùng Thái"}\n\n`;
        
        // 4. CORE VALUES
        content += addSeparator(pInfo.title || "Giới thiệu bản thân");
        if (pInfo.paragraphs) {
            pInfo.paragraphs.forEach((p: string) => {
                const cleanText = p.replace(/<\/?[^>]+(>|$)/g, "");
                content += `${cleanText}\n\n`;
            });
        }
        if (pInfo.coreValues) {
            content += `${language === 'vi' ? 'Giá trị cốt lõi' : 'Core Values'}: ${pInfo.coreValues}\n\n`;
        }
        if (pInfo.concludingParagraph) {
            const cleanText = pInfo.concludingParagraph.replace(/<\/?[^>]+(>|$)/g, "");
            content += `${cleanText}\n\n`;
        }
        
        // 5. WORK EXPERIENCE
        content += addSeparator(work.title || "Kinh nghiệm làm việc");
        if (work.jobs) {
            work.jobs.forEach((job: any) => {
                content += `💼 ${job.company}\n`;
                content += `   ${work.positionTitle || 'Vị trí'}: ${job.title}\n`;
                content += `   ${work.durationTitle || 'Thời gian'}: ${job.date}\n`;
                if (job.teamSize) {
                    content += `   ${work.managedTitle || 'Quản lý'}: ${job.teamSize}\n`;
                }
                
                content += `\n   * ${work.descriptionTitle || 'Mô tả công việc'}:\n`;
                if (job.responsibilities) {
                    job.responsibilities.forEach((r: string) => {
                        content += `     - ${r}\n`;
                    });
                }
                
                if (job.achievements && job.achievements.length > 0) {
                    content += `\n   * ${work.achievementsTitle || 'Thành tựu chính'}:\n`;
                    job.achievements.forEach((a: any) => {
                        content += `     - ${a.label}: ${a.value}%\n`;
                    });
                }
                content += `\n${"-".repeat(50)}\n\n`;
            });
        }
        
        // 6. EDUCATION
        content += addSeparator(edu.title || "Học vấn");
        if (edu.items) {
            edu.items.forEach((item: any) => {
                content += `🎓 [${item.year}] ${item.title}\n`;
                content += `   ${item.institution}\n`;
                if (item.description) {
                    content += `   ${item.description}\n`;
                }
                content += "\n";
            });
        }
        
        // 7. SERVICES & DOMAINS
        content += addSeparator(srv.title || "Lĩnh vực chuyên môn");
        if (srv.services) {
            srv.services.forEach((service: any) => {
                content += `🌐 ${service.title}\n`;
                content += `   ${service.description}\n\n`;
            });
        }
        
        // 8. PROFESSIONAL SKILLS
        content += addSeparator(skl.title || "Kỹ năng & Năng lực");
        if (skl.categories) {
            skl.categories.forEach((cat: any) => {
                content += addSubSeparator(cat.title);
                if (cat.skills) {
                    cat.skills.forEach((skill: any) => {
                        content += `- ${skill.name} (${skill.level}%)\n`;
                    });
                }
                content += "\n";
            });
        }
        
        // 9. KEY PROJECTS
        content += addSeparator(prj.title || "Dự án tiêu biểu");
        if (prj.projects) {
            prj.projects.forEach((p: any) => {
                content += `🚀 [Dự án ${p.id}] ${p.title}\n`;
                content += `   ${language === 'vi' ? 'Nhóm' : 'Group'}: ${p.group}\n`;
                if (p.stage) {
                    content += `   ${prj.stageLabel || 'Giai đoạn'}: ${p.stage}\n`;
                }
                content += `   Mô tả: ${p.description}\n`;
                if (p.hashtags) {
                    content += `   Hashtags: ${p.hashtags.join(", ")}\n`;
                }
                content += "\n";
            });
        }
        
        // FOOTER
        content += "============================================================\n";
        content += `    Tập tin được xuất tự động từ hệ thống Portfolio Nguyễn Hùng Thái\n`;
        content += `    Ngày xuất: ${new Date().toLocaleDateString('vi-VN')} - Trân trọng cảm ơn!\n`;
        content += "============================================================\n";

        // Create Blob and Download
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Nguyen_Hung_Thai_CV_Portfolio_${language}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <PageLayout id={id}>
            <div className="info-card">
                 <div className="settings-header flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
                    <CardTitle
                        icon={<Icons.SettingsIcon />}
                        text={pageData.badge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                    <div className="settings-actions flex flex-wrap gap-2">
                        <button className="btn btn-secondary" onClick={handleResetChanges} style={{ borderRadius: '999px' }}>
                            {settingsText.resetButton}
                        </button>
                        <button className="btn btn-primary" onClick={handleSaveChanges} style={{ borderRadius: '999px' }}>
                            {settingsText.saveButton}
                        </button>
                    </div>
                </div>

                {/* Sub-tab navigation inside settings panel */}
                <div className="settings-tabs-header mb-6 flex flex-wrap gap-2 border-b border-white/5 pb-4">
                    <button 
                        className={`btn px-5 py-2.5 rounded-full transition-all duration-300 font-semibold text-sm flex items-center gap-2 ${settingsTab === 'giao-dien' ? 'btn-primary shadow-lg shadow-[var(--accent-color)]/25' : 'btn-secondary bg-white/5 hover:bg-white/10'}`}
                        onClick={() => setSettingsTab('giao-dien')}
                    >
                        <Icons.LayoutGridIcon size={16} />
                        <span>{language === 'vi' ? 'Giao diện' : 'Layout'}</span>
                    </button>
                    <button 
                        className={`btn px-5 py-2.5 rounded-full transition-all duration-300 font-semibold text-sm flex items-center gap-2 ${settingsTab === 'hinh-nen' ? 'btn-primary shadow-lg shadow-[var(--accent-color)]/25' : 'btn-secondary bg-white/5 hover:bg-white/10'}`}
                        onClick={() => setSettingsTab('hinh-nen')}
                    >
                        <Icons.LayersIcon size={16} />
                        <span>{language === 'vi' ? 'Hình nền' : 'Wallpaper'}</span>
                    </button>
                    <button 
                        className={`btn px-5 py-2.5 rounded-full transition-all duration-300 font-semibold text-sm flex items-center gap-2 ${settingsTab === 'voice' ? 'btn-primary shadow-lg shadow-[var(--accent-color)]/25' : 'btn-secondary bg-white/5 hover:bg-white/10'}`}
                        onClick={() => setSettingsTab('voice')}
                    >
                        <Icons.BotIcon size={16} />
                        <span>{language === 'vi' ? 'Giọng nói AI' : 'AI Voice Assistant'}</span>
                    </button>
                    <button 
                        className={`btn px-5 py-2.5 rounded-full transition-all duration-300 font-semibold text-sm flex items-center gap-2 ${settingsTab === 'data' ? 'btn-primary shadow-lg shadow-[var(--accent-color)]/25' : 'btn-secondary bg-white/5 hover:bg-white/10'}`}
                        onClick={() => setSettingsTab('data')}
                    >
                        <Icons.ServerIcon size={16} />
                        <span>{language === 'vi' ? 'Dữ liệu hệ thống' : 'System Data'}</span>
                    </button>
                </div>

                <div className="settings-content-container no-scrollbar">
                    {settingsTab === 'giao-dien' && (
                        <div className="settings-tab-content-grid grid grid-cols-2 gap-6 w-full">
                            {/* Left Column: Color theme & sliders */}
                            <div className="settings-card flex flex-col gap-6">
                                <h4 className="settings-card-title text-lg font-bold border-b border-white/5 pb-2 mb-4">
                                    {language === 'vi' ? 'Chế độ & Tùy chọn' : 'Theme & Options'}
                                </h4>
                                
                                <div className="setting-item flex justify-between items-center">
                                    <label className="font-medium text-sm">{settingsText.mode}</label>
                                    <div className="mode-selector flex gap-1 bg-white/5 p-1 rounded-full">
                                        <button className={`mode-button flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${localThemeMode === 'light' ? 'active bg-white text-black' : 'text-gray-300 hover:text-white'}`} onClick={() => setLocalThemeMode('light')}>
                                            <Icons.SunIcon size={14} /> {settingsText.light}
                                        </button>
                                        <button className={`mode-button flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${localThemeMode === 'dark' ? 'active bg-white text-black' : 'text-gray-300 hover:text-white'}`} onClick={() => setLocalThemeMode('dark')}>
                                            <Icons.MoonIcon size={14} /> {settingsText.dark}
                                        </button>
                                        <button className={`mode-button flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${localThemeMode === 'system' ? 'active bg-white text-black' : 'text-gray-300 hover:text-white'}`} onClick={() => setLocalThemeMode('system')}>
                                            <Icons.LaptopIcon size={14} /> {settingsText.system}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
                                    <h5 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                        {language === 'vi' ? 'Độ trong suốt' : 'Transparency Controls'}
                                    </h5>
                                    <button 
                                        onClick={() => {
                                            setLocalSidebarOpacity(0.4);
                                            setLocalContentOpacity(0.05);
                                            setLocalLayoutOpacity(0.02);
                                            setLocalCardOpacity(0.4);
                                            setLocalSubComponentOpacity(0.8);
                                        }}
                                        className="text-[10px] font-bold text-[var(--accent-color)] hover:underline flex items-center gap-1 opacity-80 hover:opacity-100"
                                    >
                                        <Icons.RotateCcwIcon size={10} /> {language === 'vi' ? 'Đặt lại tất cả' : 'Reset All'}
                                    </button>
                                </div>

                                <div className="setting-item flex flex-col gap-2">
                                    <label htmlFor="sidebar-opacity-slider" className="w-full flex justify-between text-sm font-medium">
                                        <span className="flex items-center gap-2">
                                            {language === 'vi' ? '1. Giao diện tổng (Sidebar)' : '1. Sidebar Transparency'}
                                            <button onClick={() => setLocalSidebarOpacity(0.4)} title="Reset" className="text-gray-500 hover:text-[var(--accent-color)] transition-colors">
                                                <Icons.RotateCcwIcon size={12} />
                                            </button>
                                        </span>
                                        <span>({localSidebarOpacity.toFixed(2)})</span>
                                    </label>
                                    <input
                                        id="sidebar-opacity-slider"
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={localSidebarOpacity}
                                        onChange={(e) => setLocalSidebarOpacity(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    />
                                </div>

                                <div className="setting-item flex flex-col gap-2">
                                    <label htmlFor="content-opacity-slider" className="w-full flex justify-between text-sm font-medium">
                                        <span className="flex items-center gap-2">
                                            {language === 'vi' ? '2. Khung Content' : '2. Content Frame Transparency'}
                                            <button onClick={() => setLocalContentOpacity(0.05)} title="Reset" className="text-gray-500 hover:text-[var(--accent-color)] transition-colors">
                                                <Icons.RotateCcwIcon size={12} />
                                            </button>
                                        </span>
                                        <span>({localContentOpacity.toFixed(2)})</span>
                                    </label>
                                    <input
                                        id="content-opacity-slider"
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={localContentOpacity}
                                        onChange={(e) => setLocalContentOpacity(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    />
                                </div>

                                <div className="setting-item flex flex-col gap-2">
                                    <label htmlFor="layout-opacity-slider" className="w-full flex justify-between text-sm font-medium">
                                        <span className="flex items-center gap-2">
                                            {language === 'vi' ? '3. Page Layout' : '3. Page Layout Transparency'}
                                            <button onClick={() => setLocalLayoutOpacity(0.02)} title="Reset" className="text-gray-500 hover:text-[var(--accent-color)] transition-colors">
                                                <Icons.RotateCcwIcon size={12} />
                                            </button>
                                        </span>
                                        <span>({localLayoutOpacity.toFixed(2)})</span>
                                    </label>
                                    <input
                                        id="layout-opacity-slider"
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={localLayoutOpacity}
                                        onChange={(e) => setLocalLayoutOpacity(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    />
                                </div>

                                <div className="setting-item flex flex-col gap-2">
                                    <label htmlFor="card-opacity-slider" className="w-full flex justify-between text-sm font-medium">
                                        <span className="flex items-center gap-2">
                                            {language === 'vi' ? '4. Thẻ Info Card' : '4. Info Card Transparency'}
                                            <button onClick={() => setLocalCardOpacity(0.4)} title="Reset" className="text-gray-500 hover:text-[var(--accent-color)] transition-colors">
                                                <Icons.RotateCcwIcon size={12} />
                                            </button>
                                        </span>
                                        <span>({localCardOpacity.toFixed(2)})</span>
                                    </label>
                                    <input
                                        id="card-opacity-slider"
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={localCardOpacity}
                                        onChange={(e) => setLocalCardOpacity(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    />
                                </div>

                                <div className="setting-item flex flex-col gap-2">
                                    <label htmlFor="sub-component-opacity-slider" className="w-full flex justify-between text-sm font-medium">
                                        <span className="flex items-center gap-2">
                                            {language === 'vi' ? '5. Thành phần con' : '5. Sub-component Visibility'}
                                            <button onClick={() => setLocalSubComponentOpacity(0.8)} title="Reset" className="text-gray-500 hover:text-[var(--accent-color)] transition-colors">
                                                <Icons.RotateCcwIcon size={12} />
                                            </button>
                                        </span>
                                        <span>({localSubComponentOpacity.toFixed(2)})</span>
                                    </label>
                                    <input
                                        id="sub-component-opacity-slider"
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={localSubComponentOpacity}
                                        onChange={(e) => setLocalSubComponentOpacity(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    />
                                </div>

                                <div className="setting-item flex justify-between items-center">
                                    <label className="font-medium text-sm">{settingsText.accentColor}</label>
                                    <div className="color-pallet flex flex-wrap gap-2">
                                        {accentColors.map(color => (
                                            <button
                                                key={color}
                                                className={`color-dot w-6 h-6 rounded-full border-2 transition-all ${localThemeColor.toLowerCase() === color.toLowerCase() ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setLocalThemeColor(color)}
                                                aria-label={`Select color ${color}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                </div>
                            </div>
                    )}
                    {settingsTab === 'hinh-nen' && (
                        <div className="settings-card flex flex-col gap-6">
                            <h4 className="settings-card-title text-lg font-bold border-b border-white/5 pb-2 mb-4">
                                {language === 'vi' ? 'Thư viện hình nền' : 'Wallpaper Gallery'}
                            </h4>
                            
                            <div className="setting-item flex flex-col gap-4">
                                     <div className="wallpaper-tabs flex gap-2 bg-white/5 p-1 rounded-full w-fit">
                                    <button 
                                        className={`wallpaper-tab-btn px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab === 'gradient' ? 'active bg-white text-black' : 'text-gray-300 hover:text-white'}`} 
                                        onClick={() => setActiveTab('gradient')}
                                    >
                                        {settingsText.gradient}
                                    </button>
                                    <button 
                                        className={`wallpaper-tab-btn px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab === 'video' ? 'active bg-white text-black' : 'text-gray-300 hover:text-white'}`} 
                                        onClick={() => setActiveTab('video')}
                                    >
                                        {settingsText.video}
                                    </button>
                                    <button 
                                        className={`wallpaper-tab-btn px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab === 'image' ? 'active bg-white text-black' : 'text-gray-300 hover:text-white'}`} 
                                        onClick={() => setActiveTab('image')}
                                    >
                                        {settingsText.image}
                                    </button>
                                </div>

                                {activeTab === 'gradient' && (
                                    <div className="wallpaper-tab-content">
                                        <div className="wallpaper-selector grid grid-cols-4 gap-2">
                                            {gradientWallpapers.map((option, index) => (
                                                <button
                                                    key={option.id}
                                                    className={`wallpaper-thumbnail aspect-[16/10] rounded-lg border-2 overflow-hidden transition-all relative ${localWallpaper === option.id ? 'border-[var(--accent-color)] scale-95 shadow-md shadow-[var(--accent-color)]/25' : 'border-transparent hover:scale-102'}`}
                                                    onClick={() => setLocalWallpaper(option.id)}
                                                    aria-label={`Wallpaper option ${index + 1}`}
                                                    title={`Wallpaper option ${index + 1}`}
                                                >
                                                    <div 
                                                        className="wallpaper-gradient-preview w-full h-full" 
                                                        style={{ 
                                                            background: (option as any).thumbnail, 
                                                            backgroundColor: (option as any).thumbnailBgColor,
                                                            backgroundSize: (option as any).thumbnailBgSize || '200% 200%' 
                                                        }}>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'video' && (
                                    <div className="wallpaper-tab-content">
                                            <div className="wallpaper-selector grid grid-cols-4 gap-2">
                                            {videoWallpapers.map((option, index) => (
                                                <button
                                                        key={option.id}
                                                        className={`wallpaper-thumbnail aspect-[16/10] rounded-lg border-2 overflow-hidden transition-all relative ${localWallpaper === option.id ? 'border-[var(--accent-color)] scale-95 shadow-md shadow-[var(--accent-color)]/25' : 'border-transparent hover:scale-102'}`}
                                                        onClick={() => setLocalWallpaper(option.id)}
                                                        aria-label={`Wallpaper option ${index + 1}`}
                                                        title={`Wallpaper option ${index + 1}`}
                                                    >
                                                        <video 
                                                            src={option.id} 
                                                            muted 
                                                            loop 
                                                            playsInline autoPlay preload="auto" poster={option.thumbnail || undefined}
                                                            className="wallpaper-video-preview-img w-full h-full object-cover" 
                                                        />
                                                        <div style={{
                                                            position: 'absolute',
                                                            bottom: '3px',
                                                            right: '3px',
                                                            backgroundColor: 'rgba(0,0,0,0.6)',
                                                            color: '#fff',
                                                            fontSize: '6.5pt',
                                                            padding: '1.5px 3.5px',
                                                            borderRadius: '3px',
                                                            pointerEvents: 'none',
                                                            lineHeight: '1',
                                                            fontWeight: '700'
                                                        }}>
                                                            VIDEO
                                                        </div>
                                                    </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'image' && (
                                    <div className="wallpaper-tab-content">
                                        <div className="wallpaper-selector grid grid-cols-4 gap-2">
                                            {imageWallpapers.map((option, index) => (
                                                <button
                                                    key={option.id}
                                                    className={`wallpaper-thumbnail aspect-[16/10] rounded-lg border-2 overflow-hidden transition-all relative ${localWallpaper === option.id ? 'border-[var(--accent-color)] scale-95 shadow-md shadow-[var(--accent-color)]/25' : 'border-transparent hover:scale-102'}`}
                                                    onClick={() => setLocalWallpaper(option.id)}
                                                    aria-label={`Wallpaper option ${index + 1}`}
                                                    title={`Wallpaper option ${index + 1}`}
                                                >
                                                    <img 
                                                            src={option.thumbnail} 
                                                            alt={`Wallpaper ${index + 1}`}
                                                            className="wallpaper-image-preview-img w-full h-full object-cover" 
                                                        />
                                                        <div style={{
                                                            position: 'absolute',
                                                            bottom: '3px',
                                                            right: '3px',
                                                            backgroundColor: 'rgba(0,0,0,0.6)',
                                                            color: '#fff',
                                                            fontSize: '6.5pt',
                                                            padding: '1.5px 3.5px',
                                                            borderRadius: '3px',
                                                            pointerEvents: 'none',
                                                            lineHeight: '1',
                                                            fontWeight: '700'
                                                        }}>
                                                            IMAGE
                                                        </div>
                                                    </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {settingsTab === 'voice' && (
                        <div className="settings-tab-content-grid max-w-xl mx-auto flex flex-col gap-6">
                            <div className="settings-card flex flex-col gap-6">
                                <h4 className="settings-card-title text-lg font-bold border-b border-white/5 pb-2 mb-4">
                                    {language === 'vi' ? 'Trợ lý giọng nói & Âm thanh' : 'Voice & Sound Effects'}
                                </h4>

                                <div className="setting-item switch flex justify-between items-center">
                                    <label className="font-semibold text-sm">{settingsText.soundEffects}</label>
                                    <div
                                        role="switch"
                                        aria-checked={localSound}
                                        className={`toggle-switch ${localSound ? 'is-on' : ''}`}
                                        onClick={() => setLocalSound(!localSound)}
                                    >
                                        <div className="toggle-slider"></div>
                                    </div>
                                </div>
                                
                                <div className="setting-item switch flex justify-between items-center">
                                    <label className="font-semibold text-sm">{settingsText.aiVoice}</label>
                                    <div
                                        role="switch"
                                        aria-checked={localAiVoice}
                                        className={`toggle-switch ${localAiVoice ? 'is-on' : ''}`}
                                        onClick={() => setLocalAiVoice(!localAiVoice)}
                                    >
                                        <div className="toggle-slider"></div>
                                    </div>
                                </div>

                                {localAiVoice && availableVoices.length > 0 && (
                                    <div className="flex flex-col gap-5 border-t border-white/5 pt-4 mt-2">
                                        <div className="setting-item flex flex-col items-start gap-2">
                                            <label htmlFor="ai-voice-select" className="text-sm font-semibold w-full">{settingsText.aiVoiceSelect}</label>
                                            <div className="flex items-center gap-3 w-full">
                                                <div className="custom-select-wrapper flex-1 relative">
                                                    <select 
                                                        id="ai-voice-select"
                                                        value={localVoiceName}
                                                        onChange={(e) => setLocalVoiceName(e.target.value)}
                                                        className="custom-select w-full bg-white/5 border border-white/10 rounded-full py-2 px-4 text-sm appearance-none pr-10 focus:outline-none focus:border-[var(--accent-color)]"
                                                    >
                                                        {groupedVoices.vi.length > 0 ? (
                                                            groupedVoices.vi.map(voice => (
                                                                <option key={`${voice.name}_${voice.lang}`} value={voice.name} className="text-black">
                                                                    {voice.name} ({voice.lang})
                                                                </option>
                                                            ))
                                                        ) : (
                                                            <option value="" className="text-black">Không tìm thấy giọng nói Tiếng Việt</option>
                                                        )}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        <Icons.ChevronDownIcon size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-2 w-full">
                                                <button
                                                    onClick={() => {
                                                        if (isSpeaking) {
                                                            cancel();
                                                        } else {
                                                            const selectedVoice = voices.find(v => v.name === localVoiceName) || 
                                                                                  voices.find(v => {
                                                                                      const searchClean = localVoiceName.toLowerCase().replace(/\s+/g, '');
                                                                                      const voiceClean = v.name.toLowerCase().replace(/\s+/g, '');
                                                                                      return voiceClean.includes(searchClean) || searchClean.includes(voiceClean);
                                                                                  });
                                                              const voiceLang = selectedVoice?.lang?.toLowerCase() || '';
                                                              const isVi = voiceLang.startsWith('vi') || localVoiceName.toLowerCase().includes('tiếng việt') || localVoiceName.toLowerCase().includes('vi-') || localVoiceName.toLowerCase().includes('gtts');
                                                              const isEn = voiceLang.startsWith('en') || localVoiceName.toLowerCase().includes('english') || localVoiceName.toLowerCase().includes('en-');
                                                              let text = "Hello, this is a test voice.";
                                                              let targetLang = voiceLang;

                                                              if (isVi) {
                                                                  const viPhrases = [
                                                                      "Xin chào, tôi là Nguyễn Hùng Thái.",
                                                                      "Trải nghiệm khách hàng là nền tảng của sự phát triển bền vững.",
                                                                      "Một hệ thống tốt là một hệ thống không phụ thuộc vào cá nhân.",
                                                                      "Người lãnh đạo giỏi tạo ra nhiều nhà lãnh đạo mới.",
                                                                      "Sự hài lòng không đến từ hoàn hảo, mà từ sự đồng cảm kịp thời.",
                                                                      "Dịch vụ khách hàng không phải là trả lời câu hỏi, mà là xây dựng niềm tin."
                                                                  ];
                                                                  text = viPhrases[Math.floor(Math.random() * viPhrases.length)];
                                                                  targetLang = 'vi';
                                                              } else if (isEn) {
                                                                  text = "Hello, this is a test voice.";
                                                                  targetLang = 'en';
                                                              } else if (voiceLang.startsWith('fr')) {
                                                                  text = "Bonjour, ceci est une voix de test.";
                                                              } else if (voiceLang.startsWith('es')) {
                                                                  text = "Hola, esta es una voz de prueba.";
                                                              } else if (voiceLang.startsWith('ja')) {
                                                                  text = "こんにちは、これはテストの音声です。";
                                                              } else if (voiceLang.startsWith('zh')) {
                                                                  text = "您好，这是一段测试语音。";
                                                              } else if (voiceLang.startsWith('ko')) {
                                                                  text = "안녕하세요, 테스트 목 sở리입니다.";
                                                              } else if (voiceLang.startsWith('de')) {
                                                                  text = "Hallo, das ist eine Teststimme.";
                                                              } else if (voiceLang.startsWith('it')) {
                                                                  text = "Ciao, questa è una voce di prova.";
                                                              }
                                                              speak(text, { voiceName: localVoiceName, lang: targetLang, pitch: localVoicePitch, rate: localVoiceRate });
                                                          }
                                                      }}
                                                      className={`
                                                          relative overflow-hidden group
                                                          bg-white/5 border border-white/10 hover:bg-white/10
                                                          px-5 py-2 rounded-full transition-all duration-300 
                                                          flex items-center justify-center gap-2 text-xs font-semibold
                                                          w-full
                                                          ${isSpeaking ? 'ring-2 ring-primary/50' : ''}
                                                      `}
                                                  >
                                                      {isSpeaking ? <Icons.PauseIcon size={14} className="animate-pulse" /> : <Icons.PlayIcon size={14} />}
                                                      <span>{isSpeaking ? 'Đang nói (Click để dừng)' : 'Nghe thử giọng nói'}</span>
                                                  </button>
                                              </div>
                                        </div>

                                        <div className="setting-item flex flex-col gap-2">
                                            <label htmlFor="ai-voice-pitch" className="w-full flex justify-between text-sm font-semibold">
                                                <span>Cao độ</span>
                                                <span>({localVoicePitch.toFixed(1)})</span>
                                            </label>
                                            <input
                                                id="ai-voice-pitch"
                                                type="range"
                                                min="0.5"
                                                max="2"
                                                step="0.1"
                                                value={localVoicePitch}
                                                onChange={(e) => setLocalVoicePitch(parseFloat(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                            />
                                        </div>

                                        <div className="setting-item flex flex-col gap-2">
                                            <label htmlFor="ai-voice-rate" className="w-full flex justify-between text-sm font-semibold">
                                                <span>Tốc độ</span>
                                                <span>({localVoiceRate.toFixed(2)})</span>
                                            </label>
                                            <input
                                                id="ai-voice-rate"
                                                type="range"
                                                min="0.5"
                                                max="1.5"
                                                step="0.05"
                                                value={localVoiceRate}
                                                onChange={(e) => setLocalVoiceRate(parseFloat(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {settingsTab === 'data' && (
                        <div className="settings-tab-content-grid max-w-xl mx-auto flex flex-col gap-6">
                            <div className="settings-card flex flex-col gap-6">
                                <h4 className="settings-card-title text-lg font-bold border-b border-white/5 pb-2 mb-4">
                                    {language === 'vi' ? 'Quản lý Dữ liệu & Lưu trữ' : 'Data Management & Sync'}
                                </h4>
                                
                                <div className="setting-item flex flex-col gap-3">
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        {language === 'vi' 
                                            ? 'Tải xuống toàn bộ thông tin cá nhân, hành trình sự nghiệp, học văn, lĩnh vực chuyên môn và các dự án tiêu biểu dưới định dạng tệp văn bản (.txt) chất lượng cao.'
                                            : 'Download all personal info, career journey, education, services, and key projects as a high-quality plain text file (.txt).'}
                                    </p>
                                    <button 
                                        onClick={exportToTxt}
                                        className="btn btn-primary w-full flex items-center justify-center gap-2 py-2.5 transition-all duration-300 hover:shadow-md"
                                        style={{ borderRadius: '8px' }}
                                    >
                                        <Icons.DownloadIcon size={18} />
                                        <span>{settingsText.exportAsTXT || 'Xuất dạng TXT'}</span>
                                    </button>
                                </div>

                                <div className="setting-item border-t border-white/5 pt-4 mt-2 flex flex-col gap-3">
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        {language === 'vi'
                                            ? 'Xóa tất cả các thay đổi tùy biến và phục hồi cài đặt hệ thống về trạng thái ban đầu của nhà phát triển.'
                                            : 'Clear all customized preferences and restore application configurations to the original defaults.'}
                                    </p>
                                    <button 
                                        onClick={() => {
                                            if (window.confirm(language === 'vi' ? 'Bạn có chắc chắn muốn xóa toàn bộ cài đặt tùy chọn và tải lại trang?' : 'Are you sure you want to clear all settings and reload?')) {
                                                localStorage.clear(); 
                                                window.location.reload();
                                            }
                                        }}
                                        className="btn btn-secondary w-full flex items-center justify-center gap-2 py-2.5 border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 transition-all text-red-400"
                                        style={{ borderRadius: '8px' }}
                                    >
                                        <Icons.TrashIcon size={18} />
                                        <span>{language === 'vi' ? 'Xóa toàn bộ Cache & Đặt lại' : 'Factory Reset & Clear Cache'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showSaveSuccess && createPortal(
                <div className="save-toast-notification">
                    <Icons.CheckIcon />
                    <span>Cài đặt đã được áp dụng cho toàn bộ website!</span>
                </div>,
                document.body
            )}
        </PageLayout>
    );
};

export default SettingsPage;
