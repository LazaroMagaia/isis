import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { usePage, Link } from '@inertiajs/react';
import { FaFileMedical, FaEdit,FaFilePdf } from 'react-icons/fa';
import UTIL from '@/util.js';


export default function Documentation() {
    const { appointment } = usePage().props;

    const cardEditButton = (routeName) => (
        <div className="absolute top-4 right-4">
            <Link
                href={route(routeName, appointment.id)}
                className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full hover:bg-primary-dark transition"
            >
                <FaEdit className="w-4 h-4" />
            </Link>
        </div>
    );

    return (
        <DashboardLayout title="Documentação da Consulta">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <FaFileMedical /> Documentação - Consulta #{appointment.id}
                </h2>
                <div className=' mb-4'>
                    <Link
                        href={route('doctor.appointments.index')}
                            className="text-gray-600 dark:text-gray-300 hover:underline"
                        >
                            &larr; Voltar
                    </Link>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Observações */}
                    <div className="col-span-12 md:col-span-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow relative">
                        {cardEditButton('doctor.documentation.edit')}
                        <h3 className="text-lg font-semibold mb-4">Observações</h3>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {appointment.documentation?.observations || 'Nenhuma observação registrada.'}
                        </p>
                    </div>

                    {/* Prescrição / Medicamentos */}
                    <div className="col-span-12 md:col-span-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow relative">
                        {cardEditButton('doctor.prescription.edit')}
                        <h3 className="text-lg font-semibold mb-4">Prescrição / Medicamentos</h3>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {appointment.prescription?.medications || 'Nenhuma prescrição registrada.'}
                        </p>

                    </div>
                                        
                    {/* Anexos */}
                    <div className="col-span-12 bg-white dark:bg-gray-800 p-6 rounded-xl shadow relative">
                        {cardEditButton('doctor.attachments.edit')}
                        <h3 className="text-lg font-semibold mb-4">Anexos</h3>
                        {appointment.attachments?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {appointment.attachments.map((file, idx) => {
                                    const fileUrl = UTIL.images.uploads.default + file.file_path;
                                    const ext = file.type.toLowerCase();
                                    const isImage = ['jpg','jpeg','png','gif'].includes(ext);
                                    const isPdf = ext === 'pdf';

                                    return (
                                        <div key={idx} className="relative group">
                                            {isImage ? (
                                                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                                    <img
                                                        src={fileUrl}
                                                        alt={file.file_path.split('/').pop()}
                                                        className="w-full h-48 object-cover rounded shadow-sm group-hover:opacity-80 transition"
                                                    />
                                                </a>
                                            ) : isPdf ? (
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex flex-col items-center justify-center w-full h-48 bg-gray-200 dark:bg-gray-700
                                                         rounded shadow-sm text-gray-800 dark:text-gray-200 p-4 group-hover:opacity-80 transition"
                                                >
                                                    <FaFilePdf size={48} className="mb-2 text-red-600" />
                                                    <span className="text-sm text-center">{file.file_path.split('/').pop()}</span>
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
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">Nenhum anexo registrado.</p>
                        )}
                    </div>


                </div>
            </div>
        </DashboardLayout>
    );
}
