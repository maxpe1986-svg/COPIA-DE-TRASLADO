import React, { useState, useEffect, useCallback } from 'react';
import type { Transfer, Driver, Company } from '../types';
import { getDrivingDistance } from '../services/geminiService';
import { X, Save, Bot } from 'lucide-react';

interface TransferFormProps {
    onClose: () => void;
    onSave: (transfer: Transfer) => void;
    transfer: Transfer | null;
    drivers: Driver[];
    companies: Company[];
}

const InputField: React.FC<{ name: string, label: string, type?: string, required?: boolean, value: string | number | boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ name, label, type = 'text', required = false, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            id={name}
            name={name}
            type={type}
            required={required}
            value={value as string}
            onChange={onChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
    </div>
);

export const TransferForm: React.FC<TransferFormProps> = ({ onClose, onSave, transfer, drivers, companies }) => {
    const [formData, setFormData] = useState<Omit<Transfer, 'id'>>({
        internalId: '',
        transferNumber: '',
        claimNumber: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        patientName: '',
        patientPhone: '',
        driverId: '',
        companyId: '',
        art: '',
        tripType: 'IDA Y VUELTA',
        originCity: '',
        originAddress: '',
        destinationCity: '',
        destinationAddress: '',
        notes: '',
        waiting: false,
        status: 'Realizado',
        km: 0,
        ...transfer,
    });
    const [isCalculating, setIsCalculating] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
        setFormData(prev => ({ ...prev, [name]: checked !== undefined ? checked : value }));
    };

    const handleCalculateDistance = useCallback(async () => {
        if (!formData.originAddress || !formData.originCity || !formData.destinationAddress || !formData.destinationCity) {
            alert('Por favor, complete las direcciones de origen y destino para calcular la distancia.');
            return;
        }
        setIsCalculating(true);
        const origin = `${formData.originAddress}, ${formData.originCity}`;
        const destination = `${formData.destinationAddress}, ${formData.destinationCity}`;
        const distance = await getDrivingDistance(origin, destination);
        if (distance !== null) {
            setFormData(prev => ({ ...prev, km: Math.round(distance) }));
        } else {
            alert('No se pudo calcular la distancia. Por favor, ingrésela manualmente.');
        }
        setIsCalculating(false);
    }, [formData.originAddress, formData.originCity, formData.destinationAddress, formData.destinationCity]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: transfer?.id || `trans_${new Date().getTime()}` });
    };
    
    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-gray-50">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">{transfer ? 'Editar' : 'Nuevo'} Traslado</h2>
                <button type="button" onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200">
                    <X size={24} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField name="date" label="Fecha" type="date" required value={formData.date} onChange={handleChange} />
                <InputField name="time" label="Hora" type="time" required value={formData.time} onChange={handleChange} />
                <InputField name="patientName" label="Paciente" required value={formData.patientName} onChange={handleChange} />
                <InputField name="patientPhone" label="Celular Paciente" value={formData.patientPhone} onChange={handleChange} />
                <InputField name="transferNumber" label="N° Traslado" value={formData.transferNumber} onChange={handleChange} />
                <InputField name="claimNumber" label="N° Siniestro" value={formData.claimNumber} onChange={handleChange} />
                <InputField name="internalId" label="ID Interno" value={formData.internalId} onChange={handleChange} />
                <InputField name="art" label="ART" value={formData.art} onChange={handleChange} />
                
                <div>
                    <label htmlFor="driverId" className="block text-sm font-medium text-gray-700">Chofer</label>
                    <select id="driverId" name="driverId" value={formData.driverId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option value="">Seleccionar chofer</option>
                        {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">Empresa</label>
                    <select id="companyId" name="companyId" value={formData.companyId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option value="">Seleccionar empresa</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="tripType" className="block text-sm font-medium text-gray-700">Tipo de Viaje</label>
                    <select id="tripType" name="tripType" value={formData.tripType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option>IDA Y VUELTA</option>
                        <option>IDA</option>
                        <option>IDA MULTIPLE</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option>Realizado</option>
                        <option>Anulado</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                 <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Origen</h3>
                    <InputField name="originAddress" label="Dirección de Origen" required value={formData.originAddress} onChange={handleChange} />
                    <InputField name="originCity" label="Localidad de Origen" required value={formData.originCity} onChange={handleChange} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Destino</h3>
                    <InputField name="destinationAddress" label="Dirección de Destino" required value={formData.destinationAddress} onChange={handleChange} />
                    <InputField name="destinationCity" label="Localidad de Destino" required value={formData.destinationCity} onChange={handleChange} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <InputField name="km" label="Cantidad de KM" type="number" value={formData.km || 0} onChange={handleChange} />
                <button type="button" onClick={handleCalculateDistance} disabled={isCalculating} className="flex items-center justify-center gap-2 h-10 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-300">
                    {isCalculating ? (
                        <>
                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         Calculando...
                        </>
                    ) : (
                        <>
                        <Bot size={18} />
                        Calcular Distancia (IA)
                        </>
                    )}
                </button>
                 <div className="flex items-center">
                    <input id="waiting" name="waiting" type="checkbox" checked={formData.waiting} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <label htmlFor="waiting" className="ml-2 block text-sm text-gray-900">Hubo Espera</label>
                </div>
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Observaciones</label>
                <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
            </div>
            
            <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Cancelar</button>
                <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-300">
                    <Save size={18} />
                    Guardar
                </button>
            </div>
        </form>
    );
};