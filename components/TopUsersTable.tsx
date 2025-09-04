import React from 'react';
import type { TopUserData } from '../types';

export const TopUsersTable: React.FC<{ data: TopUserData[] }> = ({ data }) => {
    
    if (!data || data.length === 0) {
        return <p className="text-gray-500 text-center py-8">No hay datos de usuarios para mostrar.</p>;
    }

    return (
        <div className="overflow-x-auto h-80">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-700/50 text-gray-300 uppercase sticky top-0">
                    <tr>
                        <th className="p-3">Usuario</th>
                        <th className="p-3 text-right">Tickets</th>
                        <th className="p-3 text-right">Viajes</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {data.map((item) => (
                        <tr key={item.usuario} className="hover:bg-gray-700/40">
                            <td className="p-3 font-medium truncate" title={item.usuario}>{item.usuario}</td>
                            <td className="p-3 text-right">{item.tickets.toLocaleString()}</td>
                            <td className="p-3 text-right">{item.validaciones.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
