import React, { useState, useEffect } from 'react';
import { Transfer, Driver, Company, View } from './types';
import { Truck, Users, Building, FileText, PlusCircle, UploadCloud, LayoutDashboard, Pencil, Trash2, Download } from 'lucide-react';
import { TransferForm } from './components/TransferForm';
import { DriverForm } from './components/DriverForm';
import { CompanyForm } from './components/CompanyForm';
import { SettlementView } from './components/SettlementView';
import { BulkUploadModal } from './components/BulkUploadModal';
import { DashboardView } from './components/DashboardView';

// Mock Data for initial state (retained for reference but no longer used for initialization)
const initialCompanies: Company[] = [
    { id: 'comp1', name: 'FELEVAL SRL', cuit: '30-11223344-5', email: 'contacto@feleval.com', contact: 'Juan Perez', costPerKm: 150, fixedRate: 5000, waitingHourCost: 1000 },
    { id: 'comp2', name: 'Ambulancias del Sur', cuit: '30-55667788-9', email: 'admin@adelsur.com', contact: 'Maria Gomez', costPerKm: 160, fixedRate: 5500, waitingHourCost: 1200 },
];

const initialDrivers: Driver[] = [
    { id: 'driv1', name: 'Carlos Rodriguez', dni: '25123456', phone: '1155667788', email: 'c.rodriguez@email.com', licenseExpiry: '2025-12-31', costPerKm: 100, fixedRate: 3000, waitingHourCost: 800 },
    { id: 'driv2', name: 'Lucia Fernandez', dni: '32987654', phone: '1133445566', email: 'l.fernandez@email.com', licenseExpiry: '2026-06-15', costPerKm: 110, fixedRate: 3200, waitingHourCost: 850 },
];

const initialTransfers: Transfer[] = [
    { id: 'trans1', internalId: 'INT001', transferNumber: 'TRN001', claimNumber: 'SIN001', date: '2024-07-20', time: '10:00', patientName: 'Ana Martinez', patientPhone: '1122334455', driverId: 'driv1', companyId: 'comp1', art: 'Prevencion ART', tripType: 'IDA Y VUELTA', originCity: 'Buenos Aires', originAddress: 'Av. Corrientes 1234', destinationCity: 'La Plata', destinationAddress: 'Calle 7 567', notes: 'Paciente estable', waiting: true, status: 'Realizado', km: 60 },
    { id: 'trans2', internalId: 'INT002', transferNumber: 'TRN002', claimNumber: 'SIN002', date: '2024-07-21', time: '14:30', patientName: 'Roberto Sanchez', patientPhone: '1166778899', driverId: 'driv2', companyId: 'comp2', art: 'Galeno ART', tripType: 'IDA', originCity: 'Quilmes', originAddress: 'Rivadavia 456', destinationCity: 'Avellaneda', destinationAddress: 'Av. Mitre 2000', notes: '', waiting: false, status: 'Realizado', km: 15 },
    { id: 'trans3', internalId: 'INT003', transferNumber: 'TRN003', claimNumber: 'SIN003', date: '2024-07-22', time: '09:00', patientName: 'Marta Diaz', patientPhone: '1199887766', driverId: 'driv1', companyId: 'comp1', art: 'Sancor Seguros', tripType: 'IDA', originCity: 'Lomas de Zamora', originAddress: 'Hipolito Yrigoyen 8000', destinationCity: 'Banfield', destinationAddress: 'Maipu 200', notes: 'Turno cancelado por paciente', waiting: false, status: 'Anulado', km: 5 },
];

type UserRole = 'admin' | 'coordinator';

