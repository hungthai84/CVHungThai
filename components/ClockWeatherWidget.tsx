import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

const CustomWeatherIcon = () => (
    <div className="weather-icon-wrapper">
        <motion.div 
            className="weather-sun"
            animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
            }}
            transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
            }}
        ></motion.div>
        <motion.div 
            className="weather-cloud-small"
            animate={{ 
                x: [0, 5, 0],
                y: [0, -3, 0]
            }}
            transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.5
            }}
        ></motion.div>
        <motion.div 
            className="weather-cloud-large"
            animate={{ 
                x: [0, -5, 0],
                y: [0, 3, 0]
            }}
            transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
            }}
        ></motion.div>
    </div>
);


const ClockWeatherWidget: React.FC = () => {
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
        const days = ["Chúa Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        return days[date.getDay()];
    };

    const dayOfWeek = getDayOfWeek(time);
    const dateString = formatDate(time);
    const temperature = "28"; 
    const city = "Thành phố Hồ Chí Minh";
    const country = "Việt Nam";

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