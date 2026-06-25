import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/i18n';
import * as Icons from './Icons';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import PageLayout from './PageLayout';
import InfoBadge from './InfoBadge';

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
            const hasVoice = groupedVoices.vi.some(v => v.name === localVoiceName);
            if (!hasVoice) {
                const defaultVi = groupedVoices.vi.find(v => v.name.includes('gTTS')) || 
                                  groupedVoices.vi.find(v => v.name.includes('Google tiếng Việt') || v.lang.startsWith('vi')) || 
                                  groupedVoices.vi[0];
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
    
    const isDemoEnvironment = useMemo(() => {
        if (typeof window === 'undefined') return false;
        const hostname = window.location.hostname;
        return (
            hostname.includes('ais-dev') || 
            hostname.includes('ais-pre') || 
            hostname.includes('localhost') || 
            hostname.includes('127.0.0.1')
        );
    }, []);
    
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
                                        <div className="setting-item flex-col items-start">
                                            <label htmlFor="ai-voice-select" className="mb-2 w-full">{settingsText.aiVoiceSelect}</label>
                                            <div className="flex items-center gap-3 w-full">
                                                <div className="custom-select-wrapper flex-1">
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
                                            <div className="mt-4 flex justify-end w-full">
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
                                                                text = "안녕하세요, 테스트 목소리입니다.";
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
                                                        bg-primary text-primary-foreground
                                                        px-5 py-2.5 transition-all duration-300 
                                                        flex items-center justify-center gap-2 shadow-md hover:shadow-lg
                                                        focus:outline-none whitespace-nowrap text-sm font-medium
                                                        active:scale-95 w-full sm:w-auto
                                                        ${isSpeaking ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background' : ''}
                                                    `}
                                                    style={{ borderRadius: '100px', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'currentColor' }}
                                                    title={isSpeaking ? "Pause Preview" : "Play Preview"}
                                                >
                                                    <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></span>
                                                    {isSpeaking ? <Icons.PauseIcon size={18} className="animate-pulse" /> : <Icons.PlayIcon size={18} />}
                                                    <span className="relative z-10">{isSpeaking ? 'Đang nói...' : 'Nghe thử giọng nói'}</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="setting-item flex-col items-start gap-2">
                                            <label htmlFor="ai-voice-pitch" className="w-full flex justify-between">
                                                Cao độ ({localVoicePitch.toFixed(1)})
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
                                                Tốc độ ({localVoiceRate.toFixed(2)})
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
                            
                            {isDemoEnvironment && (
                                <div className="settings-card mt-6">
                                    <h4 className="settings-card-title">{settingsText.dataManagementTitle || 'Quản lý Dữ liệu'}</h4>
                                    <div className="setting-item flex-col items-start gap-3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem', width: '100%' }}>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2" style={{ textAlign: 'left', fontSize: '0.75rem', lineHeight: '1.4' }}>
                                            {language === 'vi' 
                                                ? 'Tải xuống toàn bộ thông tin cá nhân, hành trình sự nghiệp, học vấn, lĩnh vực chuyên môn và các dự án tiêu biểu dưới định dạng tệp văn bản (.txt) chất lượng cao.'
                                                : 'Download all personal info, career journey, education, services, and key projects as a high-quality plain text file (.txt).'}
                                        </p>
                                        <button 
                                            onClick={exportToTxt}
                                            className="btn btn-primary w-full flex items-center justify-center gap-2 py-2.5 transition-all duration-300 hover:shadow-md"
                                            style={{ backgroundColor: 'var(--accent-color)', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.625rem 1rem' }}
                                        >
                                            <Icons.DownloadIcon size={18} />
                                            <span>{settingsText.exportAsTXT || 'Xuất dạng TXT'}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
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
