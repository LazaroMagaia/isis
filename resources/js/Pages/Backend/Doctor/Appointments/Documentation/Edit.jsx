import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { usePage, router,Link } from '@inertiajs/react';
import { useState } from 'react';
import { FaFileMedical, FaSave } from 'react-icons/fa';
import Form from '@/Components/Backend/Form.jsx';
import Swal from 'sweetalert2';
export default function EditDocumentation() {
    const { appointment } = usePage().props;

    const [observations, setObservations] = useState(
        appointment.documentation?.observations || ''
    );

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!observations.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Campos faltando',
                text: 'Preencha as observações antes de enviar.',
                confirmButtonColor: '#8B57A4',
            });
            return;
        }

        router.post(route('doctor.documentation.update', appointment.id), { observations }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'Observações atualizadas com sucesso!',
                    confirmButtonColor: '#8B57A4',
                });
            }
        });
    };


    return (
        <DashboardLayout title={`Editar Observações - Consulta #${appointment.id}`}>
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
                    <h3 className="text-lg font-semibold mb-4">Observações</h3>
                    <Form
                        type="textarea"
                        name="observations"
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        placeholder="Digite as observações da consulta..."
                        required
                        className="min-h-[150px]" // altura mínima de 150px
                    />

                </div>
            </div>
        </DashboardLayout>
    );
}
