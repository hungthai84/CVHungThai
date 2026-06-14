import React from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import { useTheme } from '../contexts/ThemeContext';

interface SchedulerPageProps {
    id?: string;
}

const SchedulerPage: React.FC<SchedulerPageProps> = ({ id }) => {
    const { t } = useI18n();
    const { themeMode } = useTheme();
    const pageData = t.schedulerPage;

    const iframeStyle: React.CSSProperties = {
        border: 0,
        width: '100%',
        height: '100%',
        borderRadius: '10px',
        backgroundColor: 'transparent',
        ...(themeMode === 'dark' 
            ? { filter: 'invert(0.92) hue-rotate(180deg) brightness(1.1) contrast(1.1)', mixBlendMode: 'screen' }
            : { mixBlendMode: 'multiply' }
        )
    };

    return (
        <PageLayout id={id}>
            <div className="info-card" style={{ padding: 0, overflow: 'hidden', background: 'transparent' }}>
                <iframe 
                    src="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1a3Mw_pkdsalTQ8K30r6bUr8UJ1591ZRowrMZn07qSE1n9QBEoQ06TGv9p3MCKctU-tQ2Z-0ma?gv=true" 
                    title={pageData.tooltipTitle}
                    style={iframeStyle}
                    frameBorder="0"
                ></iframe>
            </div>
        </PageLayout>
    );
};

export default SchedulerPage;