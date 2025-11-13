import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { EditIcon, DeleteIcon } from "@/Components/Backend/HeroIcons";
import Swal from 'sweetalert2';

export default function EditDoctorAvailability({ doctor, availability }) {
    const form = useForm({
        doctor_id: doctor.id,
        datas: availability.datas || [],
        duracao_slot: availability.slot_duration || 30,
        ativo: availability.is_active ?? true,
    });

    const [editIndex, setEditIndex] = useState(null);
    const [showDataModal, setShowDataModal] = useState(false);
    const [tempData, setTempData] = useState({ data: '', hora_inicio: '08:00', hora_fim: '12:00' });

    const abrirDataModal = (index = null) => {
        setEditIndex(index);
        if (index !== null) setTempData(form.data.datas[index]);
        else setTempData({ data: '', hora_inicio: '08:00', hora_fim: '12:00' });
        setShowDataModal(true);
    };

    const salvarData = () => {
        if (!tempData.data) return Swal.fire('Erro', 'Selecione uma data', 'error');
        if (editIndex !== null) {
            const novas = [...form.data.datas];
            novas[editIndex] = tempData;
            form.setData('datas', novas);
        } else {
            form.setData('datas', [...form.data.datas, tempData]);
        }
        setEditIndex(null);
        setShowDataModal(false);
    };

    const removerData = (index) => {
        form.setData('datas', form.data.datas.filter((_, i) => i !== index));
    };

    const enviar = (e) => {
        e.preventDefault();
        form.put(route('secretary.doctor-availability.update', availability.id), {
            data: form.data,
            onSuccess: () => Swal.fire('Sucesso', 'Disponibilidade atualizada!', 'success'),
            onError: (errors) => Swal.fire('Erro', Object.values(errors)[0], 'error'),
        });
    };

    return (
        <DashboardLayout title={`Editar Disponibilidade - ${doctor.name}`}>
            <div className="w-full min-w-[320px] max-w-7xl mx-auto py-10 flex flex-col gap-6 px-4 sm:px-6 lg:px-8">
                <Link href={route('secretary.doctor-availability.show', doctor.id)} className="text-gray-600 dark:text-gray-300 hover:underline">&larr; Voltar</Link>

                <div className="w-full bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex flex-col gap-6">
                    <form onSubmit={enviar} className="space-y-6 w-full">

                        {/* Form Datas personalizadas */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="font-medium text-gray-700 dark:text-gray-200">Datas personalizadas</label>
                                <button
                                    type="button"
                                    onClick={() => abrirDataModal()}
                                    className="bg-primary text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-dark transition"
                                >
                                    <FaPlus />
                                </button>
                            </div>

                            {form.data.datas.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {form.data.datas.map((item, index) => (
                                        <div key={index} className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg flex items-center justify-between gap-3 shadow-sm w-full sm:w-auto">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.data}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-300">{item.hora_inicio} - {item.hora_fim}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button type="button" onClick={() => abrirDataModal(index)} className="text-primary hover:text-primary-dark transition"><EditIcon /></button>
                                                <button type="button" onClick={() => removerData(index)} className="text-red-500 hover:text-red-700 transition"><DeleteIcon /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">Nenhuma data adicionada</p>
                            )}
                        </div>

                        {/* Duração do slot */}
                        <div className="flex items-center gap-2">
                            <label className="block font-medium text-gray-700 dark:text-gray-200">Duração do slot (min)</label>
                            <input
                                type="number"
                                value={form.data.duracao_slot}
                                onChange={e => form.setData('duracao_slot', Number(e.target.value))}
                                className="border rounded px-2 py-1 w-24"
                            />
                        </div>

                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition mt-4" disabled={form.processing}>
                            Salvar Disponibilidade
                        </button>
                    </form>
                </div>

                {/* Modal de adicionar/editar data */}
                {showDataModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-lg relative">
                            <h3 className="text-lg font-semibold mb-4">{editIndex !== null ? 'Editar Data' : 'Adicionar Data'}</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block mb-1">Data</label>
                                    <input type="date" value={tempData.data} onChange={e => setTempData({ ...tempData, data: e.target.value })} className="border rounded px-2 py-1 w-full" />
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="block mb-1">Início</label>
                                        <input type="time" value={tempData.hora_inicio} onChange={e => setTempData({ ...tempData, hora_inicio: e.target.value })} className="border rounded px-2 py-1 w-full" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block mb-1">Fim</label>
                                        <input type="time" value={tempData.hora_fim} onChange={e => setTempData({ ...tempData, hora_fim: e.target.value })} className="border rounded px-2 py-1 w-full" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-5">
                                <button type="button" onClick={() => setShowDataModal(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded">Cancelar</button>
                                <button type="button" onClick={salvarData} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition">Salvar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
