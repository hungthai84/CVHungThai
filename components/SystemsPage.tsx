import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import CardTitle from './CardTitle';
import { useSpeechSynthesis } from './useSpeechSynthesis';

// --- Type definitions ---
interface System {
    key: string;
    nameVi: string;
    nameEn: string;
    descVi: string;
    descEn: string;
    link: string;
    icon: keyof typeof Icons;
    color: string;
}

// --- Systems Data ---
const systemsData: System[] = [
    {
        key: 'SDP',
        nameVi: 'Website dành cho phòng CSKH',
        nameEn: 'Service Delivery Platform',
        descVi: 'Trang làm việc chính của Phòng Chăm sóc Khách hàng, đóng vai trò là cổng truy cập tập trung (Portal) để nhân viên sử dụng toàn bộ các hệ thống nghiệp vụ.',
        descEn: 'The primary workspace of the Customer Service Department, serving as a centralized portal for employees to access all business operations systems.',
        link: 'https://www.sdpplatfrom.powerservice.one',
        icon: 'LayersIcon',
        color: '#3b82f6'
    },
    {
        key: 'ERP',
        nameVi: 'Tài chính kế toán',
        nameEn: 'Enterprise Resource Planning',
        descVi: 'Quản lý nguồn lực và hoạt động nội bộ của doanh nghiệp như tài chính, kế toán, mua hàng, kho, sản xuất, tài sản và các hoạt động vận hành.',
        descEn: 'Manages internal business resources and operations, including finance, accounting, purchasing, inventory, manufacturing, assets, and overall operations.',
        link: 'https://www.erpplatfrom.powerservice.one',
        icon: 'BriefcaseIcon',
        color: '#10b981'
    },
    {
        key: 'CRM',
        nameVi: 'Quản lý Quan hệ Khách hàng',
        nameEn: 'Customer Relationship Management',
        descVi: 'Quản lý khách hàng, bán hàng, marketing, chăm sóc khách hàng và toàn bộ hành trình trải nghiệm khách hàng.',
        descEn: 'Manages customers, sales, marketing, customer care, and the entire customer journey experience.',
        link: 'https://www.crmplatfrom.powerservice.one',
        icon: 'UsersIcon',
        color: '#f59e0b'
    },
    {
        key: 'HRM',
        nameVi: 'Quản lý Nguồn nhân lực',
        nameEn: 'Human Resource Management',
        descVi: 'Quản lý toàn bộ vòng đời nhân viên từ tuyển dụng, hồ sơ nhân sự, chấm công, tính lương, đào tạo, đánh giá năng lực đến phát triển nghề nghiệp.',
        descEn: 'Manages the complete employee lifecycle, including recruitment, personnel records, timekeeping, payroll, training, performance evaluation, and career development.',
        link: 'https://www.hrmplatfrom.powerservice.one',
        icon: 'UserIcon',
        color: '#8b5cf6'
    },
    {
        key: 'BPM',
        nameVi: 'Quản lý Quy trình Nghiệp vụ',
        nameEn: 'Business Process Management',
        descVi: 'Chuẩn hóa, số hóa và tự động hóa các quy trình nghiệp vụ nhằm nâng cao hiệu quả quản lý và vận hành doanh nghiệp.',
        descEn: 'Standardizes, digitizes, and automates business processes to improve organizational management and operational efficiency.',
        link: 'https://www.bmpplatform.powerservice.one',
        icon: 'ClipboardDocumentListIcon',
        color: '#ec4899'
    },
    {
        key: 'OKR',
        nameVi: 'Quản lý Mục tiêu',
        nameEn: 'Objectives and Key Results',
        descVi: 'Thiết lập mục tiêu chiến lược, theo dõi kết quả then chốt (Key Results), quản lý kế hoạch, dự án và đánh giá hiệu suất của cá nhân, phòng ban và doanh nghiệp.',
        descEn: 'Sets strategic objectives, tracks key results, manages plans and projects, and evaluates individual, departmental, and organizational performance.',
        link: 'https://www.okrplatfrom.powerservice.one',
        icon: 'TrophyIcon',
        color: '#f97316'
    },
    {
        key: 'CLP',
        nameVi: 'Khách hàng Thân thiết',
        nameEn: 'Customer Loyalty Platform',
        descVi: 'Quản lý chương trình thành viên, tích điểm, phân hạng khách hàng, ưu đãi, voucher, chiến dịch chăm sóc và gia tăng mức độ trung thành của khách hàng.',
        descEn: 'Manages membership programs, point accumulation, customer tiering, benefits, vouchers, and retention campaigns to increase loyalty.',
        link: 'https://www.clpplatform.powerservice.one',
        icon: 'HeartIcon',
        color: '#ef4444'
    },
    {
        key: 'LMS',
        nameVi: 'Quản lý Đào tạo',
        nameEn: 'Learning Management System',
        descVi: 'Xây dựng và quản lý khóa học trực tuyến, kiểm tra, đánh giá năng lực, cấp chứng chỉ và phát triển nguồn nhân lực.',
        descEn: 'Creates and manages online training courses, assessments, performance evaluations, certifications, and human resource development.',
        link: 'https://www.lmsplatfrom.powerservice.one',
        icon: 'BookOpenIcon',
        color: '#14b8a6'
    },
    {
        key: 'CSC',
        nameVi: 'Trung tâm Chăm sóc Khách hàng',
        nameEn: 'Customer Service Center',
        descVi: 'Quản lý tương tác đa kênh (Omnichannel), tiếp nhận và xử lý yêu cầu hỗ trợ, quản lý Ticket, SLA, lịch sử liên hệ và Helpdesk.',
        descEn: 'Manages omnichannel interactions, receives and resolves support requests, and manages tickets, SLAs, contact history, and helpdesks.',
        link: 'https://www.cscplatform.powerservice.one',
        icon: 'PhoneIcon',
        color: '#06b6d4'
    },
    {
        key: 'BI Dashboard',
        nameVi: 'Báo cáo và Phân tích',
        nameEn: 'Business Intelligence Dashboard',
        descVi: 'Thu thập, tổng hợp, phân tích và trực quan hóa dữ liệu theo thời gian thực, hỗ trợ lãnh đạo đưa ra quyết định dựa trên dữ liệu.',
        descEn: 'Collects, aggregates, analyzes, and visualizes real-time data to assist leadership in making data-driven decisions.',
        link: '(Đang triển khai)',
        icon: 'ChartBarIcon',
        color: '#0284c7'
    },
    {
        key: 'AI Assistant',
        nameVi: 'Trợ lý Trí tuệ Nhân tạo',
        nameEn: 'Artificial Intelligence Assistant',
        descVi: 'Hỗ trợ người dùng bằng AI trong việc tìm kiếm tri thức, phân tích dữ liệu, tạo nội dung, tự động hóa quy trình, hỗ trợ ra quyết định và nâng cao năng suất làm việc.',
        descEn: 'Empowers users with AI-driven knowledge search, data analysis, content generation, process automation, decision support, and productivity enhancement.',
        link: 'https://www.aiplatfrom.powerservice.one',
        icon: 'BotIcon',
        color: '#d946ef'
    },
    {
        key: 'POS',
        nameVi: 'Quản lý bán hàng',
        nameEn: 'Point of Sale',
        descVi: 'Quản lý bán hàng tại quầy, đơn hàng, thanh toán, hóa đơn, tồn kho và đồng bộ dữ liệu với CRM, ERP và các hệ thống quản trị khác.',
        descEn: 'Manages counter sales, orders, payments, invoicing, and inventory, with real-time data synchronization with CRM, ERP, and other management systems.',
        link: 'https://www.posplatform.powerservice.one',
        icon: 'CubeIcon',
        color: '#84cc16'
    }
];

