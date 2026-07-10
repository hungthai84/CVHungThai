import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import { motion } from "motion/react";
import { createPortal } from "react-dom";
import { useI18n } from "../contexts/i18n";
import * as Icons from "./Icons";
import PageLayout from "./PageLayout";
import CardTitle from "./CardTitle";
import Lightbox from "./Lightbox";
import OptimizedImage from "./OptimizedImage";

interface Achievement {
  label: string;
  value: number;
}

interface Job {
  id?: number;
  key: string;
  company: string;
  logoUrl: string;
  logos?: string[];
  date: string;
  period?: string;
  color: string;
  title: string;
  teamSize: string;
  responsibilities: string[];
  tasks?: string[];
  projects?: string[];
  achievements: Achievement[];
  images?: string[];
}

interface JobAchievementCardProps {
  achievement: Achievement;
  color: string;
  isForPrint?: boolean;
}

interface WorkExperiencePageProps {
  id?: string;
  onNavigate?: (key: string) => void;
  isForPrint?: boolean;
}

const JobAchievementCard: React.FC<JobAchievementCardProps> = ({
  achievement,
  color,
  isForPrint = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isForPrint) return; // Skip observer for print

    const element = cardRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("is-visible");
          observer.unobserve(element);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(element);
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [isForPrint]);

  return (
    <div
      ref={cardRef}
      className={`job-achievement-card fade-in-up-on-scroll ${isForPrint ? "is-visible" : ""}`}
      style={{ "--achievement-color": color } as React.CSSProperties}
    >
      <div
        className="job-achievement-card-header"
        style={{
          padding: "0 0.5rem",
          height: "18px",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <span
          className="job-achievement-card-label"
          style={{ fontSize: "13.8924px", lineHeight: "1" }}
        >
          {achievement.label}
        </span>
        <span
          className="job-achievement-card-value"
          style={{ fontSize: "13.8924px", lineHeight: "1" }}
        >
          {achievement.value}%
        </span>
      </div>
      <div
        className="progress-bar-container"
        style={{
          height: "12px",
          marginBottom: "0",
          padding: "0 0.5rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          className="progress-bar-bg"
          style={{ height: "3px", width: "100%" }}
        >
          <div
            className="progress-bar-fill"
            style={
              {
                "--level": `${achievement.value}%`,
                backgroundColor: color,
                height: "3px",
              } as React.CSSProperties
            }
          />
        </div>
      </div>
    </div>
  );
};
const WorkExperiencePage: React.FC<WorkExperiencePageProps> = ({
  id,
  onNavigate,
  isForPrint = false,
}) => {
  const { t, language } = useI18n();
  const pageData = t.workExperiencePage;
  const jobs: Job[] = useMemo(
    () => [...(pageData.jobs || [])],
    [pageData.jobs],
  );

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 767 : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Always start from 0 as requested, unless we have a referrer
  const [activeJobIndex, setActiveJobIndex] = useState(() => {
    const savedIndex = sessionStorage.getItem("referrer_job_index");
    if (savedIndex) {
      const parsed = parseInt(savedIndex, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < jobs.length) {
        return parsed;
      }
    }
    return 0;
  });
  const [showPrompt2026, setShowPrompt2026] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(() => {
    const savedIndex = sessionStorage.getItem("referrer_job_index");
    return savedIndex ? false : true;
  });

  useEffect(() => {
    if (jobs[activeJobIndex]?.key === "jobsearch") {
      setShowPrompt2026(true);
    } else {
      setShowPrompt2026(false);
    }
  }, [activeJobIndex, jobs]);

  const milestoneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [milestoneCenters, setMilestoneCenters] = useState<number[]>([]);

  // Function to play a gentle click sound
  const playClickSound = () => {
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        100,
        audioCtx.currentTime + 0.1,
      );

      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + 0.1,
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      // Silently fail if audio context is blocked
    }
  };

  // Auto-play interval logic
  useEffect(() => {
    if (!isAutoPlaying || isForPrint || jobs.length === 0 || isMobile) return;

    const interval = setInterval(() => {
      setActiveJobIndex((prev) => {
        const next = prev + 1;
        if (next >= jobs.length) {
          setIsAutoPlaying(false);
          return prev;
        }
        playClickSound(); // Play sound on auto-switch
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, jobs.length, isForPrint, isMobile]);

  // Reset when becoming visible (for mobile scroll-based navigation)
  useEffect(() => {
    if (isForPrint) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const isReferrer =
            sessionStorage.getItem("referrer_experience") === "true";
          if (isReferrer) {
            // Clear referrers so subsequent scrolls behave normally
            sessionStorage.removeItem("referrer_experience");
            sessionStorage.removeItem("referrer_job_index");
          } else {
            setActiveJobIndex(0);
            if (!isMobile) {
              setIsAutoPlaying(true);
            }
          }
        }
      },
      { threshold: 0.2 }, // Trigger when 20% of the section is visible
    );

    const currentRef = document.getElementById(id || "");
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => observer.disconnect();
  }, [id, isForPrint]);
  const timelineContainerRef = useRef<HTMLDivElement | null>(null);

  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const videoUrl =
    "https://cdn.scena.ai/project/9626/a5b5bdf1659991c0c74510ddfc59b9d27a3c7478f17c711b0fc39c5e51cf43d2.mp4";

  useEffect(() => {
    milestoneRefs.current = milestoneRefs.current.slice(0, jobs.length);
  }, [jobs]);

  const calculateLines = useCallback(() => {
    const container = timelineContainerRef.current;
    if (!container || milestoneRefs.current.length === 0 || isForPrint) return;

    requestAnimationFrame(() => {
      const milestones = milestoneRefs.current.filter(
        Boolean,
      ) as HTMLDivElement[];
      if (milestones.length === 0) return;

      const firstMilestone = milestones[0];
      const lastMilestone = milestones[milestones.length - 1];
      const activeMilestone = milestones[activeJobIndex] || firstMilestone;

      // Use offsetLeft/OffsetWidth for more reliable relative positioning
      const firstCenter =
        firstMilestone.offsetLeft + firstMilestone.offsetWidth / 2;
      const lastCenter =
        lastMilestone.offsetLeft + lastMilestone.offsetWidth / 2;
      const activeCenter =
        activeMilestone.offsetLeft + activeMilestone.offsetWidth / 2;

      const segmentsLeft = firstCenter;
      const segmentsWidth = lastCenter - firstCenter;

      const progressLeft = firstCenter;
      const progressWidth = activeCenter - firstCenter;

      const centers = milestones.map((m) => m.offsetLeft + m.offsetWidth / 2);
      setMilestoneCenters(centers);

      container.style.setProperty("--segments-left", `${segmentsLeft}px`);
      container.style.setProperty("--segments-width", `${segmentsWidth}px`);
      container.style.setProperty("--progress-left", `${progressLeft}px`);
      container.style.setProperty("--progress-width", `${progressWidth}px`);
      container.style.setProperty(
        "--progress-bg-color",
        jobs[activeJobIndex]?.color || "var(--accent-color)",
      );
      container.style.setProperty("--timeline-opacity", "1");
    });
  }, [activeJobIndex, isForPrint, jobs]);

  useLayoutEffect(() => {
    if (isForPrint) return;

    const container = timelineContainerRef.current;
    if (!container) return;

    // Use ResizeObserver for more robust tracking of layout changes
    const observer = new ResizeObserver(() => {
      calculateLines();
    });

    observer.observe(container);
    milestoneRefs.current.forEach((m) => {
      if (m) observer.observe(m);
    });

    // Initial calculation
    calculateLines();

    return () => {
      observer.disconnect();
    };
  }, [isForPrint, calculateLines]);

  const formatJobDate = (dateString: string) => {
    if (language === "vi") {
      return dateString.replace(
        /(\d{4})\s*-\s*(\d{4})/,
        "Từ năm $1 đến Năm $2",
      );
    }
    return dateString;
  };

  if (isForPrint) {
    return (
      <div className="print-page">
        <div className="info-card is-for-print">
          <CardTitle
            icon={<Icons.BriefcaseIcon />}
            text={pageData.title}
            tooltipTitle={pageData.tooltipTitle}
            tooltipText={pageData.tooltipText}
            style={{ marginBottom: "1.5rem" }}
          />
          <div className="experience-layout no-scrollbar">
            {jobs.map((job) => (
              <div key={job.key} className="print-job-item">
                <div className="job-header">
                  <div className="job-header-info">
                    <span className="job-date">{formatJobDate(job.date)}</span>
                    <h3>{job.title}</h3>
                    <h4>{job.company}</h4>
                  </div>
                </div>
                <h5>{pageData.descriptionTitle}</h5>
                <ul>
                  {job.responsibilities.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Icons.CheckIcon
                        size={16}
                        className="text-blue-500 mt-1 shrink-0"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {item}
                      </span>
                    </div>
                  ))}
                </ul>
                {job.achievements.length > 0 && (
                  <>
                    <h5>{pageData.achievementsTitle}</h5>
                    <div className="job-achievements-grid">
                      {job.achievements.map((ach, index) => (
                        <JobAchievementCard
                          key={index}
                          achievement={ach}
                          color={job.color}
                          isForPrint={true}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getAchievementIcon = (label: string) => {
    const l = label.toLowerCase();

    // Process/Standardization -> ClipboardDocumentListIcon
    if (
      l.includes("chuẩn hóa") ||
      l.includes("process") ||
      l.includes("standard")
    ) {
      return <Icons.ClipboardDocumentListIcon size={12} />;
    }
    // Task/Completion -> CheckIcon
    if (
      l.includes("nhiệm vụ") ||
      l.includes("task") ||
      l.includes("hoàn thành")
    ) {
      return <Icons.CheckIcon size={12} />;
    }
    // Guidance/New employees -> UsersIcon
    if (
      l.includes("nhân viên mới") ||
      l.includes("employee guidance") ||
      l.includes("hướng dẫn")
    ) {
      return <Icons.UsersIcon size={12} />;
    }
    // Document Compilation/Biên soạn tài liệu -> DocumentTextIcon
    if (
      l.includes("tài liệu") ||
      l.includes("document") ||
      l.includes("biên soạn")
    ) {
      return <Icons.DocumentTextIcon size={12} />;
    }
    // Events -> SparklesIcon
    if (l.includes("sự kiện") || l.includes("event")) {
      return <Icons.SparklesIcon size={12} />;
    }
    // Community -> UsersIcon
    if (l.includes("cộng đồng") || l.includes("community")) {
      return <Icons.UsersIcon size={12} />;
    }
    // Response/Support/Call Center -> PhoneIcon or ChatBubbleLeftRightIcon
    if (
      l.includes("phản hồi") ||
      l.includes("response") ||
      l.includes("call center") ||
      l.includes("hỗ trợ")
    ) {
      return <Icons.PhoneIcon size={12} />;
    }
    // E-commerce/TMĐT -> GlobeAltIcon
    if (l.includes("tmđt") || l.includes("e-commerce")) {
      return <Icons.GlobeAltIcon size={12} />;
    }
    // Project -> FolderIcon
    if (l.includes("dự án") || l.includes("project")) {
      return <Icons.FolderIcon size={12} />;
    }
    // Insurance/Online management -> ShieldCheckIcon
    if (
      l.includes("bảo hiểm") ||
      l.includes("insurance") ||
      l.includes("ra mắt")
    ) {
      return <Icons.ShieldCheckIcon size={12} />;
    }

    // Default fallback
    return <Icons.TrophyIcon size={12} />;
  };

  const activeJob = jobs[activeJobIndex] || jobs[0];
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreativeJourneyPlaying, setIsCreativeJourneyPlaying] =
    useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);

  useEffect(() => {
    if (showCompanyPopup || showVideoPopup || lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showCompanyPopup, showVideoPopup, lightboxIndex]);
  const [selectedJobForPopup, setSelectedJobForPopup] = useState<Job | null>(
    null,
  );

  const lightboxImages = useMemo(() => {
    if (!activeJob?.images) return [];
    return activeJob.images.map((img) => ({
      src: img,
      alt: activeJob.company,
    }));
  }, [activeJob]);

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setLightboxIndex(null);
  };

  const handleNextLightbox = () => {
    if (lightboxImages.length === 0) return;
    setLightboxIndex((prev) =>
      prev === null ? 0 : (prev + 1) % lightboxImages.length,
    );
  };

  const handlePrevLightbox = () => {
    if (lightboxImages.length === 0) return;
    setLightboxIndex((prev) =>
      prev === null
        ? 0
        : (prev - 1 + lightboxImages.length) % lightboxImages.length,
    );
  };

  const handleMilestoneClick = (index: number) => {
    setIsAutoPlaying(false);
    setActiveJobIndex(index);
    setIsExpanded(false);
    playClickSound(); // Play sound on manual click
    if (isMobile) {
      if (jobs[index].key !== "jobsearch") {
        setSelectedJobForPopup(jobs[index]);
        setShowCompanyPopup(true);
      }
    }
  };
  return (
    <PageLayout 
        id={id} 
        className="work-experience-section"
        innerStyle={{ borderRadius: "16px" }}
    >
      <div
        className="info-card work-experience-card flex flex-col h-full"
        style={{ 
            position: "relative"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <CardTitle
            icon={<Icons.BriefcaseIcon />}
            text={pageData.title}
            tooltipTitle={pageData.tooltipTitle}
            tooltipText={pageData.tooltipText}
            containerStyle={{ height: "50px" }}
          />

        </div>

        <div className="work-experience-info">
          <div
            className={`timeline-navigation-wrapper no-scrollbar ${isMobile ? "vertical" : ""}`}
            style={{ 
              height: isMobile ? "100%" : "130px", 
              maxHeight: isMobile ? "100%" : undefined, 
              overflowY: isMobile ? "hidden" : undefined,
              flex: isMobile ? 1 : undefined
            }}
          >
            <div
              className={`timeline-container ${isMobile ? "vertical" : ""}`}
              ref={timelineContainerRef}
              style={{ height: isMobile ? "auto" : "120px" }}
            >
              <div id="timeline-segments-container" style={{ display: "none" }}></div>
              <div id="timeline-progress-bar" style={{ display: "none" }}></div>
              {!isMobile && milestoneCenters.length === jobs.length && 
                jobs.slice(0, -1).map((_, i) => {
                  const leftCenter = milestoneCenters[i];
                  const rightCenter = milestoneCenters[i + 1];
                  const logoRadius = 28; // 3.5rem = 56px, radius is 28px
                  const gap = 12; // Gap between circle edge and line segment
                  const startX = leftCenter + logoRadius + gap;
                  const endX = rightCenter - logoRadius - gap;
                  const width = Math.max(0, endX - startX);
                  
                  // Active state: if current segment is to the left of the active milestone
                  // i.e., i < activeJobIndex
                  const isActive = i < activeJobIndex;
                  const segmentColor = isActive 
                    ? (jobs[activeJobIndex]?.color || "var(--accent-color)")
                    : "var(--color-brand-progress-bg)";
                  
                  return (
                    <div
                      key={`segment-${i}`}
                      className="timeline-segment-line"
                      style={{
                        position: "absolute",
                        left: `${startX}px`,
                        width: `${width}px`,
                        top: "calc(50% + 19.5px)", // Align with original line center
                        height: "2px",
                        backgroundColor: segmentColor,
                        transform: "translateY(-50%)",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        zIndex: 1,
                      }}
                    >
                      {/* Left Dot */}
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: segmentColor,
                          transform: "translate(-50%, -50%)",
                          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                      {/* Right Dot */}
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "50%",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: segmentColor,
                          transform: "translate(50%, -50%)",
                          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    </div>
                  );
                })
              }
              {jobs.map((job, index) => (
                <div
                  key={job.key}
                  ref={(el) => {
                    if (el) milestoneRefs.current[index] = el;
                  }}
                  className={`timeline-milestone ${index === activeJobIndex ? "active" : ""}`}
                  onClick={() => handleMilestoneClick(index)}
                  style={{ "--item-color": job.color } as React.CSSProperties}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setActiveJobIndex(index);
                  }}
                  aria-label={`View details for ${job.company}`}
                >
                  <div
                    className="year-text"
                    style={{
                      color: index === activeJobIndex ? job.color : undefined,
                    }}
                  >
                    <Icons.CalendarDaysIcon size={16} />
                    <span>{job.date.split(" - ")[0]}</span>
                  </div>
                  <div className="timeline-dot-container">
                    <motion.div
                      className="timeline-dot"
                      style={{
                        borderColor: job.color,
                      }}
                      animate={
                        index === activeJobIndex
                          ? {
                              y: [0, -6, 0],
                            }
                          : { y: 0 }
                      }
                      transition={
                        index === activeJobIndex
                          ? {
                              duration: 1.2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }
                          : {}
                      }
                    >
                      <img
                        src={job.logoUrl}
                        alt={`${job.company} logo`}
                        className="timeline-dot-img"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {activeJob && (!isMobile || activeJob.key === "jobsearch") && (
            <div
              className={`job-card experience-item flex flex-col justify-between ${isExpanded ? "is-expanded" : ""}`}
              key={activeJob.key}
              onDoubleClick={() => setIsExpanded(!isExpanded)}
              style={{
                border: `2px solid ${activeJob.color}`,
                borderRadius: isExpanded ? "16px" : "24px",
                padding: activeJob.key === "jobsearch" ? "0" : "1.75rem",
                width: isExpanded ? "100%" : "calc(100% - 51px)",
                flex: 1,
                minHeight: activeJob.key === "jobsearch" ? "200px" : 0,
                marginLeft: isExpanded ? "0px" : "25.5px",
                marginRight: isExpanded ? "0px" : "25.5px",
                marginTop: isExpanded ? "0px" : "10px",
                marginBottom: "0px",
                boxShadow: isExpanded
                  ? `0 24px 60px -12px rgba(0, 0, 0, 0.55), 0 0 25px -3px ${activeJob.color}44`
                  : `0 12px 40px -8px rgba(0, 0, 0, 0.4), 0 0 15px -3px ${activeJob.color}33`,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: isExpanded ? 50 : 1,
                position: isExpanded ? "absolute" : "relative",
                top: isExpanded ? 0 : undefined,
                left: isExpanded ? 0 : undefined,
                right: isExpanded ? 0 : undefined,
                bottom: isExpanded ? 0 : undefined,
                cursor: "default",
                overflow: "hidden",
              }}
            >
              {activeJob.key === "jobsearch" ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <video
                    id="job-search-video"
                    src="https://cdn.scena.ai/project/9626/a5b5bdf1659991c0c74510ddfc59b9d27a3c7478f17c711b0fc39c5e51cf43d2.mp4"
                    autoPlay
                    loop={!isCreativeJourneyPlaying}
                    muted={!isCreativeJourneyPlaying}
                    playsInline
                    onEnded={() => setIsCreativeJourneyPlaying(false)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {showPrompt2026 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(16, 23, 51, 0.75)",
                        backdropFilter: "blur(6px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 40,
                      }}
                      className="animate-fadeIn"
                    >
                      <div
                        style={{
                          background: "rgba(30, 41, 59, 0.9)",
                          backdropFilter: "blur(12px)",
                          border: "1.5px solid rgba(247, 47, 47, 0.4)",
                          borderRadius: "16px",
                          padding: "1.25rem 1.5rem",
                          textAlign: "center",
                          maxWidth: "360px",
                          width: "90%",
                          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 15px rgba(247, 47, 47, 0.2)",
                        }}
                      >
                        <h4
                          style={{
                            color: "#fff",
                            fontSize: "16px",
                            fontWeight: "bold",
                            marginBottom: "0.5rem",
                            fontFamily: "var(--font-heading)",
                            letterSpacing: "0.5px"
                          }}
                        >
                          Hành trình sáng tạo của Hùng Thái
                        </h4>
                        <p
                          style={{
                            color: "rgba(255, 255, 255, 0.85)",
                            fontSize: "14px",
                            marginBottom: "1.25rem",
                            lineHeight: "1.4"
                          }}
                        >
                          Bạn muốn xem hành trình sáng tạo?
                        </p>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            justifyContent: "center"
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPrompt2026(false);
                              const video = document.getElementById(
                                "job-search-video",
                              ) as HTMLVideoElement;
                              if (video) {
                                video.muted = false;
                                video.loop = false;
                                video.currentTime = 0;
                                video.play();
                                setIsCreativeJourneyPlaying(true);
                              }
                            }}
                            style={{
                              backgroundColor: "#f72f2f",
                              color: "white",
                              border: "none",
                              borderRadius: "30px",
                              padding: "6px 20px",
                              fontWeight: "bold",
                              cursor: "pointer",
                              fontSize: "13px",
                              transition: "all 0.2s",
                              boxShadow: "0 4px 12px rgba(247, 47, 47, 0.4)"
                            }}
                            className="hover:scale-105 active:scale-95"
                          >
                            Có
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPrompt2026(false);
                            }}
                            style={{
                              backgroundColor: "transparent",
                              color: "rgba(255, 255, 255, 0.6)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              borderRadius: "30px",
                              padding: "6px 20px",
                              fontWeight: "bold",
                              cursor: "pointer",
                              fontSize: "13px",
                              transition: "all 0.2s"
                            }}
                            className="hover:scale-105 hover:text-white hover:border-white active:scale-95"
                          >
                            Không
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {!isCreativeJourneyPlaying ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const video = document.getElementById(
                          "job-search-video",
                        ) as HTMLVideoElement;
                        if (video) {
                          video.muted = false;
                          video.loop = false;
                          video.currentTime = 0;
                          video.play();
                          setIsCreativeJourneyPlaying(true);
                        }
                      }}
                      style={{
                        position: "absolute",
                        bottom: "16px",
                        left: "16px",
                        backgroundColor: "#4c2424",
                        backdropFilter: "blur(10px)",
                        color: "#f72f2f",
                        border: "1.5px solid #f30404",
                        borderRadius: "50px",
                        padding: "10px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: `0 8px 24px -4px ${activeJob.color}44`,
                        zIndex: 10,
                        fontSize: "14px",
                        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                        fontFamily: "'Play', sans-serif",
                      }}
                      className="creative-journey-btn hover:scale-105 active:scale-95"
                    >
                      <Icons.PlayIcon size={20} fill="currentColor" />
                      <span>Hành trình sáng tạo</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const video = document.getElementById(
                          "job-search-video",
                        ) as HTMLVideoElement;
                        if (video) {
                          video.muted = true;
                          video.loop = true;
                          video.play();
                          setIsCreativeJourneyPlaying(false);
                        }
                      }}
                      style={{
                        position: "absolute",
                        bottom: "16px",
                        right: "16px",
                        backgroundColor: "rgba(239, 68, 68, 0.8)",
                        backdropFilter: "blur(10px)",
                        color: "white",
                        border: "1.5px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "50px",
                        padding: "10px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: "0 8px 24px -4px rgba(239, 68, 68, 0.4)",
                        zIndex: 10,
                        fontSize: "14px",
                        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                      }}
                      className="cancel-journey-btn hover:scale-105 active:scale-95"
                    >
                      <Icons.XMarkIcon size={20} />
                      <span>Hủy</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="job-card-scrollable-content no-scrollbar">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    style={{
                      position: "absolute",
                      top: "1.5rem",
                      right: "1.5rem",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: activeJob.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255,255,255,0.06)",
                      transition: "all 0.2s",
                      zIndex: 20,
                    }}
                    className="hover:scale-105 active:scale-95"
                    title={
                      isExpanded
                        ? "Thu nhỏ (Double click)"
                        : "Phóng to (Double click)"
                    }
                  >
                    {isExpanded ? (
                      <Icons.MinimizeIcon size={12} />
                    ) : (
                      <Icons.MaximizeIcon size={12} />
                    )}
                    <span
                      style={{
                        fontSize: "10px",
                        marginLeft: "4px",
                        opacity: 0.8,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                      }}
                    >
                      {isExpanded ? "Thu nhỏ" : "Phóng to"}
                    </span>
                  </button>
                  {/* Row 1: Date Range & Logo/Company */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      height: "50px",
                      marginBottom: "0px",
                      fontWeight: "bold",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400"
                        style={{ height: "20px" }}
                      >
                        <Icons.CalendarDaysIcon
                          size={14}
                          className="text-slate-400 shrink-0"
                        />
                        {formatJobDate(activeJob.date)}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        height: "50px",
                        marginBottom: "0px",
                      }}
                    >
                      {activeJob.logos ? (
                        activeJob.logos.map((logo, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "100px",
                              backgroundColor: "white",
                              padding: "2px",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              border: `1.5px solid ${activeJob.color}`,
                              textAlign: "right",
                            }}
                          >
                            <img
                              src={logo}
                              alt={`${activeJob.company} logo ${idx}`}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "100px",
                              }}
                              className="object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ))
                      ) : (
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "100px",
                            backgroundColor: "white",
                            padding: "2px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            border: `1.5px solid ${activeJob.color}`,
                            textAlign: "right",
                          }}
                        >
                          <img
                            src={activeJob.logoUrl}
                            alt={activeJob.company}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "100px",
                            }}
                            className="object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <h4
                        className="text-lg font-bold m-0 tracking-tight"
                        style={{ color: activeJob.color, height: "32px" }}
                      >
                        {activeJob.company}
                      </h4>
                    </div>
                  </div>

                  {/* Row 2: Position and Management */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                      height: "32px",
                      marginBottom: "0px",
                      alignItems: "center",
                    }}
                  >
                    <h3
                      className="text-xl font-extrabold tracking-tight text-[var(--color-brand-text-primary)] leading-snug m-0"
                      style={{
                        height: "27.7857px",
                        marginTop: "0px",
                        marginBottom: "0px",
                        fontSize: "18.888px",
                      }}
                    >
                      {activeJob.title}
                    </h3>
                    <div className="justify-self-end">
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300"
                        style={{ textAlign: "right" }}
                      >
                        <Icons.UsersIcon
                          size={17}
                          className="text-slate-400 shrink-0"
                          style={{ fontWeight: "bold" }}
                        />
                        <span style={{ fontWeight: "bold" }}>
                          {pageData.managedTitle}:{" "}
                        </span>
                        <strong className="text-white font-semibold">
                          {activeJob.teamSize}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Tasks, Projects, and Achievements */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "1.5rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div style={{ gridRow: "1 / span 2" }}>
                      <h5
                        className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                        style={{
                          marginBottom: "0.75rem",
                          color: activeJob.color,
                          fontSize: "16px",
                        }}
                      >
                        <Icons.ClipboardDocumentListIcon
                          size={16}
                          style={{ paddingRight: "10px" }}
                        />
                        {pageData.tasksTitle || pageData.descriptionTitle}
                      </h5>
                      <ul
                        className="popup-responsibilities"
                        style={{
                          borderTop: "none",
                          paddingTop: 0,
                          listStyleType: "decimal",
                          paddingLeft: "1.5rem",
                        }}
                      >
                        {(activeJob.tasks || activeJob.responsibilities).map(
                          (item, index) => (
                            <li
                              key={index}
                              style={{
                                marginBottom: "0.4rem",
                                fontSize: "0.85rem",
                                lineHeight: "1.4",
                                color: "var(--color-brand-text-secondary)",
                              }}
                            >
                              {item}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                    <div>
                      {activeJob.projects && activeJob.projects.length > 0 && (
                        <div>
                          <h5
                            className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                            style={{
                              marginBottom: "0.75rem",
                              color: activeJob.color,
                              fontSize: "16px",
                            }}
                          >
                            <Icons.FolderIcon
                              size={16}
                              style={{
                                marginLeft: "0px",
                                paddingTop: "0px",
                                marginRight: "10px",
                              }}
                            />
                            {pageData.projectsTitle}
                          </h5>
                          <ul
                            className="popup-responsibilities"
                            style={{
                              borderTop: "none",
                              paddingTop: 0,
                              listStyleType: "disc",
                              paddingLeft: "1.5rem",
                            }}
                          >
                            {activeJob.projects.map((item, index) => {
                              const cleanItemName = item
                                .replace(/^\d+\./, "")
                                .trim();
                              const vietnameseToEnglishProjectTitleMap: Record<
                                string,
                                string
                              > = {
                                "Xây dựng Phòng Dịch vụ Khách hàng":
                                  "Building a Customer Service Department",
                                "Thiết lập mục tiêu phòng ban":
                                  "Setting Departmental Goals",
                                "Thúc đẩy cải tiến sản phẩm":
                                  "Driving Product Improvement",
                                "Chuẩn hóa quy trình CSKH":
                                  "Standardizing CS Processes",
                                "Quản lý chiến dịch Outbound":
                                  "Managing Outbound Campaigns",
                                "Phân tích & Báo cáo": "Analysis & Reporting",
                                "Quản lý dự án CSKH": "CS Project Management",
                                "Xây dựng hệ thống CRM":
                                  "Building a CRM System",
                                "Phát triển đào tạo trực tuyến":
                                  "Developing Online Training",
                                "Thành lập Trung tâm Hỗ trợ Khách hàng":
                                  "Establishing a Help Center",
                                "Tối ưu hóa kênh hỗ trợ":
                                  "Optimizing Support Channels",
                                "Triển khai tự động hóa":
                                  "Implementing Automation",
                                "Xây dựng AI Bot": "Building an AI Bot",
                                "Khảo sát & Đánh giá khách hàng":
                                  "Customer Surveys & Assessment",
                                "Nâng cao trải nghiệm khách hàng":
                                  "Enhancing Customer Experience",
                              };

                              const englishTitle =
                                vietnameseToEnglishProjectTitleMap[
                                  cleanItemName
                                ] || cleanItemName;
                              const project = t.projectsPage.projects.find(
                                (p) =>
                                  p.title === englishTitle ||
                                  p.title === cleanItemName,
                              );
                              const projectKey = project
                                ? `project-${project.id}`
                                : null;
                              return (
                                <li
                                  key={index}
                                  style={{
                                    marginBottom: "0.4rem",
                                    fontSize: "0.85rem",
                                    lineHeight: "1.4",
                                  }}
                                >
                                  {projectKey && onNavigate ? (
                                    <button
                                      onClick={() => {
                                        sessionStorage.setItem(
                                          "referrer_experience",
                                          "true",
                                        );
                                        sessionStorage.setItem(
                                          "referrer_job_index",
                                          activeJobIndex.toString(),
                                        );
                                        onNavigate(projectKey);
                                      }}
                                      style={{
                                        color: activeJob.color,
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                        background: "none",
                                        border: "none",
                                        padding: 0,
                                        textAlign: "left",
                                      }}
                                    >
                                      {item}
                                    </button>
                                  ) : (
                                    <span style={{ color: activeJob.color }}>
                                      {item}
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div>
                      {activeJob.achievements.length > 0 && (
                        <div className="achievements-vertical-list">
                          <h5
                            className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                            style={{
                              marginBottom: "0.75rem",
                              color: activeJob.color,
                              fontSize: "16px",
                            }}
                          >
                            <Icons.TrophyIcon
                              size={16}
                              style={{
                                marginLeft: "0px",
                                paddingTop: "0px",
                                marginRight: "10px",
                              }}
                            />
                            {pageData.achievementsTitle}
                          </h5>
                          <ul
                            className="popup-responsibilities"
                            style={{
                              borderTop: "none",
                              paddingTop: 0,
                              listStyle: "none",
                              paddingLeft: "0px",
                            }}
                          >
                            {activeJob.achievements.map((ach, index) => (
                              <li
                                key={index}
                                style={{
                                  marginBottom: "0.4rem",
                                  fontSize: "0.85rem",
                                  lineHeight: "1.4",
                                  color: "var(--color-brand-text-secondary)",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "0.5rem",
                                }}
                              >
                                <span
                                  style={{
                                    color: activeJob.color,
                                    flexShrink: 0,
                                    marginTop: "2px",
                                  }}
                                >
                                  {getAchievementIcon(ach.label)}
                                </span>
                                <div>
                                  {ach.label}
                                  <span
                                    className="font-bold ml-2 whitespace-nowrap"
                                    style={{
                                      color: activeJob.color,
                                      paddingTop: "0px",
                                      marginLeft: "10px",
                                    }}
                                  >
                                    {ach.value}%
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {activeJob.images && activeJob.images.length > 0 && (
                      <div
                        className="job-image-slider-wrapper"
                        style={{
                          gridColumn: "2 / span 2",
                          gridRow: "2",
                          marginTop: "0px",
                          borderTop:
                            "1px solid var(--color-brand-glass-border)",
                          paddingTop: "0px",
                          width: "100%",
                          height: "100px",
                          overflow: "hidden",
                        }}
                      >
                        <style>{`
                                                @keyframes marquee-l2r {
                                                    0% { transform: translateX(-50%); }
                                                    100% { transform: translateX(0%); }
                                                }
                                                .marquee-track {
                                                    display: flex;
                                                    width: max-content;
                                                    animation: marquee-l2r 20s linear infinite;
                                                    gap: 0.75rem;
                                                }
                                                .marquee-track:hover {
                                                    animation-play-state: paused;
                                                }
                                            `}</style>
                        <h5
                          className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                          style={{
                            color: activeJob.color,
                            marginTop: "0px",
                            marginBottom: "8px",
                          }}
                        >
                          <Icons.PhotoIcon size={16} />
                          {pageData.relatedImagesTitle}
                        </h5>
                        <div style={{ overflow: "hidden", width: "100%" }}>
                          <div className="marquee-track">
                            {[
                              ...activeJob.images,
                              ...activeJob.images,
                              ...activeJob.images,
                              ...activeJob.images,
                            ].map((src, index) => {
                              const originalIndex =
                                index % activeJob.images.length;
                              return (
                                <div
                                  key={index}
                                  className="transform hover:scale-[1.05] transition-all duration-300 cursor-pointer shrink-0"
                                  onClick={() =>
                                    handleOpenLightbox(originalIndex)
                                  }
                                  style={{ width: "110px", height: "60px" }}
                                >
                                  <OptimizedImage
                                    src={src}
                                    alt={`Work sample ${originalIndex + 1}`}
                                    loading="lazy"
                                    style={{
                                      width: "110px",
                                      height: "60px",
                                      borderRadius: "8px",
                                      objectFit: "cover",
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showVideoPopup &&
        document.getElementById("popup-root") &&
        createPortal(
          <div
            className="video-popup-overlay"
            onClick={() => setShowVideoPopup(false)}
          >
            <div
              className="video-popup-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="video-popup-close-btn"
                onClick={() => setShowVideoPopup(false)}
                aria-label="Close video"
              >
                <Icons.XMarkIcon />
              </button>
              <video
                src={videoUrl}
                controls
                autoPlay
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>,
          document.getElementById("popup-root")!,
        )}
      {showCompanyPopup &&
        selectedJobForPopup &&
        document.getElementById("popup-root") &&
        createPortal(
          <div
            className="video-popup-overlay"
            style={{ zIndex: 9999 }}
            onClick={() => setShowCompanyPopup(false)}
          >
            <div
              className="experience-popup-content"
              style={{
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="video-popup-close-btn"
                onClick={() => setShowCompanyPopup(false)}
                style={{ top: "1rem", right: "1rem" }}
              >
                <Icons.XMarkIcon />
              </button>

              <div className="flex items-center gap-4">
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "12px",
                    backgroundColor: "white",
                    padding: "8px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={selectedJobForPopup.logoUrl}
                    alt={selectedJobForPopup.company}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
                    {selectedJobForPopup.company}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: selectedJobForPopup.color,
                      fontWeight: "bold",
                    }}
                  >
                    {selectedJobForPopup.date}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h5 className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-70">
                    {pageData.positionTitle}
                  </h5>
                  <p className="font-bold text-lg">
                    {selectedJobForPopup.title}
                  </p>
                </div>

                {selectedJobForPopup.teamSize && (
                  <div>
                    <h5 className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-70">
                      {pageData.managedTitle}
                    </h5>
                    <p>{selectedJobForPopup.teamSize}</p>
                  </div>
                )}

                <div>
                  <h5 className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-70">
                    {pageData.descriptionTitle}
                  </h5>
                  {selectedJobForPopup.responsibilities.map((resp, idx) => (
                    <p key={idx} className="mb-2 leading-relaxed">
                      {resp}
                    </p>
                  ))}
                </div>

                {selectedJobForPopup.tasks &&
                  selectedJobForPopup.tasks.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-70">
                        {pageData.tasksTitle}
                      </h5>
                      <ul className="popup-responsibilities">
                        {selectedJobForPopup.tasks.map((task, idx) => (
                          <li key={idx} className="mb-1">
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selectedJobForPopup.projects &&
                  selectedJobForPopup.projects.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-70">
                        {pageData.projectsTitle}
                      </h5>
                      <ul className="popup-responsibilities">
                        {selectedJobForPopup.projects.map((project, idx) => (
                          <li key={idx} className="mb-1">
                            {project}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selectedJobForPopup.achievements &&
                  selectedJobForPopup.achievements.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-70">
                        {pageData.achievementsTitle}
                      </h5>
                      <div className="achievements-grid mt-2">
                        {selectedJobForPopup.achievements.map(
                          (achievement, idx) => (
                            <JobAchievementCard
                              key={idx}
                              achievement={achievement}
                              color={selectedJobForPopup.color}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>,
          document.getElementById("popup-root")!,
        )}
      {lightboxIndex !== null &&
        lightboxImages.length > 0 &&
        document.getElementById("popup-root") &&
        createPortal(
          <Lightbox
            images={lightboxImages}
            currentIndex={lightboxIndex}
            onClose={handleCloseLightbox}
            onNext={handleNextLightbox}
            onPrev={handlePrevLightbox}
          />,
          document.getElementById("popup-root")!,
        )}
    </PageLayout>
  );
};
export default WorkExperiencePage;
