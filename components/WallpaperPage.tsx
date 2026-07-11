import React, { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import CardTitle from './CardTitle';
import * as Icons from './Icons';

interface WallpaperPageProps {
    id?: string;
}

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
        id: 'https://cdn.dribbble.com/userupload/2260659/file/original-d87cd04052ec01ce9052d9a647dc5137.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/13498087/file/original-b120f6a1a15d71e493f8d4b2d13b0296.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/8636402/file/original-3e3e07db8a0028a6f3b49cb2e0ce6779.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/users/892233/screenshots/11516001/media/d48ed38ed61a357738f6dff4e20967fc.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/users/1201594/screenshots/18063124/media/f4d998be7d7cdeca97800c4f8edc5234.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/users/3593/screenshots/2483864/media/53412df71dc225c57bbaef574514be3f.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/17150796/file/original-132c32cf981f456c6411519d1edb6118.mp4',
        type: 'video' as const,
        thumbnail: '',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/14717148/file/original-53f7c4692750e3bb44426eb8b1e4a13f.mp4',
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
        thumbnail: 'https://i.ibb.co/68032T1/dotted.png',
    },
    {
        id: 'dark-dotted-pattern',
        type: 'custom' as const,
        thumbnail: 'https://i.ibb.co/VvzKCQm/dark-dotted.png',
    },
    {
        id: 'gemini-ai',
        type: 'custom' as const,
        thumbnail: 'https://i.ibb.co/Xz9w32b/gemini-bg.png',
    }
];

const videoWallpapers = specialAndVideoWallpapers.filter(w => w.type === 'video');

const imageWallpapers = [
    { id: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2670&auto=format&fit=crop', type: 'image' as const, thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop' },
    { id: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2629&auto=format&fit=crop', type: 'image' as const, thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600&auto=format&fit=crop' },
    { id: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', type: 'image' as const, thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' },
    { id: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?q=80&w=2670&auto=format&fit=crop', type: 'image' as const, thumbnail: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?q=80&w=600&auto=format&fit=crop' },
    { id: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2758&auto=format&fit=crop', type: 'image' as const, thumbnail: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=600&auto=format&fit=crop' },
    { id: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop', type: 'image' as const, thumbnail: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600&auto=format&fit=crop' },
    { id: 'https://i.ibb.co/G47jTb1g/minimalist-white-background-3840x2160-bright-space-clean-aesthetic-27644.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/G47jTb1g/minimalist-white-background-3840x2160-bright-space-clean-aesthetic-27644.jpg' },
    { id: 'https://i.ibb.co/q2X19rq/geometric-mountain-wallpaper-3840x2160-calming-visuals-simple-patterns-26760.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/q2X19rq/geometric-mountain-wallpaper-3840x2160-calming-visuals-simple-patterns-26760.jpg' },
    { id: 'https://i.ibb.co/R4P1zff0/ta-i-xu-ng-15.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/R4P1zff0/ta-i-xu-ng-15.jpg' },
    { id: 'https://i.ibb.co/TDnD5NB1/ta-i-xu-ng-14.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/TDnD5NB1/ta-i-xu-ng-14.jpg' },
    { id: 'https://i.ibb.co/S49fBKcv/ta-i-xu-ng-13.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/S49fBKcv/ta-i-xu-ng-13.jpg' },
    { id: 'https://i.ibb.co/04qypw8/ta-i-xu-ng-12.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/04qypw8/ta-i-xu-ng-12.jpg' },
    { id: 'https://i.ibb.co/zH87nQv8/ta-i-xu-ng-11.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/zH87nQv8/ta-i-xu-ng-11.jpg' },
    { id: 'https://i.ibb.co/XrbJ5b9Z/ta-i-xu-ng-10.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/XrbJ5b9Z/ta-i-xu-ng-10.jpg' },
    { id: 'https://i.ibb.co/tTp8bC3Z/ta-i-xu-ng-9.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/tTp8bC3Z/ta-i-xu-ng-9.jpg' },
    { id: 'https://i.ibb.co/YFmshsMg/ta-i-xu-ng-8.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/YFmshsMg/ta-i-xu-ng-8.jpg' },
    { id: 'https://i.ibb.co/hRY34kM7/ta-i-xu-ng-7.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/hRY34kM7/ta-i-xu-ng-7.jpg' },
    { id: 'https://i.ibb.co/xS2kK1hZ/ta-i-xu-ng-6.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/xS2kK1hZ/ta-i-xu-ng-6.jpg' },
    { id: 'https://i.ibb.co/N21P57qP/ta-i-xu-ng-5.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/N21P57qP/ta-i-xu-ng-5.jpg' },
    { id: 'https://i.ibb.co/cK59QfB8/ta-i-xu-ng-4.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/cK59QfB8/ta-i-xu-ng-4.jpg' },
    { id: 'https://i.ibb.co/3mbQ7613/ta-i-xu-ng-3.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/3mbQ7613/ta-i-xu-ng-3.jpg' },
    { id: 'https://i.ibb.co/v4x4Z9XJ/ta-i-xu-ng-2.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/v4x4Z9XJ/ta-i-xu-ng-2.jpg' },
    { id: 'https://i.ibb.co/tMDxT5qS/ta-i-xu-ng-1.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/tMDxT5qS/ta-i-xu-ng-1.jpg' },
    { id: 'https://i.ibb.co/MkrM74Jp/ta-i-xu-ng.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/MkrM74Jp/ta-i-xu-ng.jpg' },
    { id: 'https://i.ibb.co/Fc1dczn/Wallpaper.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/Fc1dczn/Wallpaper.jpg' },
    { id: 'https://i.ibb.co/XxF7158/Ta-i-xu-ng.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/XxF7158/Ta-i-xu-ng.jpg' },
    { id: 'https://i.ibb.co/jPN1bS9c/Pastel-Minimal-Wallpaper-Clean-Aesthetic-for-Mac-Book.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/jPN1bS9c/Pastel-Minimal-Wallpaper-Clean-Aesthetic-for-Mac-Book.jpg' },
    { id: 'https://i.ibb.co/G4tGQZbB/ta-i-xu-ng-16.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/G4tGQZbB/ta-i-xu-ng-16.jpg' },
    { id: 'https://i.ibb.co/r2w5qZCT/Download-Abstract-Gradient-Circle-Background-for-free.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/r2w5qZCT/Download-Abstract-Gradient-Circle-Background-for-free.jpg' },
    { id: 'https://i.ibb.co/zhc5bK7G/Ton-mental-a-aussi-besoin-de-repos.jpg', type: 'image' as const, thumbnail: 'https://i.ibb.co/zhc5bK7G/Ton-mental-a-aussi-besoin-de-repos.jpg' },
];

