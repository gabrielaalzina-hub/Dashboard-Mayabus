import type { FileData, ProcessedData, Filters, Kpi, HeatmapData, TopUserData, LoyaltyData } from '../types';

// --- HELPER FUNCTIONS ---

const normalizeDate = (dateInput: any): string => {
    if (!dateInput) return '';
    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) {
             // Handle Excel's numeric date format if initial parsing fails
            if (typeof dateInput === 'number') {
                const excelDate = new Date(Math.round((dateInput - 25569) * 86400 * 1000));
                if (!isNaN(excelDate.getTime())) {
                    return excelDate.toISOString().split('T')[0];
                }
            }
            return '';
        };
        return date.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};

const capitalize = (s: string): string => {
    if (!s) return '';
    const str = String(s).trim().toLowerCase();
    if (str.length === 0) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const normalizeUserType = (type: any): string => {
    if (!type) return 'Desconocido';
    const lowerType = String(type).trim().toLowerCase();

    if (lowerType === 'alumno' || lowerType === 'estudiante') {
        return 'Estudiante';
    }
    if (lowerType === 'staff' || lowerType === 'colaborador') {
        return 'Colaborador';
    }
    // Fallback to capitalize existing values like 'Invitado'
    return capitalize(String(type));
};

const normalizeString = (value: any): string => {
    return value ? String(value).trim() : '';
};

const normalizeRow = (row: any, columnMap: Record<string, string>): any => {
    const newRow: Record<string, any> = {};
    for (const key in row) {
        const normalizedKey = key.trim().toLowerCase();
        const newKey = columnMap[normalizedKey] || normalizedKey;
        newRow[newKey] = row[key];
    }
    return newRow;
};

// --- MAIN PROCESSING FUNCTION ---

export const processFiles = (fileData: FileData, filters: Filters): ProcessedData => {
    const { tickets: rawTickets, servicios: rawServices, validaciones: rawValidations } = fileData;
    
    const defaultData: ProcessedData = {
        kpis: [],
        filterOptions: { years: [], months: [], userTypes: [], routes: [] },
        heatmapData: {},
        topUsers: [],
        loyaltyData: { series: [], userKeys: [] },
    };

    if (!rawTickets || !rawServices || !rawValidations) {
        return defaultData;
    }

    // --- 1. NORMALIZE & MERGE DATA ---
    const columnMap: Record<string, string> = {
        'id salida': 'id_salida',
        'usuario': 'usuario',
        'email de usuario': 'usuario',
        'tipo_usuario': 'tipo_usuario',
        'tipo de usuario': 'tipo_usuario',
        'fecha': 'fecha',
        'fecha de operación': 'fecha',
        'fecha inicio': 'fecha',
        'fecha término': 'fecha',
        'unnamed: 11': 'tipo_pase',
        'tipo de pase': 'tipo_pase',
        'ruta': 'ruta',
        'descripción de ruta': 'ruta',
        'validado': 'validado',
    };

    // Create a user type map from Validations as the source of truth
    const userTypeMap = new Map<string, string>();
    rawValidations.forEach(v => {
        const normalizedRow = normalizeRow(v, columnMap);
        const user = normalizeString(normalizedRow.usuario);
        const userType = normalizeUserType(normalizedRow.tipo_usuario);
        if (user && userType !== 'Desconocido') {
            userTypeMap.set(user, userType);
        }
    });
    
    // Enrich tickets with the derived user type from the validations map
    const tickets = rawTickets.map(row => {
        const normalized = normalizeRow(row, columnMap);
        const user = normalizeString(normalized.usuario);
        // Prioritize user type from validations map, fallback to ticket's own type
        const derivedUserType = userTypeMap.get(user) || normalizeUserType(normalized.tipo_usuario);
        return {
            ...normalized,
            tipo_usuario: derivedUserType, // Overwrite for consistent use downstream
        };
    });

    const services = rawServices.map(row => normalizeRow(row, columnMap));
    const validations = rawValidations.map(row => normalizeRow(row, columnMap));

    // Create a map for services for efficient lookup
    const serviceMap = new Map(services.map(s => [s.id_salida, s]));

    // Join validations with services
    const mergedData = validations.map(v => {
        const service = serviceMap.get(v.id_salida);
        const date = normalizeDate(v.fecha || service?.fecha);
        return {
            ...v,
            ...service,
            fecha: date,
            usuario: normalizeString(v.usuario),
            tipo_usuario: normalizeUserType(v.tipo_usuario || 'Desconocido'),
            ruta: normalizeString(v.ruta || service?.ruta || 'Desconocida'),
        };
    }).filter(item => item.fecha && item.usuario);

    // Filter for successful validations only
    const successfulValidations = mergedData.filter(v => {
        // If 'validado' column exists, check for 'si'. Otherwise, assume it's valid for backwards compatibility.
        return v.validado !== undefined ? normalizeString(v.validado).toLowerCase() === 'si' : true;
    });

    // --- 2. EXTRACT FILTER OPTIONS (from successful data) ---
    const years = new Set<string>();
    const months = new Set<string>();
    const userTypes = new Set<string>();
    const routes = new Set<string>();
    
    successfulValidations.forEach(item => {
        const [year, month] = item.fecha.split('-');
        years.add(year);
        months.add(month);
        userTypes.add(item.tipo_usuario);
        if(item.ruta !== 'Desconocida') routes.add(item.ruta);
    });

    const filterOptions = {
        years: [...years].sort(),
        months: [...months].sort(),
        userTypes: [...userTypes].sort(),
        routes: [...routes].sort()
    };
    
    // --- 3. APPLY FILTERS ---
    const filteredValidations = successfulValidations.filter(item => {
        const [year, month] = item.fecha.split('-');
        return (filters.year === 'all' || year === filters.year) &&
               (filters.month === 'all' || month === filters.month) &&
               (filters.userType === 'all' || item.tipo_usuario === filters.userType);
    });

    // Also filter tickets for KPI calculations
    const filteredTickets = tickets.filter(t => {
       const date = normalizeDate(t.fecha);
       if (!date) return false;
       const [year, month] = date.split('-');
       const userType = t.tipo_usuario; // This is now the derived user type
       return (filters.year === 'all' || year === filters.year) &&
              (filters.month === 'all' || month === filters.month) &&
              (filters.userType === 'all' || userType === filters.userType);
    });

    // --- 4. CALCULATE KPIs ---
    const kpis: Kpi[] = [];
    const passTypes = [
        { key: 'Pase semestral', title: 'Pases Semestrales' },
        { key: 'Pase semanal', title: 'Pases Semanales' },
        { key: 'Pase redondo', title: 'Pases Redondos' },
        { key: 'Pase de verano', title: 'Pases de Verano' },
        { key: 'Pase mensual colaboradores', title: 'Pases Mensual Colab.' },
        { key: 'Pases especiales', title: 'Pases Especiales' },
    ];
    
    kpis.push({ title: "Tickets Totales", value: filteredTickets.length.toLocaleString(), description: "Total de tickets vendidos" });
    
    const students = filteredTickets.filter(t => t.tipo_usuario === 'Estudiante').length;
    kpis.push({ title: "Estudiantes", value: students.toLocaleString(), description: "Tickets de estudiantes" });
    
    const collaborators = filteredTickets.filter(t => t.tipo_usuario === 'Colaborador').length;
    kpis.push({ title: "Colaboradores", value: collaborators.toLocaleString(), description: "Tickets de colaboradores" });

    passTypes.forEach(pass => {
        const count = filteredTickets.filter(t => t.tipo_pase === pass.key).length;
        kpis.push({ title: pass.title, value: count.toLocaleString(), description: `Total de ${pass.key}` });
    });

    const validatedCount = filteredValidations.length;
    const efficiency = filteredTickets.length > 0 ? (validatedCount / filteredTickets.length) * 100 : 0;
    kpis.push({ title: 'Eficiencia de Uso', value: `${efficiency.toFixed(1)}%`, description: 'Tickets validados vs. vendidos' });
    
    // New user calculation (based on all successful validations over time)
    const userFirstValidation: Record<string, string> = {};
    successfulValidations.forEach(v => {
        if (!userFirstValidation[v.usuario] || v.fecha < userFirstValidation[v.usuario]) {
            userFirstValidation[v.usuario] = v.fecha;
        }
    });

    const uniqueUsersInPeriod = new Set(filteredValidations.map(v => v.usuario));
    let newUsers = 0;
    uniqueUsersInPeriod.forEach(user => {
        const firstDate = userFirstValidation[user];
        if (firstDate) {
             const [year, month] = firstDate.split('-');
             if ((filters.year === 'all' || year === filters.year) && (filters.month === 'all' || month === filters.month)) {
                 newUsers++;
             }
        }
    });
    const newUserRate = uniqueUsersInPeriod.size > 0 ? (newUsers / uniqueUsersInPeriod.size) * 100 : 0;
    kpis.push({ title: 'Nuevos Usuarios', value: `${newUserRate.toFixed(1)}%`, description: 'Usuarios validando por 1ra vez' });


    // --- 5. GENERATE VISUALIZATION DATA ---

    // Heatmap: Route vs. Day of Month
    const heatmapData: HeatmapData = {};
    filteredValidations.forEach(v => {
        const date = new Date(v.fecha + 'T12:00:00Z'); // Use noon to avoid timezone issues
        const dayOfMonth = date.getUTCDate();
        if (v.ruta && v.ruta !== 'Desconocida') {
            if (!heatmapData[v.ruta]) heatmapData[v.ruta] = {};
            heatmapData[v.ruta][dayOfMonth] = (heatmapData[v.ruta][dayOfMonth] || 0) + 1;
        }
    });

    // Top Users
    const userCounts: Record<string, { tickets: number, validaciones: number }> = {};
    filteredTickets.forEach(t => {
        const user = normalizeString(t.usuario);
        if (!user) return;
        if (!userCounts[user]) userCounts[user] = { tickets: 0, validaciones: 0 };
        userCounts[user].tickets++;
    });
    filteredValidations.forEach(v => {
        const user = v.usuario;
        if (!user) return;
        if (!userCounts[user]) userCounts[user] = { tickets: 0, validaciones: 0 };
        userCounts[user].validaciones++;
    });

    const topUsers = Object.entries(userCounts).map(([usuario, counts]) => ({
        usuario,
        ...counts
    }))
    .sort((a, b) => (b.validaciones + b.tickets) - (a.validaciones + a.tickets))
    .slice(0, 10);

    // Loyalty Data
    const loyaltyUsers = topUsers.slice(0, 5).map(u => u.usuario);
    const loyaltyMap: Record<string, Record<string, number>> = {};
    
    filteredValidations.forEach(v => {
        if (loyaltyUsers.includes(v.usuario)) {
            const date = v.fecha;
            if (!loyaltyMap[date]) loyaltyMap[date] = {};
            loyaltyMap[date][v.usuario] = (loyaltyMap[date][v.usuario] || 0) + 1;
        }
    });

    const loyaltyDataSeries = Object.entries(loyaltyMap)
        .map(([date, users]) => ({ date, ...users }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
        kpis,
        filterOptions,
        heatmapData,
        topUsers,
        loyaltyData: {
            series: loyaltyDataSeries,
            userKeys: loyaltyUsers,
        }
    };
};