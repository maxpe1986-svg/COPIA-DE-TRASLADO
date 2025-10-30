
import React, { useState, useCallback } from 'react';
import { X, UploadCloud, FileCheck, AlertTriangle, Save } from 'lucide-react';
import type { Transfer, Driver, Company } from '../types';

interface BulkUploadModalProps {
    onClose: () => void;
    onSave: (transfers: Transfer[]) => void;
    drivers: Driver[];
    companies: Company[];
}

interface ParsedResult {
    valid: Transfer[];
    invalid: { row: any; error: string; rowIndex: number }[];
}

const REQUIRED_COLUMNS = ['fecha', 'paciente', 'chofer_nombre', 'empresa_nombre', 'origen_direccion', 'destino_direccion'];

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ onClose, onSave, drivers, companies }) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv') {
                alert('Por favor, suba un archivo en formato CSV.');
                return;
            }
            setFile(selectedFile);
            parseFile(selectedFile);
        }
    };

    const parseFile = (fileToParse: File) => {
        setIsLoading(true);
        setParsedResult(null);
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                const result: ParsedResult = { valid: [], invalid: [] };
                const lines = content.split(/\r\n|\n/).filter(line => line.trim() !== '');
                if (lines.length < 2) {
                    result.invalid.push({ row: {}, error: 'El archivo está vacío o no contiene datos.', rowIndex: 0 });
                    setParsedResult(result);
                    setIsLoading(false);
                    return;
                }
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                
                const missingColumns = REQUIRED_COLUMNS.filter(rc => !headers.includes(rc));
                if (missingColumns.length > 0) {
                    result.invalid.push({ row: {}, error: `Faltan columnas requeridas en el CSV: ${missingColumns.join(', ')}`, rowIndex: 0 });
                    setParsedResult(result);
                    setIsLoading(false);
                    return;
                }

                for (let i = 1; i < lines.length; i++) {
                    const data = lines[i].split(',');
                    const rowData: { [key: string]: string } = {};
                    headers.forEach((header, index) => {
                        rowData[header] = data[index]?.trim() || '';
                    });

                    // Validation
                    let error = '';
                    if (!rowData.fecha || !/^\d{4}-\d{2}-\d{2}$/.test(rowData.fecha)) error += 'Fecha inválida (formato esperado YYYY-MM-DD). ';
                    if (!rowData.paciente) error += 'Falta nombre del paciente. ';
                    
                    const driver = drivers.find(d => d.name.toLowerCase() === rowData.chofer_nombre?.toLowerCase());
                    if (!driver) error += `Chofer "${rowData.chofer_nombre}" no encontrado. `;

                    const company = companies.find(c => c.name.toLowerCase() === rowData.empresa_nombre?.toLowerCase());
                    if (!company) error += `Empresa "${rowData.empresa_nombre}" no encontrada. `;

                    if (error) {
                        result.invalid.push({ row: rowData, error, rowIndex: i + 1 });
                    } else {
                        result.valid.push({
                            id: `trans_${new Date().getTime()}_${i}`,
                            date: rowData.fecha,
                            time: rowData.hora || '00:00',
                            patientName: rowData.paciente,
                            patientPhone: rowData.celular_paciente || '',
                            driverId: driver!.id,
                            companyId: company!.id,
                            originAddress: rowData.origen_direccion,
                            originCity: rowData.origen_localidad || '',
                            destinationAddress: rowData.destino_direccion,
                            destinationCity: rowData.destino_localidad || '',
                            km: rowData.km ? parseFloat(rowData.km) : 0,
                            waiting: rowData.espera?.toLowerCase() === 'si',
                            status: rowData.estado === 'Anulado' ? 'Anulado' : 'Realizado',
                            claimNumber: rowData.siniestro || '',
                            art: rowData.art || '',
                            tripType: (rowData.tipo_viaje as any) || 'IDA Y VUELTA',
                            transferNumber: rowData.nro_traslado || '',
                            internalId: rowData.id_interno || '',
                            notes: rowData.observaciones || '',
                        });
                    }
                }
                setParsedResult(result);
            }
            setIsLoading(false);
        };
        reader.onerror = () => {
            alert('Error al leer el archivo.');
            setIsLoading(false);
        }
        reader.readAsText(fileToParse);
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isOver: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(isOver);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e, false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleSaveClick = () => {
        if (parsedResult && parsedResult.valid.length > 0) {
            onSave(parsedResult.valid);
        }
    };

    return (
        <div className="p-6 bg-gray-50 flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">Carga Masiva de Traslados</h2>
                <button type="button" onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-6 py-6 overflow-hidden">
                <div className="md:w-1/3 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-gray-700">1. Subir Archivo CSV</h3>
                    <div
                        onDragOver={(e) => handleDragEvents(e, true)}
                        onDragLeave={(e) => handleDragEvents(e, false)}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
                    >
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Arrastre y suelte el archivo aquí</p>
                        <p className="text-xs text-gray-500">o</p>
                        <label htmlFor="file-upload" className="cursor-pointer font-medium text-blue-600 hover:text-blue-500">
                            Seleccione un archivo
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={e => handleFileChange(e.target.files ? e.target.files[0] : null)} />
                        </label>
                        {file && <p className="mt-4 text-sm font-medium text-gray-700">{file.name}</p>}
                    </div>
                    <div className="text-sm p-4 bg-gray-100 rounded-lg">
                        <h4 className="font-bold mb-2">Instrucciones:</h4>
                        <p className="mb-2">El archivo debe ser un CSV separado por comas. Puede generarlo desde Excel ("Guardar como" -&gt; "CSV (delimitado por comas)").</p>
                        <p className="font-semibold">Columnas requeridas:</p>
                        <ul className="list-disc list-inside text-xs">
                           {REQUIRED_COLUMNS.map(c => <li key={c}><code>{c}</code></li>)}
                        </ul>
                         <p className="font-semibold mt-2">Columnas opcionales:</p>
                         <p className="text-xs"><code>hora, km, espera (si/no), estado (Realizado/Anulado), siniestro, art, etc...</code></p>
                    </div>
                </div>

                <div className="md:w-2/3 flex flex-col overflow-hidden">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">2. Previsualización y Validación</h3>
                    <div className="flex-1 border rounded-lg bg-white overflow-y-auto">
                        {isLoading && <p className="p-4 text-center">Procesando archivo...</p>}
                        {!isLoading && !parsedResult && <p className="p-4 text-center text-gray-500">Suba un archivo para ver la previsualización.</p>}
                        {parsedResult && (
                            <div>
                                <div className="p-4 bg-gray-50 border-b flex justify-around">
                                    <div className="flex items-center gap-2 text-green-600">
                                        <FileCheck size={20} />
                                        <span className="font-bold">{parsedResult.valid.length} Filas Válidas</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertTriangle size={20} />
                                        <span className="font-bold">{parsedResult.invalid.length} Filas con Errores</span>
                                    </div>
                                </div>
                                {parsedResult.invalid.length > 0 && (
                                     <div className="p-4">
                                        <h4 className="font-bold text-red-700 mb-2">Errores Encontrados:</h4>
                                        <ul className="list-disc list-inside text-sm text-red-600 max-h-40 overflow-y-auto">
                                            {parsedResult.invalid.map(item => (
                                                <li key={item.rowIndex}><strong>Fila {item.rowIndex}:</strong> {item.error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {parsedResult.valid.length > 0 && (
                                     <div className="p-4">
                                        <h4 className="font-bold text-green-700 mb-2">Traslados a Importar (primeras 5 filas):</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="p-2">Fecha</th>
                                                        <th className="p-2">Paciente</th>
                                                        <th className="p-2">Origen</th>
                                                        <th className="p-2">Destino</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {parsedResult.valid.slice(0, 5).map((t, i) => (
                                                        <tr key={i} className="border-b">
                                                            <td className="p-2">{t.date}</td>
                                                            <td className="p-2">{t.patientName}</td>
                                                            <td className="p-2">{t.originAddress}</td>
                                                            <td className="p-2">{t.destinationAddress}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Cancelar</button>
                <button
                    type="button"
                    onClick={handleSaveClick}
                    disabled={!parsedResult || parsedResult.valid.length === 0 || isLoading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                    <Save size={18} />
                    Guardar {parsedResult?.valid.length || 0} Traslados
                </button>
            </div>
        </div>
    );
};
