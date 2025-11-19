import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { usePage, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FaPrescriptionBottleAlt, FaFilePdf, FaSave } from 'react-icons/fa';
import Form from '@/Components/Backend/Form.jsx';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { DeleteIcon } from '@/Components/Backend/HeroIcons';

export default function PrescriptionGenerate() {
    const { appointment, existingMedications, availableMedications, errors } = usePage().props;

    const recommendedMedications = appointment.prescription?.medications
        ? appointment.prescription.medications.split(',').map(m => m.trim())
        : [];

    const emptyRow = { medicine_id: null, name: '', dosage: '', frequency: '', quantity: 0, available: 0, unitPrice: 0, totalPrice: 0 };
    const [medications, setMedications] = useState([emptyRow]);

    // Hidrata estado quando props chegam
    useEffect(() => {
        if (existingMedications && existingMedications.length > 0) {
            const mapped = existingMedications.map((m) => {
                if (m.medicine_id) {
                    const medObj = availableMedications.find(am => String(am.id) === String(m.medicine_id));
                    const firstBatch = (medObj?.batches && medObj.batches.length > 0) ? medObj.batches[0] : null;
                    const unitPrice = firstBatch?.cost_price ?? 0;
                    const quantity = Number(m.quantity ?? 0);

                    return {
                        medicine_id: m.medicine_id,
                        name: medObj ? medObj.name : (m.medication_label ?? ''),
                        dosage: m.dosage ?? '',
                        frequency: m.frequency ?? '',
                        quantity: quantity,
                        available: medObj ? Number(medObj.total_stock ?? 0) : 0,
                        unitPrice: unitPrice,
                        totalPrice: quantity * unitPrice,
                    };
                }

                const quantity = Number(m.quantity ?? 0);

                return {
                    medicine_id: null,
                    name: m.name ?? (m.medication_label ?? ''),
                    dosage: m.dosage ?? '',
                    frequency: m.frequency ?? '',
                    quantity: quantity,
                    available: 0,
                    unitPrice: 0,
                    totalPrice: 0,
                };
            });
            setMedications(mapped);
        } else {
            setMedications([emptyRow]);
        }
    }, [existingMedications, availableMedications]);

    const addMedication = () => setMedications([...medications, { ...emptyRow }]);

    // Atualização ao escolher medicamento ou alterar quantidade
    const updateMedication = (index, field, value) => {
        const newMedications = [...medications];

        if (field === 'medicine_id') {
            const medObj = availableMedications.find(m => String(m.id) === String(value));
            newMedications[index].medicine_id = medObj ? medObj.id : null;
            newMedications[index].name = medObj ? medObj.name : '';
            newMedications[index].dosage = newMedications[index].dosage || '';
            newMedications[index].available = medObj ? Number(medObj.total_stock ?? 0) : 0;

            // pega o primeiro lote apenas se houver saldo
            const firstBatch = (medObj?.batches && medObj.batches.length > 0) ? medObj.batches[0] : null;
            newMedications[index].unitPrice = firstBatch?.cost_price ?? 0;

            // recalcula total
            newMedications[index].totalPrice = newMedications[index].quantity * newMedications[index].unitPrice;
        } else if (field === 'quantity') {
            const num = Number(value) || 0;
            newMedications[index].quantity = Math.min(num, newMedications[index].available);
            newMedications[index].totalPrice = newMedications[index].quantity * (newMedications[index].unitPrice ?? 0);
        } else {
            // Atualiza campos como dosagem e frequência
            newMedications[index][field] = value;
        }

        setMedications(newMedications);
    };

    const removeMedication = (index) => setMedications(medications.filter((_, i) => i !== index));

    const handleGeneratePDF = () => {
        window.location.href = route('secretary.documentation.prescription-pdf', { id: appointment.id });
    };

    const handleSave = () => {
        router.post(
            route('secretary.documentation.prescription-store', { id: appointment.id }),
            { medications },
            {
                onError: (err) => {
                    console.log(err);
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro',
                        text: 'Existem campos inválidos. Verifique os medicamentos.',
                    });
                },
                onSuccess: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Sucesso',
                        text: 'Receita salva com sucesso!',
                        confirmButtonColor: '#3085d6',
                        timer: 2000,
                    });
                },
            }
        );
    };

    const handleFaturar = () => {
        Swal.fire({
            title: "Confirmar faturamento?",
            text: "Deseja realmente faturar esta receita agora?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sim, faturar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route("secretary.documentation.prescription-invoice", { id: appointment.id }),
                    {},
                    {
                        onSuccess: () => {
                            Swal.fire({
                                icon: "success",
                                title: "Faturamento realizado!",
                                text: "O download do PDF será iniciado.",
                                confirmButtonColor: "#3085d6",
                                timer: 2000,
                                willClose: () => {
                                    window.location.href = route('secretary.documentation.prescription-invoice.download', { id: appointment.id });
                                }
                            });
                        },
                        onError: () => {
                            Swal.fire({
                                icon: "error",
                                title: "Erro",
                                text: "Não foi possível faturar.",
                            });
                        }
                    }
                );
            }
        });
    };

    return (
        <DashboardLayout title="Gerar Receita Médica">
            <div className="container mx-auto px-4 py-10 space-y-8">
                <Link
                    href={route('secretary.appointments.documentation.index', appointment.id)}
                    className="text-gray-600 dark:text-gray-300 hover:underline"
                >
                    &larr; Voltar
                </Link>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <FaPrescriptionBottleAlt className="text-primary" /> Receita - Consulta #{appointment.id}
                    </h2>
                    <div className="flex flex-col md:flex-row gap-3">
                        <button
                            onClick={handleGeneratePDF}
                            className="w-full md:w-auto px-6 py-2 bg-primary text-white rounded-lg shadow 
                                hover:bg-primary-dark flex items-center justify-center gap-2"
                        >
                            <FaFilePdf /> Gerar PDF
                        </button>

                        <button
                            onClick={handleFaturar}
                            className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-lg shadow 
                                hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                            <FaSave /> Faturar
                        </button>
                    </div>
                </div>

                <div className="border-l-4 border-primary bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6">
                    <h3 className="text-lg font-semibold mb-2">Medicamentos recomendados pelo médico</h3>
                    {recommendedMedications.length > 0 ? (
                        <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
                            {recommendedMedications.map((med, index) =>
                                med.split('\n').map((line, idx) => <li key={`${index}-${idx}`}>{line}</li>)
                            )}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">Nenhum medicamento recomendado.</p>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                    {medications.map((med, index) => {
                        const selectedMed = Array.isArray(availableMedications)
                            ? availableMedications.find(m => String(m.id) === String(m.medication_id ?? med.medicine_id))
                            : null;
                        const availableQty = selectedMed ? Number(selectedMed.total_stock ?? 0) : 0;

                        return (
                           <div
                                key={index}
                                className="grid grid-cols-12 gap-4 items-center mb-3 p-4 bg-white dark:bg-gray-800 rounded-xl 
                                    shadow-sm border border-gray-200 dark:border-gray-700"
                            >
                                {/* Medicamento */}
                                <div className="col-span-12 md:col-span-4">
                                    <Form
                                        type="select"
                                        label={`Medicamento — Qtd disp: ${availableQty}`}
                                        options={(Array.isArray(availableMedications) ? availableMedications : []).map(m => ({
                                            value: m.id,
                                            label: `${m.name}${m.form ? ' • ' + m.form : ''}`,
                                        }))}
                                        value={med.medicine_id ?? ''}
                                        onChange={(e) => updateMedication(index, 'medicine_id', e.target.value)}
                                        searchable={true}
                                        error={errors?.[`medications.${index}.medicine_id`]}
                                    />
                                </div>

                                {/* Dosagem */}
                                <div className="col-span-12 md:col-span-2">
                                    <Form
                                        type="text"
                                        label="Dosagem"
                                        value={med.dosage}
                                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                        error={errors?.[`medications.${index}.dosage`]}
                                    />
                                </div>

                                {/* Frequência */}
                                <div className="col-span-12 md:col-span-2">
                                    <Form
                                        type="text"
                                        label="Frequência"
                                        value={med.frequency}
                                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                        error={errors?.[`medications.${index}.frequency`]}
                                    />
                                </div>

                                {/* Quantidade */}
                                <div className="col-span-12 md:col-span-1">
                                    <Form
                                        type="number"
                                        label="Qtd."
                                        min={0}
                                        value={med.quantity}
                                        onChange={(e) => updateMedication(index, 'quantity', e.target.value)}
                                        error={errors?.[`medications.${index}.quantity`]}
                                    />
                                </div>

                                {/* Preço Unitário */}
                                <div className="col-span-12 md:col-span-1 flex flex-col items-end">
                                    <label className="text-gray-500 dark:text-gray-400 text-sm mb-1">Preço Unit.</label>
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                                        {(med.unitPrice ?? 0).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT
                                    </span>
                                </div>

                                {/* Total */}
                                <div className="col-span-12 md:col-span-1 flex flex-col items-end">
                                    <label className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total</label>
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                                        {(med.totalPrice ?? 0).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT
                                    </span>
                                </div>

                                {/* Botão remover */}
                                <div className="col-span-12 md:col-span-1 flex items-center justify-center md:justify-start">
                                    <button
                                        type="button"
                                        onClick={() => removeMedication(index)}
                                        className="text-red-500 hover:text-red-700 transition rounded-full p-1"
                                        title="Remover medicamento"
                                    >
                                        <DeleteIcon size={20} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    <div className="grid grid-cols-12 gap-4 mt-6">
                        <button
                            type="button"
                            onClick={addMedication}
                            className="col-span-12 md:col-span-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600
                                shadow flex items-center justify-center gap-2"
                        >
                            <FaPrescriptionBottleAlt /> Adicionar Medicamento
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            className="col-span-12 md:col-span-6 px-6 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark
                                flex items-center justify-center gap-2"
                        >
                            <FaSave /> Salvar Receita
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
