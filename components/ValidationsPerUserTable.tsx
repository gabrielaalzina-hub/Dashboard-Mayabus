import React, { useState } from 'react';
import type { ValidationsPerUserData } from '../types';

const ITEMS_PER_PAGE = 5;

export const ValidationsPerUserTable: React.FC<{ data: ValidationsPerUserData[] }> = ({ data }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const paginatedData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    if (!data || data.length === 0) {
        return <p className="text-gray-500 text-center py-8">No hay datos de validaciones para mostrar.</p>;
    }
    
    return (
        <div>
            <div className="overflow-x-auto h-64">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-700/50 text-gray-300 uppercase sticky top-0">
                        <tr>
                            <th className="p-3">Usuario</th>
                            <th className="p-3 text-right"># Validaciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {paginatedData.map((item) => (
                            <tr key={item.usuario} className="hover:bg-gray-700/40">
                                <td className="p-3 font-medium truncate" title={item.usuario}>{item.usuario}</td>
                                <td className="p-3 text-right">{item.validaciones.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 text-sm">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-700 rounded-md disabled:opacity-50 hover:bg-orange-600"
                    >
                        Anterior
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-700 rounded-md disabled:opacity-50 hover:bg-orange-600"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};
