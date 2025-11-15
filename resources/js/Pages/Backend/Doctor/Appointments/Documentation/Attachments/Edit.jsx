import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { usePage, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { FaPaperclip, FaSave, FaTrash,FaFilePdf } from 'react-icons/fa';

import Swal from 'sweetalert2';
import UTIL from '@/util.js';

export default function EditAttachments() {
    const { appointment } = usePage().props;
    const [attachments, setAttachments] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (attachments.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Nenhum arquivo selecionado',
                text: 'Selecione pelo menos um arquivo antes de enviar.',
                confirmButtonColor: '#8B57A4',
            });
            return;
        }

        const formData = new FormData();
        attachments.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });

        router.post(route('doctor.attachments.update', appointment.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'Anexos atualizados com sucesso!',
                    confirmButtonColor: '#8B57A4',
                });
                setAttachments([]);
            }
        });
    };

    const handleRemoveExisting = (attachmentId) => {
        Swal.fire({
            icon: 'warning',
            title: 'Deseja remover este anexo?',
            showCancelButton: true,
            confirmButtonColor: '#8B57A4',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Sim, remover',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('doctor.attachments.destroy', attachmentId), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Removido!',
                            text: 'O anexo foi removido.',
                            confirmButtonColor: '#8B57A4',
                        });
                    }
                });
            }
        });
    };

    return (
        <DashboardLayout title={`Editar Anexos - Consulta #${appointment.id}`}>
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="mb-4">
                    <Link
                        href={route('doctor.documentation.show', appointment.id)}
                        className="text-gray-600 dark:text-gray-300 hover:underline"
                    >
                        &larr; Voltar
                    </Link>
                </div>

                {/* Upload novos anexos */}
                <div className="col-span-12 md:col-span-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow relative">
                    <button
                        onClick={handleSubmit}
                        className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition"
                    >
                        <FaSave size={16} />
                    </button>

                    <h3 className="text-lg font-semibold mb-4">Adicionar Anexos</h3>
                    <input
                        type="file"
                        multiple
                        onChange={(e) => setAttachments(Array.from(e.target.files))}
                        className="block w-full text-sm text-gray-900 dark:text-white"
                    />
                    {attachments.length > 0 && (
                        <ul className="mt-2 text-gray-700 dark:text-gray-300">
                            {attachments.map((file, idx) => (
                                <li key={idx}>{file.name}</li>
                            ))}
                        </ul>
                    )}
                </div>
                {/* Anexos existentes */}
                {appointment.attachments?.length > 0 && (
                    <div className="col-span-12 bg-white dark:bg-gray-800 p-6 rounded-xl shadow mt-6">
                        <h3 className="text-lg font-semibold mb-4">Anexos Existentes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {appointment.attachments.map((file) => {
                                const fileUrl = UTIL.images.uploads.default + file.file_path;
                                const ext = file.type.toLowerCase();
                                const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
                                const isPDF = ext === 'pdf';

                                return (
                                    <div key={file.id} className="relative group">
                                        {isImage ? (
                                            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={fileUrl}
                                                    alt={file.file_path.split('/').pop()}
                                                    className="w-full h-48 object-cover rounded shadow-sm group-hover:opacity-80 transition"
                                                />
                                            </a>
                                        ) : isPDF ? (
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="relative block w-full h-48 bg-gray-200 dark:bg-gray-700 rounded shadow-sm flex items-center justify-center group-hover:opacity-80 transition"
                                            >
                                                <FaFilePdf size={32} className="text-red-600" />
                                                <span className="absolute bottom-2 text-xs text-gray-800 dark:text-gray-200">
                                                    {file.file_path.split('/').pop()}
                                                </span>
                                            </a>
                                        ) : (
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block p-2 bg-gray-100 dark:bg-gray-700 rounded text-center text-sm 
                                                hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                            >
                                                {file.file_path.split('/').pop()} ({file.type})
                                            </a>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExisting(file.id)}
                                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition"
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
