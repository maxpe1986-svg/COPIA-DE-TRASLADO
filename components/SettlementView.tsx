

import React, { useState, useMemo } from 'react';
import type { Transfer, Driver, Company, SettlementRow } from '../types';
import { Printer } from 'lucide-react';

interface SettlementViewProps {
    transfers: Transfer[];
    drivers: Driver[];
    companies: Company[];
}

export const SettlementView: React.FC<SettlementViewProps> = ({ transfers, drivers, companies }) => {
    const [settlementType, setSettlementType] = useState<'company' | 'driver'>('company');
    const [selectedId, setSelectedId] = useState<string>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const companySettlementData = useMemo<SettlementRow[]>(() => {
        if (settlementType !== 'company' || !selectedId || !startDate || !endDate) return [];
        
        const company = companies.find(c => c.id === selectedId);
        if (!company) return [];

        const filteredTransfers = transfers.filter(t => 
            t.companyId === selectedId &&
            t.status === 'Realizado' &&
            new Date(t.date) >= new Date(startDate) &&
            new Date(t.date) <= new Date(endDate)
        );

        const rows: SettlementRow[] = [];
        filteredTransfers.forEach(t => {
            const km = t.km || 0;
            const isUrban = km <= 50; // Example threshold for urban vs interurban
            const urbanAmount = isUrban ? company.fixedRate : 0;
            const interurbanAmount = !isUrban ? km * company.costPerKm : 0;
            const waitingAmount = t.waiting ? company.waitingHourCost : 0; // Assuming 1 hour wait for simplicity
            const total = urbanAmount + interurbanAmount + waitingAmount;

            if (t.tripType === 'IDA Y VUELTA') {
                rows.push({
                    date: t.date,
                    transferNumber: t.transferNumber,
                    claimNumber: t.claimNumber,
                    patientName: t.patientName,
                    origin: `${t.originAddress}, ${t.originCity}`,
                    destination: `${t.destinationAddress}, ${t.destinationCity}`,
                    km: km,
                    urbanAmount: urbanAmount / 2,
                    interurbanAmount: interurbanAmount / 2,
                    waitingAmount: waitingAmount,
                    miscExpenses: 0,
                    totalAmount: total / 2,
                    tripPart: 'A'
                });
                rows.push({
                    date: t.date,
                    transferNumber: t.transferNumber,
                    claimNumber: t.claimNumber,
                    patientName: t.patientName,
                    origin: `${t.destinationAddress}, ${t.destinationCity}`,
                    destination: `${t.originAddress}, ${t.originCity}`,
                    km: km,
                    urbanAmount: urbanAmount / 2,
                    interurbanAmount: interurbanAmount / 2,
                    waitingAmount: 0, // Waiting cost only on first leg
                    miscExpenses: 0,
                    totalAmount: total / 2,
                    tripPart: 'B'
                });
            } else {
                 rows.push({
                    date: t.date,
                    transferNumber: t.transferNumber,
                    claimNumber: t.claimNumber,
                    patientName: t.patientName,
                    origin: `${t.originAddress}, ${t.originCity}`,
                    destination: `${t.destinationAddress}, ${t.destinationCity}`,
                    km: km,
                    urbanAmount,
                    interurbanAmount,
                    waitingAmount,
                    miscExpenses: 0,
                    totalAmount: total
                });
            }
        });
        return rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [transfers, companies, settlementType, selectedId, startDate, endDate]);

    const totalAmount = useMemo(() => {
        return companySettlementData.reduce((sum, row) => sum + row.totalAmount, 0);
    }, [companySettlementData]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b space-y-4">
                <h2 className="text-xl font-bold text-gray-700">Generar Liquidación</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select value={settlementType} onChange={e => { setSettlementType(e.target.value as 'company' | 'driver'); setSelectedId(''); }} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value="company">Empresa</option>
                            <option value="driver">Chofer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{settlementType === 'company' ? 'Empresa' : 'Chofer'}</label>
                        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value="">Seleccionar...</option>
                            {(settlementType === 'company' ? companies : drivers).map(item => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                </div>
            </div>

            {settlementType === 'driver' && <p className="p-4 text-center text-gray-500">La liquidación de choferes está en desarrollo.</p>}
            
            {settlementType === 'company' && selectedId && startDate && endDate && (
                 <div id="settlement-content">
                    <div className="p-4 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold">Liquidación para: {companies.find(c => c.id === selectedId)?.name}</h3>
                            {/* FIX: Corrected typo from toLocaleDateDateString to toLocaleDateString */}
                            <p className="text-sm text-gray-600">Período: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</p>
                        </div>
                        <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition duration-300 print:hidden">
                            <Printer size={20} />
                            Imprimir
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-600">
                             <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                                <tr>
                                    <th className="p-3">Fecha</th>
                                    <th className="p-3">Paciente</th>
                                    <th className="p-3">Origen</th>
                                    <th className="p-3">Destino</th>
                                    <th className="p-3 text-right">KM</th>
                                    <th className="p-3 text-right">Imp. Urbano</th>
                                    <th className="p-3 text-right">Imp. Interurbano</th>
                                    <th className="p-3 text-right">Imp. Espera</th>
                                    <th className="p-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companySettlementData.map((row, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="p-2 text-sm">{new Date(row.date).toLocaleDateString()} {row.tripPart && <span className="font-bold">({row.tripPart})</span>}</td>
                                        <td className="p-2 text-sm font-medium">{row.patientName}</td>
                                        <td className="p-2 text-sm">{row.origin}</td>
                                        <td className="p-2 text-sm">{row.destination}</td>
                                        <td className="p-2 text-sm text-right">{row.km.toFixed(1)}</td>
                                        <td className="p-2 text-sm text-right">{row.urbanAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                                        <td className="p-2 text-sm text-right">{row.interurbanAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                                        <td className="p-2 text-sm text-right">{row.waitingAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                                        <td className="p-2 text-sm text-right font-bold">{row.totalAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-100 font-bold">
                                    <td colSpan={8} className="p-3 text-right text-lg">TOTAL GENERAL:</td>
                                    <td className="p-3 text-right text-lg">{totalAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                 </div>
            )}

            {settlementType === 'company' && companySettlementData.length === 0 && selectedId && startDate && endDate && (
                <p className="p-4 text-center text-gray-500">No se encontraron traslados para los criterios seleccionados.</p>
            )}
        </div>
    );
};