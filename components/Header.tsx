
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="flex items-center justify-between pb-4 border-b border-gray-700">
            <div className="flex items-center gap-4">
                {/* Placeholder for the logo, styled to be easily replaceable */}
                <div className="flex items-center font-black tracking-wider text-2xl">
                    <span className="text-orange-500">ANÁHUAC</span>
                    <span className="text-gray-200 ml-2">MAYAB</span>
                    <span className="text-gray-400 font-light text-xl ml-2">| 40</span>
                </div>
            </div>
            <h1 className="hidden sm:block text-2xl font-bold text-gray-300">
                Dashboard de Reportes Mayabus
            </h1>
        </header>
    );
};
