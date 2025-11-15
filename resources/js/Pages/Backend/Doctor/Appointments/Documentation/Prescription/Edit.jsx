import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { usePage, router,Link } from '@inertiajs/react';
import { useState } from 'react';
import { FaPrescriptionBottleAlt, FaSave } from 'react-icons/fa';
import Form from '@/Components/Backend/Form.jsx';
import Swal from 'sweetalert2';
export default function EditPrescription() {
    const { appointment } = usePage().props;

    const [medications, setMedications] = useState(
        appointment.documentation?.prescriptions?.map(p => p.medications).join('\n') || ''
    );

 
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!medications.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Campos faltando',
                text: 'Preencha os medicamentos prescritos antes de enviar.',
                confirmButtonColor: '#8B57A4',
            });
            return;
        }

        router.post(route('doctor.prescription.update', appointment.id), { medications }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'Prescrição atualizada com sucesso!',
                    confirmButtonColor: '#8B57A4',
                });
            }
        });
    };
    return (
        <DashboardLayout title={`Editar Prescrição - Consulta #${appointment.id}`}>
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className=' mb-4'>
                    <Link
                        href={route('doctor.documentation.show',appointment.id)}
                            className="text-gray-600 dark:text-gray-300 hover:underline"
                        >
                            &larr; Voltar
                    </Link>
                </div>
                <div className="col-span-12 md:col-span-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow relative">
                    <button
                        onClick={handleSubmit}
                        className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition"
                    >
                        <FaSave size={16} />
                    </button>
                    <h3 className="text-lg font-semibold mb-4">Prescrição / Medicamentos</h3>
                    <Form
                        type="textarea"
                        name="medications"
                        value={medications}
                        onChange={(e) => setMedications(e.target.value)}
                        placeholder="Digite os medicamentos prescritos..."
                        required
                        className="min-h-[150px]" // altura mínima
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
