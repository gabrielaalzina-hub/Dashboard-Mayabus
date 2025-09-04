import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { LoyaltyData } from '../types';

interface LoyaltyChartProps {
    data: {
        series: LoyaltyData[];
        userKeys: string[];
    }
}

const COLORS = ["#DD6B20", "#38B2AC", "#D69E2E", "#805AD5", "#3182CE"];

export const UserLoyaltyChart: React.FC<LoyaltyChartProps> = ({ data }) => {
    const { series, userKeys } = data;

    if (!series || series.length === 0) {
        return <p className="text-gray-500 text-center py-8 h-80 flex items-center justify-center">No hay datos de fidelidad para mostrar.</p>;
    }
    
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart
                data={series}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis 
                    dataKey="date" 
                    stroke="#A0AEC0" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(tick) => tick.substring(5)} // Show MM-DD
                />
                <YAxis stroke="#A0AEC0" />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }}
                    cursor={{ stroke: '#DD6B20', strokeWidth: 1 }}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}}/>
                {userKeys.map((user, index) => (
                    <Line 
                        key={user}
                        type="monotone" 
                        dataKey={user} 
                        name={user}
                        stroke={COLORS[index % COLORS.length]} 
                        dot={false}
                        activeDot={{ r: 6 }} 
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};
