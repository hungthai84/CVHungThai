import React from 'react';
import MainContent from './MainContent';
import CoverLetter from './CoverLetter';
import { AboutPage } from './AboutPage';
import WorkExperiencePage from './WorkExperiencePage';
import EducationPage from './EducationPage';
import ServicesPage from './ServicesPage';
import SkillsPage from './SkillsPage';
import { ProjectsPage } from './ProjectsPage';
import AchievementsPage from './AchievementsPage';

const PrintableView: React.FC = () => {
    return (
        <div id="printable-content">
            <div className="print-page"><MainContent /></div>
            <div className="print-page"><CoverLetter /></div>
            <div className="print-page"><AboutPage /></div>
            <div className="print-page"><WorkExperiencePage /></div>
            <div className="print-page"><EducationPage /></div>
            <div className="print-page"><ServicesPage /></div>
            <div className="print-page"><SkillsPage /></div>
            <div className="print-page"><ProjectsPage /></div>
            <div className="print-page"><AchievementsPage /></div>
        </div>
    );
};

export default PrintableView;