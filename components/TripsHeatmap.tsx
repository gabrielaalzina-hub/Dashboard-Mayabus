import React from 'react';

interface HeatmapProps {
    data: { [key: string]: { [key: number]: number } };
    hours: number[];
    days: string[];
    maxCount: number;
}

// Helper to get color based on value
const getColorForValue = (value: number, maxValue: number) => {
    if (value === 0) return 'bg-gray-700/30';
    if (maxValue <= 0) return 'bg-orange-900'; // Handle no data or max value of 0 case
    const intensity = Math.min(value / maxValue, 1.0);
    
    if (intensity < 0.01) return 'bg-orange-900/50';
    if (intensity < 0.2) return 'bg-orange-800';
    if (intensity < 0.4) return 'bg-orange-700';
    if (intensity < 0.6) return 'bg-orange-600';
    if (intensity < 0.8) return 'bg-orange-500';
    return 'bg-orange-400';
};

export const TripsHeatmap: React.FC<HeatmapProps> = ({ data, hours, days, maxCount }) => {
    return (
        <div className="flex text-xs h-full w-full">
            {/* Hour Labels (Y-Axis) */}
            <div className="flex flex-col pt-6 pr-2 text-gray-400" style={{ fontSize: '0.7rem' }}>
                {hours.map(hour => (
                    <div key={hour} className="flex-1 flex items-center justify-end">
                        {`${hour.toString().padStart(2, '0')}:00`}
                    </div>
                ))}
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-7 gap-1 flex-1">
                {/* Day Labels (X-Axis) */}
                {days.map(day => (
                    <div key={day} className="h-6 flex items-center justify-center font-bold text-gray-300">{day.substring(0,3)}</div>
                ))}
                
                {/* Cells */}
                {days.map(day => (
                    <div key={day} className="flex flex-col gap-1">
                        {hours.map(hour => {
                            const count = data[day]?.[hour] ?? 0;
                            const colorClass = getColorForValue(count, maxCount);
                            return (
                                <div key={`${day}-${hour}`} className={`flex-1 rounded-md ${colorClass} transition-colors group relative`}>
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                        {count} viajes
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};
