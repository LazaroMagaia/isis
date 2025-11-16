import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import PaginatedTable from '@/Components/Backend/PaginatedTable.jsx';
import { EditIcon, DeleteIcon,BankNote } from "@/Components/Backend/HeroIcons";
import Swal from 'sweetalert2';
import { useState } from 'react';
import Form from '@/Components/Backend/Form.jsx';

export default function IndexAppointments() {
    const { appointments, filters, doctors } = usePage().props;
    const { search: initialSearch = '', status: initialStatus = '', doctor_id: initialDoctor = '', stats } = filters;
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [search, setSearch] = useState(initialSearch);
    const [status, setStatus] = useState(initialStatus);
    const [doctor, setDoctor] = useState(initialDoctor);

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Tem certeza?',
            text: "Deseja realmente cancelar este agendamento?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#8B57A4',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, cancelar',
            cancelButtonText: 'Fechar'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('secretary.appointments.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Cancelado!',
                            text: 'O agendamento foi cancelado com sucesso.',
                            confirmButtonColor: '#8B57A4',
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro',
                            text: 'Não foi possível cancelar o agendamento.',
                            confirmButtonColor: '#8B57A4',
                        });
                    }
                });
            }
        });
    };

    const handleFilter = (e) => {
        e.preventDefault();
      router.get(route('secretary.appointments.index'),
            { search, status, doctor_id: doctor },
            { preserveState: true, replace: true }
        );
    };

    const statusColors = {
        solicitado: 'bg-yellow-200 text-yellow-800',
        aprovado: 'bg-green-200 text-green-800',
        cancelado: 'bg-red-200 text-red-800',
        concluido: 'bg-blue-200 text-blue-800',
    };

    const openPaymentsModal = (appointment) => {
        setSelectedAppointment(appointment);

        // Carrega status do paciente
        const pacientePayment = appointment.payments.find(p => p.payer === "paciente");
        const seguradoraPayment = appointment.payments.find(p => p.payer === "seguradora");

        setPaymentStatus({
            paciente: pacientePayment?.status || "pendente",
            seguradora: seguradoraPayment?.status || "pendente",
        });

        setShowPaymentModal(true);
    };
    const [paymentStatus, setPaymentStatus] = useState({
        paciente: null,
        seguradora: null,
    });

    const updateLocalStatus = (payer, value) => {
        setPaymentStatus(prev => ({ ...prev, [payer]: value }));
    };

    const savePaymentsStatus = () => {
        router.patch(
            route('secretary.appointments.payments.update-both-status', selectedAppointment.id),
            paymentStatus,
            {
                onSuccess: () => {
                    setShowPaymentModal(false);
                    Swal.fire({
                        icon: 'success',
                        title: 'Status atualizado!',
                    });
                },

                onError: (errors) => {
                    // Monta mensagem com TODOS os erros
                    let message = Object.values(errors).join('<br>');

                    Swal.fire({
                        icon: 'error',
                        title: 'Erro ao atualizar pagamento',
                        html: message, // usa html para múltiplas linhas
                    });
                }
            }
        );
    };


    return (
        <DashboardLayout title="Agendamentos">
            <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
                {/* Voltar */}
                <div className="flex justify-between items-center mb-6">
                    <Link
                        href={route('secretary.dashboard')}
                        className="text-gray-600 dark:text-gray-300 hover:underline"
                    >
                        &larr; Voltar
                    </Link>
                </div>
                {/* === CARDS DE STATUS === */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6">

                    {/* Card Total */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-300">Total de Agendamentos</p>
                        <span className="text-3xl font-bold text-gray-800 dark:text-white">{appointments.total}</span>
                    </div>

                    {/* Cards por status */}
                    {Object.entries(stats).map(([key, value]) => {
                        // Mapear chaves do backend para nomes de status
                        let statusKey = '';
                        switch(key){
                            case 'approved': statusKey = 'aprovado'; break;
                            case 'cancelled': statusKey = 'cancelado'; break;
                            case 'pending': statusKey = 'solicitado'; break;
                            case 'completed': statusKey = 'concluido'; break;
                            default: statusKey = key;
                        }
                        return (
                            <div
                                key={key}
                                className={`rounded-xl shadow p-6 flex flex-col items-center justify-center ${statusColors[statusKey] || 'bg-gray-200 text-gray-800'}`}
                            >
                                <p className="capitalize font-semibold">{statusKey.replace('_', ' ')}</p>
                                <span className="text-2xl font-bold">{value}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Título + Novo */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <div className="grid grid-cols-12 gap-4 items-center mb-6">
                        <h2 className="col-span-12 md:col-span-6 text-2xl font-semibold text-gray-800 dark:text-gray-100">
                            Agendamentos
                        </h2>

                        <Link
                            href={route('secretary.appointments.create')}
                            className="col-span-12 md:col-span-6 justify-self-end bg-primary text-white px-4
                             py-2 rounded hover:bg-primary-dark transition text-center md:text-right w-full md:w-auto"
                        >
                            Novo Agendamento
                        </Link>
                    </div>

                    {/* Filtros */}
                    <form
                        onSubmit={handleFilter}
                        className="grid grid-cols-12 gap-4 mb-6 "
                    >

                        {/* 🔎 Search */}
                        <div className="col-span-12 md:col-span-4">
                            <Form
                                type="text"
                                name="search"
                                placeholder="Pesquisar por paciente, médico ou serviço"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* 🩺 Médico */}
                        <div className="col-span-12 md:col-span-4 mt-1">
                            <Form
                                type="select"
                                name="doctor_id"
                                label=""
                                value={doctor}
                                searchable={true}
                                onChange={(e) => setDoctor(e.target.value)}
                                options={doctors.map((d) => ({
                                    value: d.id,
                                    label: d.name,
                                }))}
                                placeholder="Selecionar Médico"
                                className="w-full"
                            />
                        </div>

                        {/* 📌 Status */}
                        <div className="col-span-12 md:col-span-3 mt-1">
                            <Form
                                type="select"
                                name="status"
                                label=""
                                options={[
                                    { value: '', label: 'Todos os status' },
                                    { value: 'solicitado', label: 'Solicitado' },
                                    { value: 'aguardando_pagamento', label: 'Aguardando Pagamento' },
                                    { value: 'aprovado', label: 'Aprovado' },
                                    { value: 'cancelado', label: 'Cancelado' },
                                    { value: 'concluido', label: 'Concluído' },
                                ]}
                                placeholder="Selecionar Status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* 🔘 Botão Filtrar */}
                        <div className="col-span-12 md:col-span-1 mt-1">
                            <button
                                type="submit"
                                className="w-full h-10 bg-primary text-white px-4 rounded hover:bg-primary-dark transition"
                            >
                                Filtrar
                            </button>
                        </div>
                    </form>
                    
                    <PaginatedTable columns={[
                        { label: 'ID', key: 'id' },
                        { label: 'Paciente', render: a => a.patient?.name || '-' },
                        { label: 'Médico', render: a => a.doctor?.name || '-' },
                        { label: 'Serviço', render: a => a.service?.name || '-' },
                        { label: 'Data', key: 'date' },
                        { 
                            label: 'Hora', 
                            render: a => a.slot ? `${a.slot.start_time.slice(0,5)} - ${a.slot.end_time.slice(0,5)}` : '-'
                        },
                        { label: 'Status', key: 'status' },
                        {
                            label: 'Ações',
                            align: 'right',
                            render: (a) => (
                                <div className="flex justify-end items-center">
                                    <Link href={route('secretary.appointments.edit', a.id)}
                                          className="text-primary hover:underline mr-4">
                                        <EditIcon/>
                                    </Link>
                                    {a.payment_method === 'parcial' && (
                                        <button
                                            onClick={() => openPaymentsModal(a)}
                                            className="text-green-500 underline mr-4"
                                        >
                                            <BankNote/>
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(a.id)} className="text-red-500
                                     hover:underline">
                                        <DeleteIcon/>
                                    </button>
                                    
                                </div>
                            )
                        }
                    ]} data={appointments.data} links={appointments.links} />
                </div>
            </div>
            {/* Modal de Pagamentos */}
            {showPaymentModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">

                        <h2 className="text-xl font-bold mb-4">
                            Pagamentos do Agendamento #{selectedAppointment.id}
                        </h2>

                        {/* 🔹 PAGAMENTO DO PACIENTE */}
                        <div className="border rounded-lg p-4 mb-4">
                            <h3 className="font-semibold mb-2">Paciente</h3>

                            {selectedAppointment.payments
                                .filter(p => p.payer === "paciente")
                                .map(p => (
                                    <div key={p.id} className="space-y-3">
                                        <p>Valor: <strong>{p.amount} MT</strong></p>

                                        <label className="block text-sm font-medium">Status</label>
                                        <select
                                            className="mt-1 block w-full h-10 px-3 border border-gray-300 rounded-md 
                                                shadow-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-0 "
                                            value={paymentStatus.paciente}
                                            onChange={(e) => updateLocalStatus("paciente", e.target.value)}
                                        >
                                            <option value="pendente">Pendente</option>
                                            <option value="pago">Pago</option>
                                            <option value="reembolsado">Reembolsado</option>
                                        </select>
                                    </div>
                                ))}
                        </div>

                        {/* 🔹 PAGAMENTO DA SEGURADORA */}
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-2">Seguradora</h3>

                            {selectedAppointment.payments
                                .filter(p => p.payer === "seguradora")
                                .map(p => (
                                    <div key={p.id} className="space-y-3">
                                        <p>Valor: <strong>{p.amount} MT</strong></p>

                                        <label className="block text-sm font-medium">Status</label>
                                        <select
                                            className="mt-1 block w-full h-10 px-3 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 
                                            dark:text-white focus:ring-2 focus:ring-primary focus:border-0 "
                                            value={paymentStatus.seguradora ?? p.status}
                                            onChange={(e) => updateLocalStatus("seguradora", e.target.value)}
                                        >
                                            <option value="pendente">Pendente</option>
                                            <option value="pago">Pago</option>
                                            <option value="reembolsado">Reembolsado</option>
                                        </select>
                                    </div>
                                ))}
                        </div>

                        {/* Botões */}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="px-4 py-2 bg-gray-400 text-white rounded"
                            >
                                Fechar
                            </button>

                            <button
                                onClick={savePaymentsStatus}
                                className="px-4 py-2 bg-primary text-white rounded"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}
