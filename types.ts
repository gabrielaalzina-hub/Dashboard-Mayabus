// Raw data types from files, made flexible for cleaning
export interface Validation {
  [key:string]: any;
}

export interface Ticket {
  [key: string]: any;
}

export interface Service {
  [key: string]: any;
}

export interface FileData {
    tickets: Ticket[] | null;
    servicios: Service[] | null;
    validaciones: Validation[] | null;
}

export type FileType = keyof FileData;


// --- Processed Data & Visualization Types ---

export interface Kpi {
  title: string;
  value: string;
  description: string;
}

export interface HeatmapData {
    // route -> dayOfMonth -> count
    [route: string]: {
        [day: number]: number;
    }
}

export interface TopUserData {
    usuario: string;
    tickets: number;
    validaciones: number;
}

export interface LoyaltyData {
    // date -> { user1: count, user2: count, ... }
    date: string;
    [user: string]: number | string;
}

// FIX: Added missing type definitions to resolve compilation errors.
export interface RoutePerformanceData {
  fecha: string;
  ruta: string;
  ticketsUtilizados: number;
  ocupacionPromedio: number;
}

export interface PurchaseBehaviorData {
  tipoPase: string;
  cantidad: number;
}

export interface ValidationsPerUserData {
  usuario: string;
  validaciones: number;
}

export interface WeeklyTrendData {
  semana: string;
  tickets: number;
  validaciones: number;
}

export interface ProcessedData {
    kpis: Kpi[];
    filterOptions: FilterOptions;
    heatmapData: HeatmapData;
    topUsers: TopUserData[];
    loyaltyData: {
        series: LoyaltyData[];
        userKeys: string[];
    };
}

// --- Filtering Types ---

export interface Filters {
    year: string | 'all';
    month: string | 'all';
    userType: string | 'all';
}

export interface FilterOptions {
    years: string[];
    months: string[];
    userTypes: string[];
    routes?: string[];
}