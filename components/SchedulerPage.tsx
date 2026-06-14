import React from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';

interface SchedulerPageProps {
    id?: string;
}

const SchedulerPage: React.FC<SchedulerPageProps> = ({ id }) => {
    const { t } = useI18n();
    const pageData = t.schedulerPage;

    return (
        <PageLayout id={id}>
            <div className="info-card" style={{ padding: 0, overflow: 'hidden' }}>
                <iframe 
                    src="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1a3Mw_pkdsalTQ8K30r6bUr8UJ1591ZRowrMZn07qSE1n9QBEoQ06TGv9p3MCKctU-tQ2Z-0ma?gv=true" 
                    title={pageData.tooltipTitle}
                    style={{ border: 0, width: '100%', height: '100%', borderRadius: '10px' }}
                    frameBorder="0"
                ></iframe>
            </div>
        </PageLayout>
    );
};

export default SchedulerPage;