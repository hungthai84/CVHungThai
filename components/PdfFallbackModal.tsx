import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from './Icons';

interface PdfFallbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl?: string;
}

const PdfFallbackModal: React.FC<PdfFallbackModalProps> = ({ isOpen, onClose, pdfUrl }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                                    <Icons.DownloadIcon className="text-[var(--color-brand)]" />
                                    Hướng dẫn tải CV
                                </h3>
                                <button onClick={onClose} className="p-1 hover:bg-[var(--color-bg-secondary)] rounded-full transition-colors">
                                    <Icons.XIcon size={20} />
                                </button>
                            </div>
                            
                            <div className="space-y-4 text-[var(--color-text-secondary)] text-sm leading-relaxed">
                                <p>Hệ thống vừa tạo một bản xem trước PDF cho bạn. Nếu file chưa tự động tải về, bạn có thể thực hiện theo các bước sau:</p>
                                
                                <ol className="list-decimal list-inside space-y-2">
                                    <li>Nhấn nút <strong>"Mở bản PDF"</strong> bên dưới.</li>
                                    <li>Khi file hiện ra, nhấn tổ hợp phím <strong>Ctrl + P</strong> (Windows) hoặc <strong>Cmd + P</strong> (Mac).</li>
                                    <li>Tại mục Máy in (Printer), chọn <strong>"Lưu dưới dạng PDF"</strong> (Save as PDF).</li>
                                    <li>Nhấn <strong>Lưu</strong> để hoàn tất.</li>
                                </ol>

                                {pdfUrl && (
                                    <a 
                                        href={pdfUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--color-brand)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity mt-4"
                                    >
                                        <Icons.ExternalLinkIcon size={18} />
                                        Mở bản PDF để Lưu
                                    </a>
                                )}
                            </div>
                        </div>
                        
                        <div className="bg-[var(--color-bg-secondary)] px-6 py-4 flex justify-end">
                            <button 
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium hover:text-[var(--color-text-primary)] transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PdfFallbackModal;