const App: React.FC = () => {
    const [view, setView] = useState<View>(View.Dashboard);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Transfer | Driver | Company | null>(null);
    const [modalType, setModalType] = useState<View | null>(null);
    const [userRole, setUserRole] = useState<UserRole>('admin');

    const [transfers, setTransfers] = useState<Transfer[]>(() => {
        try {
            const stored = localStorage.getItem('transfers');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error("Failed to parse transfers from localStorage", error);
            return [];
        }
    });
    const [drivers, setDrivers] = useState<Driver[]>(() => {
        try {
            const stored = localStorage.getItem('drivers');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error("Failed to parse drivers from localStorage", error);
            return [];
        }
    });
    const [companies, setCompanies] = useState<Company[]>(() => {
        try {
            const stored = localStorage.getItem('companies');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error("Failed to parse companies from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('transfers', JSON.stringify(transfers));
    }, [transfers]);

    useEffect(() => {
        localStorage.setItem('drivers', JSON.stringify(drivers));
    }, [drivers]);

    useEffect(() => {
        localStorage.setItem('companies', JSON.stringify(companies));
    }, [companies]);
    
    const handleOpenModal = (type: View, item: Transfer | Driver | Company | null = null) => {
        setModalType(type);
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setModalType(null);
    };

    const handleSave = (item: Transfer | Driver | Company) => {
        if (modalType === View.Transfers) {
            setTransfers(prev => editingItem ? prev.map(t => t.id === item.id ? item as Transfer : t) : [...prev, item as Transfer]);
        } else if (modalType === View.Drivers) {
            setDrivers(prev => editingItem ? prev.map(d => d.id === item.id ? item as Driver : d) : [...prev, item as Driver]);
        } else if (modalType === View.Companies) {
            setCompanies(prev => editingItem ? prev.map(c => c.id === item.id ? item as Company : c) : [...prev, item as Company]);
        }
        handleCloseModal();
    };
    
    const handleSaveBulk = (newTransfers: Transfer[]) => {
        setTransfers(prev => [...prev, ...newTransfers]);
        setIsBulkUploadModalOpen(false);
    };

    const handleExportCSV = (data: Transfer[]) => {
        if (data.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }

        const headers = [
            "ID Interno", "N° Traslado", "N° Siniestro", "Fecha", "Hora",
            "Paciente", "Celular Paciente", "Chofer", "Empresa", "ART",
            "Tipo Viaje", "Ciudad Origen", "Dirección Origen",
            "Ciudad Destino", "Dirección Destino", "Notas", "Hubo Espera",
            "Estado", "KM"
        ];

        const escapeCSV = (value: any): string => {
            if (value === null || value === undefined) {
                return '';
            }
            let str = String(value);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                str = `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const csvRows = data.map(t => {
            const driverName = drivers.find(d => d.id === t.driverId)?.name || 'N/A';
            const companyName = companies.find(c => c.id === t.companyId)?.name || 'N/A';

            return [
                escapeCSV(t.internalId),
                escapeCSV(t.transferNumber),
                escapeCSV(t.claimNumber),
                escapeCSV(t.date),
                escapeCSV(t.time),
                escapeCSV(t.patientName),
                escapeCSV(t.patientPhone),
                escapeCSV(driverName),
                escapeCSV(companyName),
                escapeCSV(t.art),
                escapeCSV(t.tripType),
                escapeCSV(t.originCity),
                escapeCSV(t.originAddress),
                escapeCSV(t.destinationCity),
                escapeCSV(t.destinationAddress),
                escapeCSV(t.notes),
                escapeCSV(t.waiting ? 'Si' : 'No'),
                escapeCSV(t.status),
                escapeCSV(t.km ?? '')
            ].join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `traslados_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const renderAdminView = () => {
        switch (view) {
            case View.Dashboard:
                return <DashboardView 
                    transfers={transfers} 
                    drivers={drivers} 
                    companies={companies}
                    setView={setView}
                    handleOpenModal={handleOpenModal} 
                />;
            case View.Transfers:
                return renderTransfersTable();
            case View.Drivers:
                return renderTable<Driver>(
                    ['Nombre', 'DNI', 'Celular', 'Email', 'Venc. Registro'],
                    drivers,
                    (item) => (
                        <tr key={item.id}>
                            <td className="p-3 text-sm font-medium text-gray-800">{item.name}</td>
                            <td className="p-3 text-sm text-gray-600">{item.dni}</td>
                            <td className="p-3 text-sm text-gray-600">{item.phone}</td>
                            <td className="p-3 text-sm text-gray-600">{item.email}</td>
                            <td className="p-3 text-sm text-gray-600">{new Date(item.licenseExpiry).toLocaleDateString()}</td>
                        </tr>
                    ),
                    View.Drivers
                );
            case View.Companies:
                return renderTable<Company>(
                    ['Nombre', 'CUIT', 'Email', 'Contacto'],
                    companies,
                    (item) => (
                        <tr key={item.id}>
                            <td className="p-3 text-sm font-medium text-gray-800">{item.name}</td>
                            <td className="p-3 text-sm text-gray-600">{item.cuit}</td>
                            <td className="p-3 text-sm text-gray-600">{item.email}</td>
                            <td className="p-3 text-sm text-gray-600">{item.contact}</td>
                        </tr>
                    ),
                    View.Companies
                );
            case View.Settlements:
                return <SettlementView transfers={transfers} drivers={drivers} companies={companies} />;
        }
    };

    const renderCoordinatorView = () => {
        return (
            <div>
                <div className="mb-6">
                    <button onClick={() => handleOpenModal(View.Transfers)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 text-lg font-semibold">
                        <PlusCircle size={24} />
                        <span>Cargar Nuevo Traslado</span>
                    </button>
                </div>
                {renderTransfersTable()}
            </div>
        );
    }
    
    const renderTransfersTable = () => renderTable<Transfer>(
        ['Fecha y Hora', 'Paciente', 'Origen', 'Destino', 'Chofer', 'Empresa', 'Estado'],
        [...transfers].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.time.localeCompare(a.time)),
        (item) => (
            <tr key={item.id}>
                <td className="p-3 text-sm text-gray-600">{new Date(item.date).toLocaleDateString()} {item.time}</td>
                <td className="p-3 text-sm font-medium text-gray-800">{item.patientName}</td>
                <td className="p-3 text-sm text-gray-600">{item.originCity}</td>
                <td className="p-3 text-sm text-gray-600">{item.destinationCity}</td>
                <td className="p-3 text-sm text-gray-600">{drivers.find(d => d.id === item.driverId)?.name}</td>
                <td className="p-3 text-sm text-gray-600">{companies.find(c => c.id === item.companyId)?.name}</td>
                <td className="p-3 text-sm">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'Realizado' ? 'bg-green-100 text-green-800' : item.status === 'Anulado' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item.status}
                    </span>
                </td>
            </tr>
        ),
        View.Transfers
    );
    
    // FIX: Corrected the generic type constraint for T to ensure type compatibility with `handleOpenModal`.
    const renderTable = <T extends Transfer | Driver | Company>(headers: string[], data: T[], renderRow: (item: T) => React.ReactElement, viewType: View) => {
        const isAdmin = userRole === 'admin';
        const finalHeaders = isAdmin && viewType !== View.Settlements ? [...headers, 'Acciones'] : headers;

        return (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 flex justify-between items-center border-b bg-gray-50">
                     <h2 className="text-xl font-bold text-gray-800">{viewType}</h2>
                     <div className="flex items-center gap-2">
                        {(viewType === View.Transfers && isAdmin) && (
                            <>
                                <button onClick={() => handleExportCSV(data as Transfer[])} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition duration-300">
                                    <Download size={20} />
                                    <span>Exportar CSV</span>
                                </button>
                                <button onClick={() => setIsBulkUploadModalOpen(true)} className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-700 transition duration-300">
                                    <UploadCloud size={20} />
                                    <span>Carga Masiva</span>
                                </button>
                            </>
                        )}
                         <button onClick={() => handleOpenModal(viewType)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition duration-300">
                             <PlusCircle size={20} />
                             <span>Agregar {viewType.slice(0,-1)}</span>
                         </button>
                     </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-500">
                            <tr>
                                {finalHeaders.map(h => <th key={h} className="p-3 tracking-wider">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {data.map(item => {
                                // FIX: Cast rowElement to React.ReactElement<any> to fix type inference issues
                                // where props were being inferred as 'unknown', causing errors on access
                                // and when using React.cloneElement.
                                const rowElement = renderRow(item) as React.ReactElement<any>;
                                const newChildren = [
                                    ...React.Children.toArray(rowElement.props.children),
                                    isAdmin && viewType !== View.Settlements && (
                                        <td key="actions" className="p-3 text-sm text-center whitespace-nowrap">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenModal(viewType, item);
                                                }}
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                                aria-label="Editar"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    alert('Funcionalidad de borrado no implementada.');
                                                }}
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors ml-2"
                                                aria-label="Borrar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    )
                                ];
                                return React.cloneElement(rowElement, {
                                    onClick: () => handleOpenModal(viewType, item),
                                    className: `transition-colors cursor-pointer odd:bg-white even:bg-gray-50 hover:bg-blue-50/70`,
                                    children: newChildren
                                });
                            })}
                        </tbody>
                    </table>
                     {data.length === 0 && <p className="p-6 text-center text-gray-500">No hay datos para mostrar.</p>}
                </div>
            </div>
        );
    };

    const renderModalContent = () => {
        if (!isModalOpen) return null;

        switch (modalType) {
            case View.Transfers:
                return <TransferForm 
                    onClose={handleCloseModal} 
                    onSave={handleSave} 
                    transfer={editingItem as Transfer | null} 
                    drivers={drivers}
                    companies={companies}
                />;
            case View.Drivers:
                return <DriverForm onClose={handleCloseModal} onSave={handleSave} driver={editingItem as Driver | null} />;
            case View.Companies:
                return <CompanyForm onClose={handleCloseModal} onSave={handleSave} company={editingItem as Company | null} />;
            default:
                return null;
        }
    };

    const NavItem: React.FC<{ icon: React.ReactNode, label: View, currentView: View, setView: (view: View) => void }> = ({ icon, label, currentView, setView }) => (
        <li className="mb-2">
            <a href="#" onClick={(e) => { e.preventDefault(); setView(label); }}
               className={`flex items-center p-3 rounded-lg transition-all duration-300 relative ${currentView === label ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}>
                {currentView === label && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-300 rounded-r-full"></div>}
                {icon}
                <span className="ml-4 font-medium">{label}</span>
            </a>
        </li>
    );

    const RoleSwitcher: React.FC = () => (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Vista:</span>
            <div className="flex rounded-lg bg-gray-200 p-1">
                <button
                    onClick={() => {setUserRole('coordinator'); setView(View.Transfers);}}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${userRole === 'coordinator' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                >
                    Coordinador
                </button>
                <button
                    onClick={() => {setUserRole('admin'); setView(View.Dashboard);}}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${userRole === 'admin' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                >
                    Admin
                </button>
            </div>
        </div>
    );

    return (
        <div className="h-screen bg-gray-100 font-sans flex flex-col">
            <header className="bg-white shadow-md p-4 flex justify-between items-center z-20">
                 <h1 className="text-2xl font-bold text-gray-800">Gestión de Traslados</h1>
                 <RoleSwitcher />
            </header>

            <div className="flex flex-1 overflow-hidden">
                {userRole === 'admin' && (
                    <aside className="w-64 bg-white shadow-lg flex flex-col z-10">
                        <nav className="flex-1 p-4 mt-4">
                            <ul>
                                <NavItem icon={<LayoutDashboard size={20} />} label={View.Dashboard} currentView={view} setView={setView} />
                                <NavItem icon={<Truck size={20} />} label={View.Transfers} currentView={view} setView={setView} />
                                <NavItem icon={<Users size={20} />} label={View.Drivers} currentView={view} setView={setView} />
                                <NavItem icon={<Building size={20} />} label={View.Companies} currentView={view} setView={setView} />
                                <NavItem icon={<FileText size={20} />} label={View.Settlements} currentView={view} setView={setView} />
                            </ul>
                        </nav>
                    </aside>
                )}
                
                <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-gray-50">
                    {userRole === 'admin' ? renderAdminView() : renderCoordinatorView()}
                </main>


                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            {renderModalContent()}
                        </div>
                    </div>
                )}
                
                {isBulkUploadModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                            <BulkUploadModal
                                onClose={() => setIsBulkUploadModalOpen(false)}
                                onSave={handleSaveBulk}
                                drivers={drivers}
                                companies={companies}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;