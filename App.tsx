import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadIcon, TrashIcon, CheckCircleIcon, XCircleIcon, AlertTriangleIcon } from './components/icons';
import type { FileData, FileType, ProcessedData, FilterOptions, Filters } from './types';
import { processFiles } from './utils/dataProcessor';

import { FilterBar } from './components/FilterBar';
import { KpiCard } from './components/KpiCard';
import { UsageHeatmap } from './components/UsageHeatmap';
import { TopUsersTable } from './components/TopUsersTable';
import { UserLoyaltyChart } from './components/UserLoyaltyChart';

// Make SheetJS library available from window
declare const XLSX: any;

const App: React.FC = () => {
    const [fileData, setFileData] = useState<FileData>({
        tickets: null,
        servicios: null,
        validaciones: null,
    });

    const [fileNames, setFileNames] = useState({
        tickets: '',
        servicios: '',
        validaciones: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [filters, setFilters] = useState<Filters>({ year: 'all', month: 'all', userType: 'all' });
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({ years: [], months: [], userTypes: [] });
    const [selectedRoute, setSelectedRoute] = useState<string>('all');
    
    const fileInputRefs = {
        tickets: useRef<HTMLInputElement>(null),
        servicios: useRef<HTMLInputElement>(null),
        validaciones: useRef<HTMLInputElement>(null),
    };

    const resetMessages = () => {
        setError(null);
        setSuccess(null);
    }

    const handleFileUpload = useCallback((file: File, type: FileType) => {
        resetMessages();
        
        // Check if a file is being updated to provide a more specific message
        const isUpdating = fileNames[type] !== '';

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array', cellDates:true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { defval: null });

                setFileData(prev => ({ ...prev, [type]: json }));
                setFileNames(prev => ({ ...prev, [type]: file.name }));
                
                if (isUpdating) {
                    setSuccess(`Éxito: Archivo de ${type} actualizado a "${file.name}".`);
                } else {
                    setSuccess(`Éxito: Archivo "${file.name}" cargado correctamente.`);
                }

            } catch (err) {
                setError("Error al procesar el archivo. Asegúrate que el formato sea correcto.");
                console.error(err);
            }
        };
        reader.readAsArrayBuffer(file);
    }, [fileNames]);

    const createUploadHandler = (type: FileType) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileUpload(file, type);
        }
        if(event.target) {
            event.target.value = '';
        }
    };

    const triggerFileInput = (type: FileType) => {
        fileInputRefs[type].current?.click();
    };

    const clearFile = (type: FileType) => {
        resetMessages();
        setFileData(prev => ({ ...prev, [type]: null }));
        setFileNames(prev => ({ ...prev, [type]: '' }));
        setSuccess(`Archivo de ${type} ha sido removido.`);
    };

    const processedData: ProcessedData = useMemo(() => {
         return processFiles(fileData, filters);
    }, [fileData, filters]);
    
    useEffect(() => {
        setFilterOptions(processedData.filterOptions);
        // Reset route selection if it's no longer available
        if (!processedData.filterOptions.routes?.includes(selectedRoute)) {
            setSelectedRoute('all');
        }
    }, [processedData.filterOptions, selectedRoute]);


    const hasData = useMemo(() => {
        return Object.values(fileData).some(d => d !== null && d.length > 0)
    }, [fileData]);


    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8 font-sans">
            <Header />
            <main className="mt-8">
                {/* Upload and Message Section */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Actualizar Datos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {([
                            { type: 'tickets', label: 'Archivo Tickets' },
                            { type: 'servicios', label: 'Archivo Servicios' },
                            { type: 'validaciones', label: 'Archivo Validaciones' },
                        ] as { type: FileType; label: string }[]).map(({ type, label }) => (
                            <div key={type}>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    ref={fileInputRefs[type]}
                                    onChange={createUploadHandler(type)}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => triggerFileInput(type)}
                                    className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                                >
                                    <UploadIcon /> {label}
                                </button>
                                {fileNames[type] && (
                                    <div className="mt-2 text-sm text-center bg-gray-700/50 p-2 rounded-md flex justify-between items-center">
                                        <span className="truncate w-4/5" title={fileNames[type]}>{fileNames[type]}</span>
                                        <button onClick={() => clearFile(type)} className="text-red-400 hover:text-red-300">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                     {error && (
                        <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg flex items-center gap-3">
                            <XCircleIcon /> <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mt-4 p-3 bg-green-900/50 border border-green-700 text-green-300 rounded-lg flex items-center gap-3">
                            <CheckCircleIcon /> <span>{success}</span>
                        </div>
                    )}
                </div>

                {/* Dashboard Section */}
                {hasData ? (
                    <>
                        <FilterBar availableFilters={filterOptions} filters={filters} onFilterChange={setFilters} />
                        
                        {/* KPIs */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
                            {processedData.kpis.map(kpi => (
                                <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} description={kpi.description} />
                            ))}
                        </div>

                        {/* Charts */}
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="bg-gray-800 p-6 rounded-xl shadow-lg lg:col-span-2">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white">Gráfica de Calor de Uso</h3>
                                    <select
                                        value={selectedRoute}
                                        onChange={(e) => setSelectedRoute(e.target.value)}
                                        className="bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="all">Todas las Rutas</option>
                                        {processedData.filterOptions.routes?.map(route => (
                                            <option key={route} value={route}>{route}</option>
                                        ))}
                                    </select>
                                </div>
                                <UsageHeatmap data={processedData.heatmapData} selectedRoute={selectedRoute} />
                            </div>
                             <div className="bg-gray-800 p-6 rounded-xl shadow-lg lg:col-span-1">
                                 <h3 className="text-lg font-bold text-white mb-4">Top 10 Usuarios</h3>
                                 <TopUsersTable data={processedData.topUsers} />
                             </div>
                             <div className="bg-gray-800 p-6 rounded-xl shadow-lg lg:col-span-3">
                                 <h3 className="text-lg font-bold text-white mb-4">Fidelidad de Uso (Top 5 Usuarios)</h3>
                                 <UserLoyaltyChart data={processedData.loyaltyData} />
                             </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16 bg-gray-800 rounded-xl shadow-lg">
                        <AlertTriangleIcon />
                        <h3 className="mt-4 text-xl font-bold">Sin datos para mostrar</h3>
                        <p className="mt-2 text-gray-400">Por favor, carga los archivos de reportes para generar las visualizaciones.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;