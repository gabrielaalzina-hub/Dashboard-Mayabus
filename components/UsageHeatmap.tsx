import React from 'react';
import type { HeatmapData } from '../types';

interface HeatmapProps {
    data: HeatmapData;
    selectedRoute: string;
}

const getColorForValue = (value: number, maxValue: number) => {
    if (value === 0) return 'bg-gray-700/30';
    if (maxValue <= 0) return 'bg-orange-900';
    const intensity = Math.min(value / maxValue, 1.0);
    
    if (intensity < 0.01) return 'bg-orange-900/50';
    if (intensity < 0.2) return 'bg-orange-800';
    if (intensity < 0.4) return 'bg-orange-700';
    if (intensity < 0.6) return 'bg-orange-600';
    if (intensity < 0.8) return 'bg-orange-500';
    return 'bg-orange-400';
};

const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);

export const UsageHeatmap: React.FC<HeatmapProps> = ({ data, selectedRoute }) => {
    if (Object.keys(data).length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No hay datos para la gráfica de calor.</div>
    }

    const routesToDisplay = selectedRoute === 'all'
        ? Object.keys(data).sort()
        : [selectedRoute];

    const availableRoutes = routesToDisplay.filter(r => data[r]);

    if (availableRoutes.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No hay datos para la ruta seleccionada.</div>;
    }
    
    const maxCount = Math.max(
        ...availableRoutes.flatMap(route =>
            data[route] ? Object.values(data[route]) : [0]
        ),
        1
    );

    return (
        <div className="overflow-auto h-96 w-full relative">
            <div 
                className="grid gap-1 p-1"
                style={{
                    gridTemplateColumns: `minmax(150px, max-content) repeat(31, minmax(32px, 1fr))`,
                    width: 'max-content',
                    minWidth: '100%',
                }}
            >
                {/* Header Row: corner and days */}
                <div className="sticky top-0 left-0 bg-gray-800 z-20 font-bold text-gray-400 text-xs p-2 text-right">Ruta / Día</div>
                {daysOfMonth.map(day => (
                    <div key={day} className="sticky top-0 bg-gray-800 z-10 font-bold text-gray-300 text-sm flex items-center justify-center h-8">
                        {day}
                    </div>
                ))}

                {/* Data Rows: route label and cells */}
                {availableRoutes.map(route => (
                    <React.Fragment key={route}>
                        <div
                            className="sticky left-0 bg-gray-800 font-bold text-gray-300 text-xs p-2 text-right truncate flex items-center justify-end"
                            title={route}
                        >
                            {route}
                        </div>
                        {daysOfMonth.map(day => {
                            const count = data[route]?.[day] ?? 0;
                            const colorClass = getColorForValue(count, maxCount);
                            return (
                                <div key={`${route}-${day}`} className={`w-full aspect-square rounded-md ${colorClass} transition-colors group relative`}>
                                     <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                        Ruta: {route}<br/>
                                        Día: {day}<br/>
                                        Viajes: {count}
                                    </div>
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};