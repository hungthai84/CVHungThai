import React from 'react';
import * as Icons from './Icons';

interface PermissionNoticeProps {
    onAcknowledge: () => void;
}

const PermissionNotice: React.FC<PermissionNoticeProps> = ({ onAcknowledge }) => {
    return (
        <div className="permission-notice-overlay">
            <div className="permission-notice-card">
                <div className="permission-notice-icon">
                    <Icons.MicrophoneIcon />
                    <Icons.MapPinIcon />
                </div>
                <h4>Yêu cầu quyền truy cập</h4>
                <p>
                    Để có trải nghiệm đầy đủ, ứng dụng này sẽ yêu cầu quyền truy cập vào micro (cho Trợ lý AI) và vị trí của bạn (cho tiện ích thời tiết).
                </p>
                <button onClick={onAcknowledge} className="btn btn-primary">
                    Tôi đã hiểu
                </button>
            </div>
        </div>
    );
};

export default PermissionNotice;