// --- Sub-component: SystemCard ---
const SystemCard: React.FC<{ system: System, index: number }> = ({ system, index }) => {
    const { language } = useI18n();
    const isVi = language === 'vi';
    const Icon = Icons[system.icon] || Icons.FolderIcon;
    const cardRef = useRef<HTMLDivElement>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    
    useEffect(() => {
        const element = cardRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    element.classList.add('is-visible');
                    observer.unobserve(element);
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(element);
        return () => {
            if (element) {
                observer.disconnect();
            }
        };
    }, []);

    const handleClick = () => {
        if (system.link && system.link !== '(Đang triển khai)') {
            let url = system.link;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            window.open(url, '_blank');
        }
    };

    return (
        <div 
            id={`system-card-${system.key}`}
            ref={cardRef} 
            className={`system-card-container fade-in-up-on-scroll ${isFlipped ? 'is-flipped' : ''}`}
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
            onClick={handleClick}
            style={{ 
                '--item-color': system.color, 
                transitionDelay: `${index * 50}ms`
            } as React.CSSProperties}
        >
            <div className="system-card-inner">
                {/* Mặt trước */}
                <div className="system-card-front">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', width: '100%' }}>
                        <Icon size={38} style={{ color: system.color, flexShrink: 0 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left', minWidth: 0, flex: 1 }}>
                            {/* Dòng 1: SDP (Service Delivery Platform) */}
                            <div 
                                style={{ 
                                    color: system.color, 
                                    fontWeight: 700, 
                                    fontSize: '0.85rem', 
                                    lineHeight: '1.2', 
                                    whiteSpace: 'nowrap', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis' 
                                }}
                            >
                                {system.key} <span style={{ opacity: 0.85, fontSize: '0.75rem', fontWeight: 500 }}>({isVi ? system.nameEn : system.nameVi})</span>
                            </div>
                            {/* Dòng 2: Nền tảng điều hành dịch vụ */}
                            <div 
                                style={{ 
                                    color: 'var(--color-brand-text-primary)',
                                    fontWeight: 800, 
                                    fontSize: '0.95rem', 
                                    lineHeight: '1.3',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {isVi ? system.nameVi : system.nameEn}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mặt sau */}
                <div className="system-card-back" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0.85rem' }}>
                    <p className="description text-justify" style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.4, color: 'var(--color-brand-text-secondary)' }}>
                        {isVi ? system.descVi : system.descEn}
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const SystemsPage: React.FC<{ id?: string }> = ({ id }) => {
    const { language } = useI18n();
    const isVi = language === 'vi';
    const { isSpeaking, cancel } = useSpeechSynthesis();
    
    // Video player state
    const infoCardRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isTogglingPlay, setIsTogglingPlay] = useState(false);
    const [showVideoTooltip, setShowVideoTooltip] = useState(true);

    const [playerStyle, setPlayerStyle] = useState<React.CSSProperties>({
        position: 'absolute',
        top: '1.5rem',
        right: '1.5rem',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        zIndex: 50,
        overflow: 'visible',
        boxShadow: 'none',
        border: 'none',
        backgroundColor: 'transparent',
    });

    const [buttonStyle, setButtonStyle] = useState<React.CSSProperties>({
        position: 'absolute',
        bottom: '-15px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: '#ED1B2F',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 51,
        boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
    });

    const updatePlayerStyle = useCallback(() => {
        const container = infoCardRef.current;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();

        if (isPlaying) {
            // Expanded State
            const okrCard = document.getElementById('system-card-OKR');
            const posCard = document.getElementById('system-card-POS');
            const cscCard = document.getElementById('system-card-CSC');

            let targetTop = 150;
            let targetLeft = containerRect.width - 324;
            let targetWidth = 300;
            let targetHeight = containerRect.height - 180;

            // Desktop (3 columns)
            if (window.innerWidth > 1024 && okrCard && posCard) {
                const okrRect = okrCard.getBoundingClientRect();
                const posRect = posCard.getBoundingClientRect();
                
                targetTop = okrRect.top - containerRect.top;
                targetLeft = okrRect.left - containerRect.left;
                targetWidth = okrRect.width;
                targetHeight = posRect.bottom - okrRect.top;
            } 
            // Tablet (2 columns)
            else if (window.innerWidth > 640 && window.innerWidth <= 1024 && cscCard && posCard) {
                const cscRect = cscCard.getBoundingClientRect();
                const posRect = posCard.getBoundingClientRect();
                
                targetTop = cscRect.top - containerRect.top;
                targetLeft = cscRect.left - containerRect.left;
                targetWidth = posRect.right - cscRect.left;
                targetHeight = posRect.bottom - cscRect.top;
            } 
            // Mobile (1 column)
            else if (cscCard && posCard) {
                const cscRect = cscCard.getBoundingClientRect();
                const posRect = posCard.getBoundingClientRect();
                
                targetTop = cscRect.top - containerRect.top;
                targetLeft = 16; // 1rem padding
                targetWidth = containerRect.width - 32;
                targetHeight = posRect.bottom - cscRect.top;
            }

            setPlayerStyle({
                position: 'absolute',
                top: `${targetTop}px`,
                left: `${targetLeft}px`,
                width: `${targetWidth}px`,
                height: `${targetHeight}px`,
                borderRadius: '12px',
                zIndex: 50,
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
                border: '2px solid var(--card-border)',
                backgroundColor: '#000',
            });

            setButtonStyle({
                position: 'absolute',
                bottom: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'rgba(237, 27, 47, 0.95)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 51,
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            });
        } else {
            // Paused/Circle State
            const rightOffset = 24; // 1.5rem
            const circleSize = 100;
            const targetLeft = containerRect.width - circleSize - rightOffset;

            setPlayerStyle({
                position: 'absolute',
                top: '1.5rem',
                left: `${targetLeft}px`,
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                borderRadius: '50%',
                zIndex: 50,
                overflow: 'visible',
                boxShadow: 'none',
                border: 'none',
                backgroundColor: 'transparent',
            });

            setButtonStyle({
                position: 'absolute',
                bottom: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#ED1B2F',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 51,
                boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
            });
        }
    }, [isPlaying]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowVideoTooltip(false);
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        updatePlayerStyle();
        
        window.addEventListener('resize', updatePlayerStyle);
        const timer = setTimeout(updatePlayerStyle, 100);

        return () => {
            window.removeEventListener('resize', updatePlayerStyle);
            clearTimeout(timer);
        };
    }, [isPlaying, updatePlayerStyle]);

    // Handle video load and play dynamically based on isPlaying state
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.src = " https://cdn.scena.ai/project/8606/ac120a105730c378447fd67f5e8b6aeb9557b5e4e8854ac2e21148d5316f780b.mp4";
            video.muted = false;
            video.loop = true;
            video.play().catch(err => {
                if (err.name !== 'AbortError') {
                    console.error("Failed to play full video:", err);
                }
            });
        } else {
            video.src = "https://cdn.scena.ai/project/8606/581097478f9de72616d982e302e1c8d0aab6d66cbee040430c610424c0c72a44.mp4";
            video.muted = true;
            video.loop = true;
            video.play().catch(err => {
                if (err.name !== 'AbortError') {
                    console.error("Failed to play preview video:", err);
                }
            });
        }
    }, [isPlaying]);

    const handlePlayPauseVideo = useCallback(() => {
        if (isTogglingPlay) return;
        setIsTogglingPlay(true);
        if (isSpeaking) {
            cancel();
        }
        setIsPlaying(prev => !prev);
        setIsTogglingPlay(false);
    }, [isTogglingPlay, isSpeaking, cancel]);

    const textToSpeak = isVi 
        ? "Bấm vào để xem video giới thiệu của anh!"
        : "Click to watch my introduction video!";



    return (
        <PageLayout id={id}>
            <style>{`
                .custom-video-player-wrapper {
                    position: absolute;
                    z-index: 50;
                    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .custom-video-player-wrapper .cover-letter-video-container {
                    width: 100%;
                    height: 100%;
                    border-radius: inherit;
                    overflow: hidden;
                    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .custom-video-player-wrapper .custom-play-button {
                    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .custom-video-player-wrapper .custom-play-button svg {
                    width: 14px;
                    height: 14px;
                }

                .system-hint-bubble {
                    position: absolute;
                    right: calc(100% + 15px);
                    top: 50%;
                    transform: translateY(-50%);
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    padding: 10px 16px;
                    border-radius: 18px 18px 4px 18px;
                    font-size: 13.5px;
                    font-weight: 500;
                    line-height: 1.4;
                    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
                    z-index: 60;
                    pointer-events: auto;
                    animation: system-hint-bounce-x 1.5s infinite ease-in-out;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                    width: max-content;
                    max-width: 200px;
                    text-align: left;
                }
                @media (min-width: 640px) {
                    .system-hint-bubble {
                        right: calc(100% + 20px);
                    }
                }
                .system-hint-bubble::after {
                    content: '';
                    position: absolute;
                    bottom: 6px;
                    right: -6px;
                    transform: none;
                    border-width: 6px 0 6px 6px;
                    border-style: solid;
                    border-color: transparent transparent transparent #2563eb;
                    display: block;
                    width: 0;
                }
                @keyframes system-hint-bounce-x {
                    0%, 100% { transform: translate(0, -50%); }
                    50% { transform: translate(-6px, -50%); }
                }

                .system-card-container {
                    perspective: 1000px;
                    cursor: pointer;
                    height: 120px;
                    background-color: transparent;
                    border: none;
                    box-shadow: none;
                    transition: transform 0.3s ease;
                    border-radius: 10px;
                }
                .system-card-container:hover {
                    transform: translateY(-4px);
                }
                .system-card-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transition: transform 0.6s;
                    transform-style: preserve-3d;
                    border-radius: 10px;
                }
                .system-card-container.is-flipped .system-card-inner {
                    transform: rotateY(180deg);
                }
                .system-card-front, .system-card-back {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                    border-radius: 10px;
                    padding: 0.65rem 0.85rem;
                    box-sizing: border-box;
                    background-color: transparent;
                    backdrop-filter: var(--glass-blur);
                    -webkit-backdrop-filter: var(--glass-blur-webkit);
                    border: 1px solid var(--card-border);
                    box-shadow: var(--card-box-shadow);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .system-card-back {
                    transform: rotateY(180deg);
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    background-color: transparent;
                }
            `}</style>
            <div ref={infoCardRef} className="info-card is-services flex flex-col h-full relative">
                <div className="flex items-start justify-between pr-4">
                    <CardTitle
                        icon={<Icons.ServerIcon />}
                        text={isVi ? 'Hệ thống' : 'Systems'}
                        tooltipTitle={isVi ? 'Hệ sinh thái Hệ thống' : 'Systems Ecosystem'}
                        tooltipText={isVi 
                            ? 'Danh mục các hệ thống nghiệp vụ, hoạch định và điều hành tôi từng xây dựng, vận hành và quản lý.' 
                            : 'A catalog of business, planning, and management systems that I have built, operated, and managed.'
                        }
                        style={{ marginBottom: '1.5rem', flexShrink: 0, marginLeft: '0px' }}
                    />
                </div>

                <div className="custom-video-player-wrapper" style={playerStyle}>
                    {showVideoTooltip && !isPlaying && (
                        <div 
                            className="system-hint-bubble"
                            onClick={() => {
                                setShowVideoTooltip(false);
                                handlePlayPauseVideo();
                            }}
                            title={isVi ? 'Bấm vào để xem video' : 'Click to play video'}
                        >
                            <span>{textToSpeak}</span>
                        </div>
                    )}
                    <div 
                        className="cover-letter-video-container" 
                        title={isPlaying ? "Tạm dừng video" : "Xem video giới thiệu"}
                        onClick={handlePlayPauseVideo}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlayPauseVideo(); }}
                        role="button"
                        tabIndex={0}
                        aria-label="Play or pause the introduction video"
                    >
                        <video
                            ref={videoRef}
                            playsInline
                            className="cover-letter-video-element h-full w-full object-cover"
                        >
                            Trình duyệt của bạn không hỗ trợ thẻ video.
                        </video>
                    </div>
                    <button 
                        className="custom-play-button" 
                        onClick={handlePlayPauseVideo} 
                        style={buttonStyle}
                        aria-label={isPlaying ? "Tạm dừng video" : "Phát video"}
                    >
                        {isPlaying ? <Icons.PauseIcon /> : <Icons.PlayIcon style={{ marginLeft: '2px' }}/>}
                    </button>
                </div>

                <div className="services-grid no-scrollbar overflow-y-auto pr-1 flex-1" style={{ flex: 1 }}>
                    {systemsData.map((system, index) => (
                        <SystemCard key={system.key} system={system} index={index} />
                    ))}
                </div>
            </div>
        </PageLayout>
    );
};

export default SystemsPage;
