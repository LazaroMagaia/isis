import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import PaginatedTable from '@/Components/Backend/PaginatedTable.jsx';
import Swal from 'sweetalert2';
import { useState } from 'react';
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaCalendarAlt } from 'react-icons/fa';

export default function IndexAppointments() {
    const { appointments, filters } = usePage().props;
    const { search: initialSearch = '', status: initialStatus = '', stats } = filters;

    const [search, setSearch] = useState(initialSearch);
    const [status, setStatus] = useState(initialStatus);

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
        router.get(route('secretary.appointments.index'), { search, status }, { preserveState: true, replace: true });
    };

    const statusCards = [
        {
            title: 'Consultas Solicitadas',
            value: stats?.pending ?? 0,
            description: 'Aguardando aprovação/pagamento',
            icon: <FaHourglassHalf className="text-yellow-500 text-5xl group-hover:text-white transition-colors" />,
            href: route('secretary.appointments.index', { status: 'solicitado' }),
        },
        {
            title: 'Consultas Aprovadas',
            value: stats?.approved ?? 0,
            description: 'Total de consultas confirmadas',
            icon: <FaCheckCircle className="text-green-500 text-5xl group-hover:text-white transition-colors" />,
            href: route('secretary.appointments.index', { status: 'aprovado' }),
        },
        {
            title: 'Consultas Canceladas',
            value: stats?.cancelled ?? 0,
            description: 'Total de consultas canceladas',
            icon: <FaTimesCircle className="text-red-500 text-5xl group-hover:text-white transition-colors" />,
            href: route('secretary.appointments.index', { status: 'cancelado' }),
        },
        {
            title: 'Consultas Concluídas',
            value: stats?.completed ?? 0,
            description: 'Atendimentos finalizados',
            icon: <FaCalendarAlt className="text-blue-500 text-5xl group-hover:text-white transition-colors" />,
            href: route('secretary.appointments.index', { status: 'concluido' }),
        },
    ];

    const columns = [
        { label: 'ID', key: 'id' },
        {
            label: 'Paciente',
            render: appointment => appointment.patient?.name || '-',
        },
        {
            label: 'Médico',
            render: appointment => appointment.doctor?.name || '-',
        },
        {
            label: 'Serviço',
            render: appointment => appointment.service?.name || '-',
        },
        { label: 'Data', key: 'date' },
        { label: 'Hora', key: 'time' },
        { label: 'Status', key: 'status' },
        {
            label: 'Ações',
            align: 'right',
            render: (appointment) => (
                <div className="text-right">
                    <Link
                        href={route('secretary.appointments.edit', appointment.id)}
                        className="text-primary hover:underline mr-4"
                    >
                        Editar
                    </Link>
                    <button
                        onClick={() => handleDelete(appointment.id)}
                        className="text-red-500 hover:underline"
                    >
                        Cancelar
                    </button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="Agendamentos">
            <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">

                <div className="flex justify-between items-center mb-6">
                    <Link
                        href={route('secretary.dashboard')}
                        className="text-gray-600 dark:text-gray-300 hover:underline"
                    >
                        &larr; Voltar
                    </Link>
                </div>
                {/* === CARDS DE STATUS === */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statusCards.map((card, index) => (
                        <Link
                            key={index}
                            href={card.href}
                            className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:bg-primary hover:text-white transition-colors p-6 flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{card.title}</h3>
                                    <p className="text-sm text-gray-500 group-hover:text-gray-100">{card.description}</p>
                                </div>
                                {card.icon}
                            </div>
                            <p className="text-3xl font-bold">{card.value}</p>
                        </Link>
                    ))}
                </div>

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
                    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Pesquisar por paciente, médico ou serviço"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border rounded px-4 py-2 w-full sm:w-1/2 dark:bg-gray-700 dark:text-white"
                        />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="border rounded px-4 py-2 w-full sm:w-1/3 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Todos os status</option>
                            <option value="solicitado">Solicitado</option>
                            <option value="aguardando_pagamento">Aguardando Pagamento</option>
                            <option value="aprovado">Aprovado</option>
                            <option value="cancelado">Cancelado</option>
                            <option value="concluido">Concluído</option>
                        </select>
                        <button
                            type="submit"
                            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
                        >
                            Filtrar
                        </button>
                    </form>

                    <PaginatedTable columns={columns} data={appointments.data} links={appointments.links} />
                </div>
            </div>
        </DashboardLayout>
    );
}
