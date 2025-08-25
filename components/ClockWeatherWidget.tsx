import React, { useState, useEffect } from 'react';

const CustomWeatherIcon = () => (
    <div className="weather-icon-wrapper">
        <div className="weather-sun"></div>
        <div className="weather-cloud-small"></div>
        <div className="weather-cloud-large"></div>
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

    // Data from the image
    const dayOfWeek = "Thứ Hai";
    const dateString = "08/25/2025";
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