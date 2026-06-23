import React, { useEffect, useState } from 'react';
import * as Icons from './Icons';
import { useI18n } from '../contexts/i18n';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';

const VisitorCounter: React.FC = () => {
    const { language } = useI18n();
    const [count, setCount] = useState<number | null>(null);

    const label = language === 'vi' ? 'Lượt truy cập' : 'Visits';

    useEffect(() => {
        const incrementVisitorCounter = async () => {
            try {
                const docRef = doc(db, 'stats', 'visitor_counter');
                
                // Track visits once per session to avoid counting rapid page refreshes
                const sessionVisited = sessionStorage.getItem('cv_v2_visited');
                if (!sessionVisited) {
                    sessionStorage.setItem('cv_v2_visited', 'true');
                    
                    const docSnap = await getDoc(docRef);
                    if (!docSnap.exists()) {
                        await setDoc(docRef, { count: 1 });
                    } else {
                        await updateDoc(docRef, { count: increment(1) });
                    }
                }
            } catch (error) {
                console.error('Error incrementing visitor counter:', error);
                // Do not throw to crash the UI, but report safely
                try {
                    handleFirestoreError(error, OperationType.UPDATE, 'stats/visitor_counter');
                } catch (err) {
                    // Silently fail to not disrupt user experience
                }
            }
        };

        incrementVisitorCounter();

        // Listen for real-time changes
        const docRef = doc(db, 'stats', 'visitor_counter');
        const unsubscribe = onSnapshot(docRef, 
            (snapshot) => {
                if (snapshot.exists()) {
                    setCount(snapshot.data().count);
                } else {
                    setCount(0);
                }
            },
            (error) => {
                console.error('Error listening to visitor counter:', error);
                try {
                    handleFirestoreError(error, OperationType.GET, 'stats/visitor_counter');
                } catch (err) {
                    // Fail silently to safeguard user interface
                }
            }
        );

        return () => unsubscribe();
    }, []);

    // Return a subtle, extremely polished glassy stats counter
    return (
        <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border"
            style={{
                backgroundColor: 'rgba(var(--card-bg-rgb), 0.4)',
                borderColor: 'var(--card-border)',
                color: 'var(--color-brand-text-secondary)',
                backdropFilter: 'blur(8px)'
            }}
            title={`${label}: ${count !== null ? count : '...'}`}
        >
            <Icons.UsersIcon size={14} className="opacity-85 text-orange-400" />
            <span className="opacity-80">{label}</span>
            <span 
                className="font-mono font-semibold px-1.5 py-0.5 rounded-md bg-black/10 text-orange-400 min-w-[20px] text-center"
            >
                {count !== null ? count.toLocaleString() : '...'}
            </span>
        </div>
    );
};

export default VisitorCounter;
