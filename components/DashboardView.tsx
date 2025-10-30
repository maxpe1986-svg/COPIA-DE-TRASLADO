import React from 'react';
// FIX: Changed 'import type' to a regular 'import' to make the View enum available at runtime.
import { Transfer, Driver, Company, View } from '../types';
import { Truck, Users, Building, CalendarClock, PlusCircle } from 'lucide-react';

interface DashboardViewProps {
    transfers: Transfer[];
    drivers: Driver[];
    companies: Company[];
    setView: (view: View) => void;
    handleOpenModal: (type: View, item?: any) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 transition-all hover:shadow-lg hover:scale-105">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

export const DashboardView: React.FC<DashboardViewProps> = ({ transfers, drivers, companies, setView, handleOpenModal }) => {
    
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const transfersToday = transfers.filter(t => t.date === today && t.status === 'Realizado').length;
    const transfersThisMonth = transfers.filter(t => t.date >= firstDayOfMonth && t.status === 'Realizado').length;
    const recentTransfers = [...transfers]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.time.localeCompare(a.time))
        .slice(0, 5);
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Bienvenido, Administrador</h1>
                <p className="text-gray-600 mt-1">Aquí tienes un resumen de la actividad reciente.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<CalendarClock size={24} className="text-white"/>} title="Traslados Hoy" value={transfersToday} color="bg-blue-500" />
                <StatCard icon={<Truck size={24} className="text-white"/>} title="Traslados (Mes)" value={transfersThisMonth} color="bg-green-500" />
                <StatCard icon={<Users size={24} className="text-white"/>} title="Choferes Activos" value={drivers.length} color="bg-yellow-500" />
                <StatCard icon={<Building size={24} className="text-white"/>} title="Empresas" value={companies.length} color="bg-indigo-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Traslados Recientes</h2>
                    <div className="space-y-4">
                        {recentTransfers.length > 0 ? recentTransfers.map(t => (
                             <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div>
                                    <p className="font-semibold text-gray-800">{t.patientName}</p>
                                    <p className="text-sm text-gray-500">{t.originCity} &rarr; {t.destinationCity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-700">{new Date(t.date).toLocaleDateString()}</p>
                                    <span className={`px-2 py-1 mt-1 inline-block text-xs font-semibold rounded-full ${t.status === 'Realizado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {t.status}
                                    </span>
                                </div>
                            </div>
                        )) : <p className="text-center text-gray-500 py-4">No hay traslados recientes.</p>}
                    </div>
                     <div className="mt-4 text-center">
                        <button onClick={() => setView(View.Transfers)} className="text-blue-600 font-semibold hover:underline">
                            Ver todos los traslados
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
                    <div className="space-y-4">
                        <button onClick={() => handleOpenModal(View.Transfers)} className="w-full flex items-center gap-3 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors">
                            <PlusCircle size={24}/>
                            <span className="font-semibold">Cargar Nuevo Traslado</span>
                        </button>
                        <button onClick={() => handleOpenModal(View.Drivers)} className="w-full flex items-center gap-3 p-4 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-700 transition-colors">
                            <PlusCircle size={24}/>
                            <span className="font-semibold">Agregar Chofer</span>
                        </button>
                        <button onClick={() => handleOpenModal(View.Companies)} className="w-full flex items-center gap-3 p-4 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors">
                            <PlusCircle size={24}/>
                            <span className="font-semibold">Agregar Empresa</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};