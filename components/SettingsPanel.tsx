import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/i18n';
import * as Icons from './Icons';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import PageLayout from './PageLayout';
import InfoBadge from './InfoBadge';
import * as translations from '../translations';

interface SettingsPageProps {
    id?: string;
}

// --- Data Management Helper Functions ---

const flattenObject = (obj: any, path: string = ''): Record<string, string> => {
    let result: Record<string, string> = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newPath = path ? `${path}.${key}` : key;
            const value = obj[key];

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                result = { ...result, ...flattenObject(value, newPath) };
            } else if (Array.isArray(value)) {
                 if (value.every(item => typeof item === 'string')) {
                    result[newPath] = value.join('\n');
                } else {
                     value.forEach((item, index) => {
                        const arrayPath = `${newPath}.${index}`;
                        if (typeof item === 'object' && item !== null) {
                            result = { ...result, ...flattenObject(item, arrayPath) };
                        } else {
                            result[arrayPath] = String(item);
                        }
                    });
                }
            } else {
                result[newPath] = String(value);
            }
        }
    }
    return result;
};


const unflattenObject = (data: Record<string, string>) => {
    const result: any = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const keys = key.split('.');
            let current = result;
            while (keys.length > 1) {
                const part = keys.shift()!;
                const nextPartIsNumber = /^\d+$/.test(keys[0]);
                if (!current[part]) {
                    current[part] = nextPartIsNumber ? [] : {};
                }
                current = current[part];
            }
            const value = data[key];
            // This is a heuristic. If a field was flattened from a string array,
            // it will be a multi-line string. In this data structure, this is a safe assumption.
            if (typeof value === 'string' && value.includes('\n')) {
                current[keys[0]] = value.split('\n');
            } else {
                 current[keys[0]] = value;
            }
        }
    }
    return result;
};


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
        id: 'gradient',
        type: 'gradient' as const,
        thumbnail: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
    },
    {
        id: 'https://cdn.scena.ai/project/8606/95727de5df7ead1b58f6438ffcd683078804d9f125467ad97c7ae3c6a581512e.mp4',
        type: 'video' as const,
        thumbnail: 'https://i.postimg.cc/jS3rSGdF/videoframe-8901.png',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/18230475/file/original-d7ab36998c2277e97c1996d837a4673c.mp4',
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

const SettingsPage: React.FC<SettingsPageProps> = ({ id }) => {
    const { t, language } = useI18n();
    const pageData = t.settingsPage;
    const settingsText = t.settings;
    const {
        themeMode, setThemeMode,
        lightThemeColor, setLightThemeColor,
        darkThemeColor, setDarkThemeColor,
        // isCursorEffectOn, setCursorEffect,
        isSoundOn, setSoundOn,
        isAiVoiceOn, setAiVoiceOn,
        selectedAiVoiceName, setSelectedAiVoiceName,
        aiVoicePitch, setAiVoicePitch,
        aiVoiceRate, setAiVoiceRate,
        wallpaper, setWallpaper,
    } = useTheme();

    const { voices, speak, cancel, isSpeaking } = useSpeechSynthesis();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const clickSound = useRef(new Audio('https://rainbowit.net/themes/inbio/wp-content/themes/inbio/template-parts/audio/link-hover-and-click.wav'));


    // --- Local State for pending changes ---
    const [localThemeMode, setLocalThemeMode] = useState(themeMode);
    const [localLightThemeColor, setLocalLightThemeColor] = useState(lightThemeColor);
    const [localDarkThemeColor, setLocalDarkThemeColor] = useState(darkThemeColor);
    // const [localCursorEffect, setLocalCursorEffect] = useState(isCursorEffectOn);
    const [localSound, setLocalSound] = useState(isSoundOn);
    const [localAiVoice, setLocalAiVoice] = useState(isAiVoiceOn);
    const [localVoiceName, setLocalVoiceName] = useState(selectedAiVoiceName);
    const [localVoicePitch, setLocalVoicePitch] = useState(aiVoicePitch);
    const [localVoiceRate, setLocalVoiceRate] = useState(aiVoiceRate);
    const [localWallpaper, setLocalWallpaper] = useState(wallpaper);
    const [activeTab, setActiveTab] = useState<'gradient' | 'video'>('gradient');
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    // This is derived state for the UI to use for the color picker
    const localThemeColor = localThemeMode === 'light' ? localLightThemeColor : localDarkThemeColor;

    // This sets the color for the currently selected local mode
    const setLocalThemeColor = (color: string) => {
        if (localThemeMode === 'light') {
            setLocalLightThemeColor(color);
        } else {
            setLocalDarkThemeColor(color);
        }
    };

    useEffect(() => {
        clickSound.current.volume = 0.3;
    }, []);

    const playClickSound = useCallback(() => {
        if (isSoundOn) {
            clickSound.current.currentTime = 0;
            clickSound.current.play().catch(() => {});
        }
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }, [isSoundOn]);


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
    }, [themeMode, lightThemeColor, darkThemeColor, isSoundOn, isAiVoiceOn, selectedAiVoiceName, aiVoicePitch, aiVoiceRate, wallpaper]);

    const handleSaveChanges = () => {
        setThemeMode(localThemeMode);
        setLightThemeColor(localLightThemeColor);
        setDarkThemeColor(localDarkThemeColor);
        // setCursorEffect(localCursorEffect);
        setSoundOn(localSound);
        setAiVoiceOn(localAiVoice);
        setSelectedAiVoiceName(localVoiceName);
        setAiVoicePitch(localVoicePitch);
        setAiVoiceRate(localVoiceRate);
        setWallpaper(localWallpaper);
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
    };


    const availableVoices = useMemo(() => {
        return voices.filter(v => v.lang.toLowerCase().startsWith('vi') || v.name.includes('tiếng Việt'));
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
            const hasVoice = groupedVoices.vi.some(v => v.name === localVoiceName);
            if (!hasVoice) {
                const defaultVi = groupedVoices.vi.find(v => v.name.includes('Google tiếng Việt') || v.name.includes('gTTS') || v.lang.startsWith('vi')) || groupedVoices.vi[0];
                if (defaultVi) {
                    setLocalVoiceName(defaultVi.name);
                }
            }
        }
    }, [groupedVoices.vi, localVoiceName]);

    const accentColors = ['#101733', '#ED1B2F', '#AE2070', '#FF6525', '#FFB300', '#49C16C', '#0078D4', '#6C6CE5', '#FFFFFF'];
    
    const gradientWallpapers = useMemo(() => {
        const themeGradients = localThemeMode === 'light' ? lightGradientWallpapers : darkGradientWallpapers;
        const animatedGradient = specialAndVideoWallpapers.find(w => w.id === 'gradient');
        const customWallpapers = specialAndVideoWallpapers.filter(w => w.type === 'custom');
        return [animatedGradient, ...themeGradients, ...customWallpapers].filter(Boolean);
    }, [localThemeMode]);

    const videoWallpapers = useMemo(() => specialAndVideoWallpapers.filter(w => w.type === 'video'), []);
    
    const handleExportData = () => {
        const flattenedVi = flattenObject(translations.vi);
        const flattenedEn = flattenObject(translations.en);
        const allKeys = Array.from(new Set([...Object.keys(flattenedVi), ...Object.keys(flattenedEn)])).sort();

        const escapeCsvCell = (cellData: string) => {
            const str = String(cellData || '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const csvRows = [
            'key,vi,en', // Header
            ...allKeys.map(key => {
                const viValue = escapeCsvCell(flattenedVi[key]);
                const enValue = escapeCsvCell(flattenedEn[key]);
                return `${key},${viValue},${enValue}`;
            })
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        link.href = URL.createObjectURL(blob);
        link.download = 'portfolio_data.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                const lines = text.split(/\r?\n/);
                const header = lines[0].split(',');
                if (header[0] !== 'key' || header[1] !== 'vi' || header[2] !== 'en') {
                    throw new Error('Invalid CSV header');
                }
                
                const dataVi: Record<string, string> = {};
                const dataEn: Record<string, string> = {};

                for (let i = 1; i < lines.length; i++) {
                    if (!lines[i].trim()) continue;
                    const parts = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
                    const key = parts[0]?.trim();
                    let viValue = (parts[1] || '').trim();
                    let enValue = (parts[2] || '').trim();

                    // Unescape quotes
                    const unescape = (val: string) => {
                         if (val.startsWith('"') && val.endsWith('"')) {
                           return val.slice(1, -1).replace(/""/g, '"');
                        }
                        return val;
                    }
                    
                    if(key) {
                        dataVi[key] = unescape(viValue);
                        dataEn[key] = unescape(enValue);
                    }
                }

                const customTranslations = {
                    vi: unflattenObject(dataVi),
                    en: unflattenObject(dataEn),
                };
                
                localStorage.setItem('customTranslations', JSON.stringify(customTranslations));
                alert(settingsText.importSuccess);
                window.location.reload();
            } catch (error) {
                console.error('Error parsing CSV:', error);
                alert(settingsText.importError);
            }
        };
        reader.readAsText(file);
    };

    const generateTextContent = () => {
        let content = '';
    
        const addTitle = (title: string) => {
            content += `\n\n==============================\n`;
            content += `${title.toUpperCase()}\n`;
            content += `==============================\n\n`;
        };
    
        // Header
        content += `${t.sidebar.name}\n`;
        content += `${t.sidebar.jobTitle}\n`;
    
        // Cover Letter
        addTitle(t.coverLetterPage.badge);
        content += `${t.coverLetterPage.greeting}\n\n`;
        t.coverLetterPage.paragraphs.forEach(p => content += `${p}\n\n`);
        content += `${t.coverLetterPage.closing}\n`;
        content += `${t.coverLetterPage.signature}\n`;
        
        // About Me
        addTitle(t.aboutPage.badge);
        t.aboutPage.paragraphs.forEach(p => content += `${p.replace(/<strong>/g, '').replace(/<\/strong>/g, '')}\n\n`);
        content += `Giá trị cốt lõi: ${t.aboutPage.coreValues}\n\n`;
        content += `${t.aboutPage.concludingParagraph.replace(/<strong>/g, '').replace(/<\/strong>/g, '')}\n\n`;
        content += `${t.aboutPage.personalInfoTitle}:\n`;
        t.aboutPage.infoItems.forEach(item => {
            content += `- ${item.label}: ${item.value}\n`;
        });
    
        // Work Experience
        addTitle(t.workExperiencePage.title);
        t.workExperiencePage.jobs.forEach(job => {
            content += `\n---\n`;
            content += `Công ty: ${job.company} (${job.date})\n`;
            content += `Vị trí: ${job.title}\n`;
            content += `Quy mô nhóm: ${job.teamSize}\n`;
            content += `Trách nhiệm:\n`;
            job.responsibilities.forEach(r => content += `  - ${r}\n`);
            if (job.achievements.length > 0) {
                content += `Thành tựu chính:\n`;
                job.achievements.forEach(a => content += `  - ${a.label}: ${a.value}%\n`);
            }
        });
    
        // Skills
        addTitle(t.skillsPage.title);
        t.skillsPage.categories.forEach(category => {
            content += `\n${category.title}:\n`;
            category.skills.forEach(skill => {
                content += `- ${skill.name} (${skill.level}%)\n`;
            });
        });
    
        // Education
        addTitle(t.educationPage.title);
        t.educationPage.items.forEach(item => {
            content += `\n${item.year} - ${item.title}\n`;
            content += `${item.institution}\n`;
            content += `${item.description}\n`;
        });
        
        // Achievements
        addTitle(t.achievementsPage.badge);
        const achievementsByCategory: Record<string, any[]> = t.achievementsPage.achievements.reduce((acc, ach) => {
            if (!acc[ach.category]) {
                acc[ach.category] = [];
            }
            acc[ach.category].push(ach);
            return acc;
        }, {} as Record<string, any[]>);
    
        Object.entries(achievementsByCategory).forEach(([category, achievements]) => {
            content += `\n${category}:\n`;
            achievements.forEach(ach => {
                content += `- ${ach.title}: ${ach.rate}%\n`;
            });
        });
        
        // Services/Domains
        addTitle(t.servicesPage.badge);
        t.servicesPage.services.forEach(service => {
            content += `\n${service.title}:\n`;
            content += `${service.description}\n`;
        });
    
        // Projects
        addTitle(t.projectsPage.badge);
        t.projectsPage.projects.forEach(project => {
            content += `\n---\n`;
            content += `Dự án: ${project.title} (ID: ${project.id})\n`;
            content += `Mô tả: ${project.description}\n`;
            content += `Nhóm: ${project.group}, Giai đoạn: ${project.stage}\n`;
            content += `Thẻ: ${project.hashtags.join(', ')}\n`;
            
            const post = (t.projectPosts as any)[project.id];
            if (post && post.title !== "Thông tin dự án chưa được cập nhật") {
                content += `Chi tiết:\n`;
                post.content.paragraphs.forEach((p: string) => content += `  ${p}\n`);
            }
        });
    
        return content;
    };

    const handleExportApp = (format: 'html' | 'txt') => {
        playClickSound();
    
        if (format === 'html') {
            let htmlString = document.documentElement.outerHTML;
    
            // Replace the relative path of the main script with an absolute one
            const scriptRegex = /src="\/index.tsx"/g;
            const absoluteSrc = `src="${window.location.origin}/index.tsx"`;
            htmlString = htmlString.replace(scriptRegex, absoluteSrc);
    
            const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'index.html';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } else if (format === 'txt') {
            const textContent = generateTextContent();
            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'portfolio_summary.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }
    };


    return (
        <PageLayout id={id}>
            <div className="info-card">
                 <div className="settings-header">
                    <InfoBadge
                        icon={<Icons.SettingsIcon />}
                        text={pageData.badge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                    <div className="settings-actions">
                        <button className="btn btn-secondary" onClick={handleResetChanges}>
                            {settingsText.resetButton}
                        </button>
                        <button className="btn btn-primary" onClick={handleSaveChanges}>
                            {settingsText.saveButton}
                        </button>
                    </div>
                </div>
                <div className="settings-content-container no-scrollbar">
                    <div className="settings-grid">
                        <div className="settings-left-column">
                             <div className="settings-card">
                                <h4 className="settings-card-title">{settingsText.featuresTitle}</h4>


                                <div className="setting-item switch">
                                    <label>{settingsText.soundEffects}</label>
                                    <div
                                        role="switch"
                                        aria-checked={localSound}
                                        className={`toggle-switch ${localSound ? 'is-on' : ''}`}
                                        onClick={() => setLocalSound(!localSound)}
                                    >
                                        <div className="toggle-slider"></div>
                                    </div>
                                </div>
                                
                                <div className="setting-item switch">
                                    <label>{settingsText.aiVoice}</label>
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
                                    <>
                                        <div className="setting-item">
                                            <div className="flex items-center justify-between w-full">
                                                <label htmlFor="ai-voice-select">{settingsText.aiVoiceSelect}</label>
                                                <button
                                                    onClick={() => {
                                                        if (isSpeaking) {
                                                            cancel();
                                                        } else {
                                                            const selectedVoice = voices.find(v => v.name === localVoiceName);
                                                            const voiceLang = selectedVoice?.lang?.toLowerCase() || '';
                                                            const isVi = voiceLang.startsWith('vi') || localVoiceName.includes('tiếng Việt');
                                                            const isEn = voiceLang.startsWith('en');
                                                            let text = "Hello, this is a test voice.";
                                                            let targetLang = voiceLang;

                                                            if (isVi) {
                                                                text = "Xin chào, đây là giọng nói thử nghiệm.";
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
                                                                text = "안녕하세요, 테스트 목소리입니다.";
                                                            } else if (voiceLang.startsWith('de')) {
                                                                text = "Hallo, das ist eine Teststimme.";
                                                            } else if (voiceLang.startsWith('it')) {
                                                                text = "Ciao, questa è una voce di prova.";
                                                            }
                                                            speak(text, { voiceName: localVoiceName, lang: targetLang, pitch: localVoicePitch, rate: localVoiceRate });
                                                        }
                                                    }}
                                                    className="bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-primary p-1 rounded transition-colors text-xs flex items-center gap-1"
                                                >
                                                    {isSpeaking ? <Icons.PauseIcon size={14} /> : <Icons.PlayIcon size={14} />} Preview
                                                </button>
                                            </div>
                                            <div className="custom-select-wrapper">
                                                <select 
                                                    id="ai-voice-select"
                                                    value={localVoiceName}
                                                    onChange={(e) => setLocalVoiceName(e.target.value)}
                                                    className="custom-select"
                                                >
                                                    {groupedVoices.vi.length > 0 ? (
                                                        groupedVoices.vi.map(voice => (
                                                            <option key={`${voice.name}_${voice.lang}`} value={voice.name}>
                                                                {voice.name} ({voice.lang})
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option value="">Không tìm thấy giọng nói Tiếng Việt</option>
                                                    )}
                                                </select>
                                                <div className="select-arrow">
                                                    <Icons.ChevronDownIcon size={18} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="setting-item flex-col items-start gap-2">
                                            <label htmlFor="ai-voice-pitch" className="w-full flex justify-between">
                                                Pitch ({localVoicePitch.toFixed(1)})
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
                                        <div className="setting-item flex-col items-start gap-2">
                                            <label htmlFor="ai-voice-rate" className="w-full flex justify-between">
                                                Rate ({localVoiceRate.toFixed(2)})
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
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="settings-right-column">
                             <div className="settings-card">
                                <h4 className="settings-card-title">{settingsText.interfaceTitle}</h4>
                                <div className="setting-item">
                                    <label>{settingsText.mode}</label>
                                    <div className="mode-selector">
                                        <button className={`mode-button ${localThemeMode === 'light' ? 'active' : ''}`} onClick={() => setLocalThemeMode('light')}>
                                            <Icons.SunIcon /> {settingsText.light}
                                        </button>
                                        <button className={`mode-button ${localThemeMode === 'dark' ? 'active' : ''}`} onClick={() => setLocalThemeMode('dark')}>
                                            <Icons.MoonIcon /> {settingsText.dark}
                                        </button>
                                    </div>
                                </div>

                                <div className="setting-item">
                                    <label>{settingsText.accentColor}</label>
                                    <div className="color-pallet">
                                        {accentColors.map(color => (
                                            <button
                                                key={color}
                                                className={`color-dot ${localThemeColor.toLowerCase() === color.toLowerCase() ? 'active' : ''}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setLocalThemeColor(color)}
                                                aria-label={`Select color ${color}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <label>{settingsText.wallpaper}</label>
                                     <div className="wallpaper-tabs">
                                        <button 
                                            className={`wallpaper-tab-btn ${activeTab === 'gradient' ? 'active' : ''}`} 
                                            onClick={() => setActiveTab('gradient')}
                                        >
                                            {settingsText.gradient}
                                        </button>
                                        <button 
                                            className={`wallpaper-tab-btn ${activeTab === 'video' ? 'active' : ''}`} 
                                            onClick={() => setActiveTab('video')}
                                        >
                                            {settingsText.video}
                                        </button>
                                    </div>

                                    {activeTab === 'gradient' && (
                                        <div className="wallpaper-tab-content">
                                            <div className="wallpaper-selector">
                                                {gradientWallpapers.map((option, index) => (
                                                    <button
                                                        key={option.id}
                                                        className={`wallpaper-thumbnail ${localWallpaper === option.id ? 'active' : ''}`}
                                                        onClick={() => setLocalWallpaper(option.id)}
                                                        aria-label={`Wallpaper option ${index + 1}`}
                                                        title={`Wallpaper option ${index + 1}`}
                                                    >
                                                        {option.type === 'gradient' || option.type === 'custom' ? (
                                                            <div 
                                                                className="wallpaper-gradient-preview" 
                                                                style={{ 
                                                                    background: (option as any).thumbnail, 
                                                                    backgroundColor: (option as any).thumbnailBgColor,
                                                                    backgroundSize: (option as any).thumbnailBgSize || '200% 200%' 
                                                                }}>
                                                            </div>
                                                        ) : (<>
                                                            <video 
                                                              src={option.id} 
                                                              muted 
                                                              loop 
                                                              playsInline autoPlay 
                                                              preload="auto" 
                                                             poster={option.thumbnail || undefined}
                                                             className="wallpaper-video-preview-img" 
                                                             style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
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
                                                        </>)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'video' && (
                                        <div className="wallpaper-tab-content">
                                             <div className="wallpaper-selector">
                                                {videoWallpapers.map((option, index) => (
                                                    <button
                                                         key={option.id}
                                                         className={`wallpaper-thumbnail ${localWallpaper === option.id ? 'active' : ''}`}
                                                         onClick={() => setLocalWallpaper(option.id)}
                                                         aria-label={`Wallpaper option ${index + 1}`}
                                                         title={`Wallpaper option ${index + 1}`}
                                                         style={{ overflow: 'hidden', position: 'relative' }}
                                                     >
                                                         <>
                                                             <video 
                                                                  src={option.id} 
                                                                  muted 
                                                                  loop 
                                                                  playsInline autoPlay preload="auto" poster={option.thumbnail || undefined}
                                                                  className="wallpaper-video-preview-img" 
                                                                  style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
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
                                                         </>
                                                     </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showSaveSuccess && createPortal(
                <div className="save-toast-notification">
                    <Icons.CheckIcon />
                    <span>Cài đặt đã được lưu thành công!</span>
                </div>,
                document.body
            )}
        </PageLayout>
    );
};

export default SettingsPage;
