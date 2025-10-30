import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import Swal from 'sweetalert2';
import { FaStethoscope, FaEdit, FaTrash } from 'react-icons/fa';

export default function IndexServices() {
    const { service, category } = usePage().props;

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Tem certeza?',
            text: "Essa ação não poderá ser desfeita!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#8B57A4',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, deletar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.services.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deletado!',
                            text: 'O serviço foi excluído com sucesso.',
                            confirmButtonColor: '#8B57A4',
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro',
                            text: 'Não foi possível excluir o serviço.',
                            confirmButtonColor: '#8B57A4',
                        });
                    }
                });
            }
        });
    };

    return (
        <DashboardLayout title="Serviços">
            <div className="max-w-7xl mx-auto px-4 py-10">
                {/* Cabeçalho */}
                <div className="flex justify-between items-center mb-6">
                    <Link href={route('admin.dashboard')} className="text-gray-600 dark:text-gray-300 hover:underline">
                        &larr; Voltar
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                            Serviços da Clínica
                        </h2>

                        <Link
                            href={route('admin.services.create')}
                            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
                        >
                            Novo Serviço
                        </Link>
                    </div>

                    {/* Cards */}
                    {service.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">Nenhum serviço cadastrado.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {service.map((item) => (
                                <div
                                    key={item.id}
                                    className="group bg-gray-50 dark:bg-gray-700 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1"
                                >
                                    <div className="p-6 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <FaStethoscope className="text-primary text-3xl" />
                                                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                                                    {item.name}
                                                </h3>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-300 text-sm flex-grow">
                                            {item.description?.substring(0, 100) || 'Sem descrição.'}
                                        </p>

                                        <div className="mt-4">
                                            <p className="text-sm text-gray-500">
                                                Categoria:{' '}
                                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                                    {category.find(c => c.id === item.category_id)?.name || '—'}
                                                </span>
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Duração: {item.duration_minutes || '--'} min
                                            </p>
                                            <p className="text-sm text-gray-700 dark:text-gray-200 font-semibold">
                                                {Number(item.price).toLocaleString('pt-MZ', {
                                                    style: 'currency',
                                                    currency: 'MZN'
                                                })}
                                            </p>
                                        </div>

                                        <div className="mt-6 flex justify-between items-center">
                                            <Link
                                                href={route('admin.services.edit', item.id)}
                                                className="flex items-center gap-2 text-primary hover:underline"
                                            >
                                                <FaEdit /> Editar
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="flex items-center gap-2 text-red-500 hover:underline"
                                            >
                                                <FaTrash /> Excluir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
