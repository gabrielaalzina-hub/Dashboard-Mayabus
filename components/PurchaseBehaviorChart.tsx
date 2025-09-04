import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PurchaseBehaviorData } from '../types';

export const PurchaseBehaviorChart: React.FC<{ data: PurchaseBehaviorData[] }> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-gray-500 text-center py-8">No hay datos de compras para mostrar.</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis type="number" stroke="#A0AEC0" />
                <YAxis type="category" dataKey="tipoPase" stroke="#A0AEC0" width={120} dx={-5} tick={{ fontSize: 12 }} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }}
                    cursor={{ fill: 'rgba(221, 107, 32, 0.1)' }}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}}/>
                <Bar dataKey="cantidad" name="Cantidad Vendida" fill="#DD6B20" />
            </BarChart>
        </ResponsiveContainer>
    );
};
