import React, { useState } from 'react';
import type { Driver } from '../types';
import { X, Save } from 'lucide-react';

interface DriverFormProps {
    onClose: () => void;
    onSave: (driver: Driver) => void;
    driver: Driver | null;
}

const InputField: React.FC<{ name: string, label: string, type?: string, required?: boolean, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ name, label, type = 'text', required = false, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            id={name}
            name={name}
            type={type}
            required={required}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
    </div>
);

export const DriverForm: React.FC<DriverFormProps> = ({ onClose, onSave, driver }) => {
    const [formData, setFormData] = useState<Omit<Driver, 'id'>>({
        name: '',
        dni: '',
        phone: '',
        email: '',
        licenseExpiry: '',
        costPerKm: 0,
        fixedRate: 0,
        waitingHourCost: 0,
        ...driver,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: driver?.id || `driver_${new Date().getTime()}` });
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-gray-50">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">{driver ? 'Editar' : 'Nuevo'} Chofer</h2>
                <button type="button" onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200">
                    <X size={24} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField name="name" label="Nombre Completo" required value={formData.name} onChange={handleChange} />
                <InputField name="dni" label="DNI" required value={formData.dni} onChange={handleChange} />
                <InputField name="phone" label="Celular" value={formData.phone} onChange={handleChange} />
                <InputField name="email" label="Email" type="email" value={formData.email} onChange={handleChange} />
                <InputField name="licenseExpiry" label="Vencimiento Registro" type="date" required value={formData.licenseExpiry} onChange={handleChange} />
            </div>

             <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Tarifas del Chofer</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField name="costPerKm" label="Costo por Km ($)" type="number" value={formData.costPerKm} onChange={handleChange} />
                    <InputField name="fixedRate" label="Costo por Tramo ($)" type="number" value={formData.fixedRate} onChange={handleChange} />
                    <InputField name="waitingHourCost" label="Costo Hora Espera ($)" type="number" value={formData.waitingHourCost} onChange={handleChange} />
                </div>
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