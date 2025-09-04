import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { WeeklyTrendData } from '../types';

export const WeeklyTrendChart: React.FC<{ data: WeeklyTrendData[] }> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-gray-500 text-center py-8">No hay datos de tendencias para mostrar.</p>;
    }
    
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="semana" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }}
                    cursor={{ stroke: '#DD6B20', strokeWidth: 1 }}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}}/>
                <Line type="monotone" dataKey="tickets" name="Tickets Vendidos" stroke="#DD6B20" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="validaciones" name="Viajes Realizados" stroke="#38B2AC" />
            </LineChart>
        </ResponsiveContainer>
    );
};
