import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { usePage, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FaPlus, FaSave } from 'react-icons/fa';
import Form from '@/Components/Backend/Form.jsx';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { DeleteIcon } from '@/Components/Backend/HeroIcons';

export default function InvoicesCreate() {
    const { patients, medicines } = usePage().props;

    const emptyRow = {
        medicine_id: '',
        batch_id: '',
        dosage: '',
        quantity: 1,
        available: 0,
        unitPrice: 0,
        totalPrice: 0,
    };

    const [patientId, setPatientId] = useState('');
    const [patientName, setPatientName] = useState(''); // para paciente externo
    const [rows, setRows] = useState([{ ...emptyRow }]);
    const [notes, setNotes] = useState('');

    const getBatchAvailable = (batch) => Number(batch?.quantity ?? batch?.balance ?? 0);

    const getMedicineFromList = (id) => {
        if (!id) return null;
        return Array.isArray(medicines) ? medicines.find(m => String(m.id) === String(id)) : null;
    };

    const computeTotalForRow = (r) => {
        const q = Number(r.quantity || 0);
        const p = Number(r.unitPrice || 0);
        return Number((q * p).toFixed(2));
    };

    const addRow = () => setRows(prev => ([...prev, { ...emptyRow }]));
    const removeRow = (index) => setRows(prev => prev.filter((_, i) => i !== index));

    useEffect(() => {
        setRows(prev => prev.map(r => {
            if (!r.medicine_id) return r;
            const med = getMedicineFromList(r.medicine_id);
            if (!med) return r;
            const firstBatch = Array.isArray(med.batches) ? med.batches.find(b => getBatchAvailable(b) > 0) : null;
            const unit = Number(firstBatch?.cost_price ?? 0);
            const available = Array.isArray(med.batches) ? med.batches.reduce((acc, b) => acc + getBatchAvailable(b), 0) : 0;

            return {
                ...r,
                unitPrice: unit,
                available,
                totalPrice: computeTotalForRow({ ...r, unitPrice: unit }),
            };
        }));
    }, [medicines]);

    const updateRow = (index, field, value) => {
        setRows(prev => {
            const copy = [...prev];
            const row = { ...copy[index] };

            if (field === 'medicine_id') {
                row.medicine_id = value || '';
                const med = getMedicineFromList(value);
                if (med) {
                    const available = Array.isArray(med.batches) ? med.batches.reduce((acc, b) => acc + getBatchAvailable(b), 0) : 0;
                    const firstBatch = Array.isArray(med.batches) ? med.batches.find(b => getBatchAvailable(b) > 0) : null;
                    row.available = available;
                    row.batch_id = firstBatch ? String(firstBatch.id) : '';
                    row.unitPrice = Number(firstBatch?.cost_price ?? 0);
                    row.totalPrice = computeTotalForRow(row);
                } else {
                    row.available = 0;
                    row.batch_id = '';
                    row.unitPrice = 0;
                    row.totalPrice = 0;
                }
            } else if (field === 'batch_id') {
                row.batch_id = value || '';
                const med = getMedicineFromList(row.medicine_id);
                if (med && Array.isArray(med.batches)) {
                    const b = med.batches.find(b => String(b.id) === String(value));
                    if (b) {
                        row.unitPrice = Number(b.cost_price ?? 0);
                        row.totalPrice = computeTotalForRow(row);
                    }
                }
            } else if (field === 'quantity') {
                let q = Number(value) || 0;
                if (row.available !== undefined && row.available !== null) q = Math.min(q, Number(row.available));
                row.quantity = q;
                row.totalPrice = computeTotalForRow(row);
            } else if (field === 'dosage') {
                row.dosage = value;
            }

            copy[index] = row;
            return copy;
        });
    };

    const invoiceTotal = rows.reduce((acc, r) => acc + (Number(r.totalPrice || 0)), 0);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Se nenhum paciente selecionado, permitir cliente externo, mas opcionalmente pedir nome
        if (!patientId && !patientName) {
            Swal.fire({ icon: 'error', title: 'Erro', text: 'Digite o nome do paciente externo ou selecione um paciente.' });
            return;
        }

        router.post(route('secretary.invoices.store'), {
            patient_id: patientId || null,
            patient_name: patientId ? null : patientName || null,
            notes,
            items: rows.map(r => ({
                medicine_id: r.medicine_id || null,
                batch_id: r.batch_id || null,
                dosage: r.dosage || null,
                quantity: Number(r.quantity || 0),
                unit_price: Number(r.unitPrice || 0),
                total_price: Number(r.totalPrice || 0),
            })),
        }, {
            onSuccess: () => {
                Swal.fire({ icon: 'success', title: 'Fatura criada', text: 'A fatura foi criada com sucesso.' });
            },
            onError: (errors) => {
                console.error(errors);
                Swal.fire({ icon: 'error', title: 'Erro', text: 'Corrija os campos e tente novamente.' });
            }
        });
    };

    return (
        <DashboardLayout title="Nova Fatura">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <Link href={route('secretary.invoices.index')} className="text-gray-600 dark:text-gray-300 hover:underline">&larr; Voltar</Link>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mt-6">
                    <div className="grid grid-cols-12 gap-4">

                     <div className="col-span-12 grid grid-cols-12 gap-4 items-end">
                    {/* Seleção de paciente */}
                    <div className="col-span-12 md:col-span-4">
                        <Form
                            type="select"
                            label="Paciente (opcional)"
                            options={[
                                { value: '', label: 'Consumidor Final / Cliente Externo' },
                                ...(Array.isArray(patients) ? patients.map(p => ({ value: p.id, label: p.name })) : [])
                            ]}
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            searchable={true}
                        />
                    </div>

                    {/* Nome paciente externo */}
                    <div className="col-span-12 md:col-span-4">
                        <Form
                            type="text"
                            label="Nome do paciente externo (opcional)"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            placeholder={patientId ? 'Paciente selecionado' : ''}
                            disabled={!!patientId} // desativa se paciente estiver selecionado
                        />
                    </div>

                    {/* Total da fatura */}
                    <div className="col-span-12 md:col-span-4 flex flex-col justify-end">
                        <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">Total da Fatura</div>
                        <div className="text-2xl font-semibold">{invoiceTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</div>
                    </div>

                </div>

                {/* Botão adicionar produto em linha separada */}
                <div className="col-span-12 mt-3">
                    <button
                        type="button"
                        onClick={addRow}
                        className="w-full md:w-auto bg-green-500 text-white px-4 py-2 rounded-md 
                            hover:bg-green-600 active:bg-green-700 transition-all duration-200 
                            flex items-center justify-center gap-2 shadow-sm focus:outline-none 
                            focus:ring-2 focus:ring-green-300"
                    >
                        <FaPlus className="text-lg" />
                        <span className="font-medium">Adicionar produto</span>
                    </button>
                </div>


                        <div className="col-span-12"><hr className="my-4" /></div>

                        {/* Linhas de produtos */}
                        {rows.map((row, index) => {
                            const med = getMedicineFromList(row.medicine_id);

                            return (
                                <div key={index} className="col-span-12 grid grid-cols-12 gap-4 items-center mb-3 p-4 
                                    bg-gray-50 dark:bg-gray-900 rounded">

                                    <div className="col-span-12 md:col-span-4">
                                        <Form
                                            type="select"
                                            label={`Medicamento — Qtd disp: ${row.available ?? 0}`}
                                            options={(Array.isArray(medicines) ? medicines : []).map(m => ({
                                                value: m.id,
                                                label: `${m.name}${m.form ? ' • ' + m.form : ''}`
                                            }))}
                                            value={row.medicine_id}
                                            onChange={(e) => updateRow(index, 'medicine_id', e.target.value)}
                                            searchable={true}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-2">
                                        <Form
                                            type="text"
                                            label="Dosagem"
                                            value={row.dosage}
                                            onChange={(e) => updateRow(index, 'dosage', e.target.value)}
                                        />
                                    </div>

                                    <div className="col-span-12 md:col-span-1">
                                        <Form
                                            type="number"
                                            label="Qtd"
                                            min={0}
                                            value={row.quantity}
                                            onChange={(e) => updateRow(index, 'quantity', e.target.value)}
                                        />
                                    </div>

                                    <div className="col-span-12 md:col-span-1 flex flex-col justify-center">
                                        <div className="text-sm text-gray-500">Preço Unit.</div>
                                        <div className="font-medium">
                                            {Number(row.unitPrice || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                                        </div>
                                    </div>

                                    <div className="col-span-12 md:col-span-2 flex flex-col justify-center">
                                        <div className="text-sm text-gray-500">Total</div>
                                        <div className="font-medium">
                                            {Number(row.totalPrice || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                                        </div>
                                    </div>

                                    <div className="col-span-12 md:col-span-1 flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            className="text-red-500 hover:text-red-700 transition rounded-full p-1"
                                        >
                                            <DeleteIcon size={20} />
                                        </button>
                                    </div>

                                </div>
                            );
                        })}

                        {/* Notas */}
                        <div className="col-span-12">
                            <Form type="textarea" label="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)}
                            style={{ minHeight: '100px' }} />
                        </div>

                        {/* Botão criar fatura */}
                        <div className="col-span-12 flex justify-end gap-4">
                            <button type="submit" className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark flex items-center gap-2">
                                <FaSave /> Criar Fatura
                            </button>
                        </div>

                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
