import React from 'react';

interface KpiCardProps {
    title: string;
    value: string;
    description: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, description }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 hover:border-orange-500 transition-all duration-300 transform hover:-translate-y-1">
            <h4 className="text-xs font-medium text-gray-400 truncate" title={title}>{title}</h4>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1 truncate" title={description}>{description}</p>
        </div>
    );
};
