
export enum View {
    Dashboard = "Dashboard",
    Transfers = "Traslados",
    Drivers = "Choferes",
    Companies = "Empresas",
    Settlements = "Liquidaciones",
}

export interface Company {
    id: string;
    name: string;
    cuit: string;
    email: string;
    contact: string;
    costPerKm: number;
    fixedRate: number; // Costo Tramo
    waitingHourCost: number;
}

export interface Driver {
    id: string;
    name: string;
    dni: string;
    phone: string;
    email: string;
    licenseExpiry: string; // YYYY-MM-DD
    costPerKm: number;
    fixedRate: number; // Costo Tramo
    waitingHourCost: number;
}

export interface Transfer {
    id: string;
    internalId: string;
    transferNumber: string;
    claimNumber: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    patientName: string;
    patientPhone: string;
    driverId: string;
    companyId: string;
    art: string;
    tripType: 'IDA' | 'IDA Y VUELTA' | 'IDA MULTIPLE';
    originCity: string;
    originAddress: string;
    destinationCity: string;
    destinationAddress: string;
    notes: string;
    waiting: boolean;
    status: 'Realizado' | 'Anulado';
    km?: number;
}

export interface SettlementRow {
    date: string;
    transferNumber: string;
    claimNumber: string;
    patientName: string;
    origin: string;
    destination: string;
    km: number;
    urbanAmount: number;
    interurbanAmount: number;
    waitingTime?: number; // in hours
    waitingAmount: number;
    miscExpenses: number;
    totalAmount: number;
    tripPart?: 'A' | 'B'; // For IDA Y VUELTA
}

export interface DriverSettlementRow {
    date: string;
    patientName: string;
    from: string;
    to: string;
    isOutbound: boolean;
    isReturn: boolean;
    waiting: boolean;
    expenses: number;
    art: string;
    total: number;
}