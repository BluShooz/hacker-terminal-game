import React from 'react';

interface StatDisplayProps {
    label: string;
    value: string | number;
    glowColor?: string;
}

export const StatDisplay: React.FC<StatDisplayProps> = ({ label, value, glowColor = 'text-green-400' }) => {
    return (
        <div className="border border-green-900 bg-black/60 p-3 text-center">
            <div className="text-[10px] text-green-700 uppercase tracking-widest mb-1">{label}</div>
            <div className={`text-2xl font-bold font-mono ${glowColor}`}>{value}</div>
        </div>
    );
};
