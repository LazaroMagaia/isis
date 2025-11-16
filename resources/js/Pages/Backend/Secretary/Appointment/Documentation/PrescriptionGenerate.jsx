import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { usePage, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaPrescriptionBottleAlt, FaFilePdf, FaTrash, FaSave } from 'react-icons/fa';
import Form from '@/Components/Backend/Form.jsx';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export default function PrescriptionGenerate() {
    const { appointment, existingMedications, availableMedications, errors } = usePage().props;

    // Converte string de medicamentos recomendados do médico em array para visualização
    const recommendedMedications = appointment.prescription?.medications
        ? appointment.prescription.medications.split(',').map(m => m.trim())
        : [];

    // Estado dos medicamentos que serão salvos
    const [medications, setMedications] = useState(
        existingMedications.length > 0 ? existingMedications : [{ name: '', dosage: '', frequency: '' }]
    );

    const addMedication = () =>
        setMedications([...medications, { name: '', dosage: '', frequency: '' }]);

    const updateMedication = (index, field, value) => {
        const newMedications = [...medications];
        newMedications[index][field] = value;
        setMedications(newMedications);
    };

    const removeMedication = (index) =>
        setMedications(medications.filter((_, i) => i !== index));

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

    return (
        <DashboardLayout title="Gerar Receita Médica">
            <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
                <Link
                    href={route('secretary.appointments.documentation.index', appointment.id)}
                    className="text-gray-600 dark:text-gray-300 hover:underline"
                >
                    &larr; Voltar
                </Link>

                {/* Título e botão gerar PDF */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <FaPrescriptionBottleAlt className="text-primary" /> Receita - Consulta #{appointment.id}
                    </h2>

                    <button
                        onClick={handleGeneratePDF}
                        className="w-full md:w-auto px-6 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark flex items-center justify-center gap-2"
                    >
                        <FaFilePdf /> Gerar PDF
                    </button>
                </div>

                {/* Card de medicamentos recomendados (apenas visual) */}
                <div className="border-l-4 border-primary bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6">
                    <h3 className="text-lg font-semibold mb-2">Medicamentos recomendados pelo médico</h3>
                    {recommendedMedications.length > 0 ? (
                        <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
                            {recommendedMedications.map((med, index) => (
                                <li key={index}>{med}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">Nenhum medicamento recomendado.</p>
                    )}
                </div>

                {/* Lista de medicamentos a serem salvos */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6">
                    {medications.map((med, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 items-end mb-2">
                            <div className="col-span-12 md:col-span-5">
                                <Form
                                    type="select"
                                    label="Medicamento"
                                    options={availableMedications.map((m) => ({ value: m, label: m }))}
                                    value={med.name}
                                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                    searchable={true}
                                    error={errors?.[`medications.${index}.name`]}
                                />
                            </div>

                            <div className="col-span-12 md:col-span-3">
                                <Form
                                    type="text"
                                    label="Dosagem"
                                    value={med.dosage}
                                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                    error={errors?.[`medications.${index}.dosage`]}
                                />
                            </div>

                            <div className="col-span-12 md:col-span-3">
                                <Form
                                    type="text"
                                    label="Frequência"
                                    value={med.frequency}
                                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                    error={errors?.[`medications.${index}.frequency`]}
                                />
                            </div>

                            <div className="col-span-12 md:col-span-1 flex justify-center md:justify-start">
                                <button
                                    type="button"
                                    onClick={() => removeMedication(index)}
                                    className="text-red-500 hover:text-red-700 transition"
                                    title="Remover medicamento"
                                >
                                    <FaTrash size={20} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Botões Salvar / Adicionar */}
                    <div className="grid grid-cols-12 gap-4 mt-6">
                        <button
                            type="button"
                            onClick={addMedication}
                            className="col-span-12 md:col-span-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 shadow flex items-center justify-center gap-2"
                        >
                            <FaPrescriptionBottleAlt /> Adicionar Medicamento
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            className="col-span-12 md:col-span-6 px-6 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark flex items-center justify-center gap-2"
                        >
                            <FaSave /> Salvar Receita
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