const WallpaperPage: React.FC<WallpaperPageProps> = ({ id }) => {
    const { t, language } = useI18n();
    const settingsText = t.settings;
    
    const {
        themeMode,
        wallpaper, setWallpaper,
    } = useTheme();

    const resolvedMode = themeMode === 'system'
        ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : themeMode;

    const [localWallpaper, setLocalWallpaper] = React.useState(wallpaper);

    const [activeTab, setActiveTab] = React.useState<'gradient' | 'video' | 'image'>(() => {
        if (videoWallpapers.some(w => w.id === wallpaper)) return 'video';
        if (imageWallpapers.some(w => w.id === wallpaper)) return 'image';
        return 'gradient';
    });

    React.useEffect(() => {
        setWallpaper(localWallpaper);
    }, [localWallpaper, setWallpaper]);

    const gradientWallpapers = useMemo(() => {
        const themeGradients = resolvedMode === 'light' ? lightGradientWallpapers : darkGradientWallpapers;
        const animatedGradient = specialAndVideoWallpapers.find(w => w.id === 'gradient');
        const customWallpapers = specialAndVideoWallpapers.filter(w => w.type === 'custom');
        return [animatedGradient, ...themeGradients, ...customWallpapers].filter(Boolean);
    }, [resolvedMode]);

    return (
        <PageLayout id={id}>
            <div className="info-card">
                 <div className="settings-header flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
                    <CardTitle
                        icon={<Icons.SparklesIcon />}
                        text={language === 'vi' ? 'Hình nền' : 'Wallpaper'}
                        tooltipTitle={language === 'vi' ? 'Cài đặt Hình nền' : 'Wallpaper Settings'}
                        tooltipText={language === 'vi' ? 'Tùy chỉnh giao diện không gian làm việc của bạn' : 'Customize the appearance of your workspace'}
                    />
                </div>

                <div className="settings-tab-content-grid w-full flex flex-col gap-6">
                    <div className="settings-card flex flex-col gap-6">
                        <h4 className="settings-card-title text-lg font-bold border-b border-white/5 pb-2 mb-4">
                            {language === 'vi' ? 'Thư viện hình nền' : 'Wallpaper Gallery'}
                        </h4>

                    <div className="wallpaper-tabs flex justify-center gap-2 mb-4 bg-black/10 p-1.5 rounded-full mx-auto backdrop-blur-md">
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
                            <div className="wallpaper-selector grid grid-cols-2 md:grid-cols-4 gap-4">
                                {gradientWallpapers.map((option, index) => (
                                    <button
                                        key={(option as any).id}
                                        className={`wallpaper-thumbnail aspect-[16/10] rounded-lg border-2 overflow-hidden transition-all relative ${(localWallpaper === (option as any).id) ? 'border-[var(--accent-color)] scale-95 shadow-md shadow-[var(--accent-color)]/25' : 'border-transparent hover:scale-102'}`}
                                        onClick={() => setLocalWallpaper((option as any).id)}
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
                            <div className="wallpaper-selector grid grid-cols-2 md:grid-cols-4 gap-4">
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
                            <div className="wallpaper-selector grid grid-cols-2 md:grid-cols-4 gap-4">
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
            </div>
        </PageLayout>
    );
};

export default WallpaperPage;
