import React from 'react';
import type { Filters, FilterOptions } from '../types';

interface FilterBarProps {
    filters: Filters;
    availableFilters: FilterOptions;
    onFilterChange: (newFilters: Filters) => void;
}

type FilterKey = keyof Filters;

const FilterSelect: React.FC<{
    label: string;
    filterKey: FilterKey;
    options: string[];
    value: string;
    onChange: (key: FilterKey, value: string) => void;
}> = ({ label, filterKey, options, value, onChange }) => (
    <div>
        <label htmlFor={label} className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <select
            id={label}
            value={value}
            onChange={(e) => onChange(filterKey, e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 focus:ring-orange-500 focus:border-orange-500"
        >
            <option value="all">Todos</option>
            {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
    </div>
);


export const FilterBar: React.FC<FilterBarProps> = ({ filters, availableFilters, onFilterChange }) => {
    
    const handleFilterChange = (key: FilterKey, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FilterSelect 
                    label="Año" 
                    filterKey="year" 
                    options={availableFilters.years}
                    value={filters.year}
                    onChange={handleFilterChange}
                />
                <FilterSelect 
                    label="Mes" 
                    filterKey="month" 
                    options={availableFilters.months}
                    value={filters.month}
                    onChange={handleFilterChange}
                />
                <FilterSelect 
                    label="Tipo de Usuario" 
                    filterKey="userType" 
                    options={availableFilters.userTypes}
                    value={filters.userType}
                    onChange={handleFilterChange}
                />
            </div>
        </div>
    );
};
