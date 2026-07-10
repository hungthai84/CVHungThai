import re

with open('components/ClockWeatherWidget.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { useI18n } from '../contexts/i18n';"
)

content = content.replace(
    "const ClockWeatherWidget: React.FC = () => {",
    "const ClockWeatherWidget: React.FC = () => {\n    const { language } = useI18n();"
)

old_get_day = """    const getDayOfWeek = (date: Date) => {
        const days = ["Chúa Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        return days[date.getDay()];
    };"""

new_get_day = """    const getDayOfWeek = (date: Date) => {
        const daysVi = ["Chúa Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return language === 'vi' ? daysVi[date.getDay()] : daysEn[date.getDay()];
    };"""

content = content.replace(old_get_day, new_get_day)

old_vars = """    const temperature = "28"; 
    const city = "Thành phố Hồ Chí Minh";
    const country = "Việt Nam";"""

new_vars = """    const temperature = "28"; 
    const city = language === 'vi' ? "Thành phố Hồ Chí Minh" : "Ho Chi Minh City";
    const country = language === 'vi' ? "Việt Nam" : "Vietnam";"""

content = content.replace(old_vars, new_vars)

with open('components/ClockWeatherWidget.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch applied")
