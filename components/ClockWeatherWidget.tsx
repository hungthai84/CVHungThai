import React, { useState, useEffect } from 'react';
import { useI18n } from '../contexts/i18n';

const CustomWeatherIcon = () => (
    <div className="weather-icon-wrapper-animated" aria-label="Animated weather illustration">
        <svg viewBox="0 0 100 100" className="weather-animated-svg">
            <defs>
                <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffb700" />
                    <stop offset="100%" stopColor="#ff5500" />
                </linearGradient>
                <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#cfdfeb" />
                </linearGradient>
                <filter id="weatherGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            
            {/* Sun rays & center (rotating) */}
            <g className="weather-sun-group">
                <circle cx="45" cy="40" r="16" fill="url(#sunGradient)" filter="url(#weatherGlow)" />
                <g className="weather-sun-rays">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <line
                            key={i}
                            x1="45"
                            y1="14"
                            x2="45"
                            y2="6"
                            stroke="#ff9e00"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            transform={`rotate(${i * 45} 45 40)`}
                            className="weather-ray"
                        />
                    ))}
                </g>
            </g>

            {/* Raindrops (staggered falling) */}
            <g className="weather-rain-group">
                <line x1="38" y1="65" x2="34" y2="73" stroke="#00d2ff" strokeWidth="2.5" strokeLinecap="round" className="weather-rain-drop drop-1" />
                <line x1="48" y1="68" x2="44" y2="76" stroke="#00d2ff" strokeWidth="2.5" strokeLinecap="round" className="weather-rain-drop drop-2" />
                <line x1="58" y1="65" x2="54" y2="73" stroke="#00d2ff" strokeWidth="2.5" strokeLinecap="round" className="weather-rain-drop drop-3" />
            </g>

            {/* Cloud (floating) */}
            <path
                d="M32 62 C26 62 21 57 21 51 C21 45 26 40 32 40 C34 34 39 30 46 30 C53 30 58 35 59 41 C64 41 68 45 68 50 C68 56 63 61 57 61 Z"
                fill="url(#cloudGradient)"
                className="weather-cloud-animated"
                filter="drop-shadow(0px 3px 5px rgba(0,0,0,0.18))"
            />
        </svg>
    </div>
);


const ClockWeatherWidget: React.FC = () => {
    const { language } = useI18n();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const formatTime = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const getDayOfWeek = (date: Date) => {
        const daysVi = ["Chúa Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return language === 'vi' ? daysVi[date.getDay()] : daysEn[date.getDay()];
    };

    const dayOfWeek = getDayOfWeek(time);
    const dateString = formatDate(time);
    const temperature = "28"; 
    const city = language === 'vi' ? "Thành phố Hồ Chí Minh" : "Ho Chi Minh City";
    const country = language === 'vi' ? "Việt Nam" : "Vietnam";

    return (
        <div className="clock-weather-widget">
            <div className="time-display">{formatTime(time)}</div>
            <div className="date-display">
                <span>{dayOfWeek}</span>
                <span>{dateString}</span>
            </div>
            
            <CustomWeatherIcon />

            <div className="temperature-display">
                {temperature}
                <span className="degree-symbol">°</span>
                <span className="degree-celsius">C</span>
            </div>

            <div className="location-display">
                <span className="city">{city}</span>
                <span className="country">{country}</span>
            </div>
        </div>
    );
};

export default ClockWeatherWidget;