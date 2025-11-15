import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { usePage, router,Link } from '@inertiajs/react';
import PaginatedTable from '@/Components/Backend/PaginatedTable.jsx';
import { useState } from 'react';
import { FaFileMedical } from 'react-icons/fa';
import Form from '@/Components/Backend/Form.jsx';

export default function Appointments() {
    const { appointments, filters, stats } = usePage().props;

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('doctor.appointments.index'),
            { search, status },
            { preserveState: true, replace: true }
        );
    };

    const statusColors = {
        solicitado: 'bg-yellow-200 text-yellow-800',
        aguardando_pagamento: 'bg-orange-200 text-orange-800',
        aprovado: 'bg-green-200 text-green-800',
        cancelado: 'bg-red-200 text-red-800',
        concluido: 'bg-blue-200 text-blue-800',
    };

    return (
        <DashboardLayout title="Minhas Consultas">
            <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
                <Link
                        href={route('doctor.dashboard')}
                        className="text-gray-600 dark:text-gray-300 hover:underline"
                    >
                        &larr; Voltar
                </Link>
                {/* === CARDS DE ESTATÍSTICAS === */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
                        <p className="text-gray-500">Total</p>
                        <span className="text-3xl font-bold">{stats.total}</span>
                    </div>

                    <div className="bg-yellow-200 text-yellow-900 rounded-xl shadow p-6 text-center">
                        <p className="font-semibold">Pendentes</p>
                        <span className="text-3xl font-bold">{stats.pendentes}</span>
                    </div>

                    <div className="bg-green-200 text-green-900 rounded-xl shadow p-6 text-center">
                        <p className="font-semibold">Aprovadas</p>
                        <span className="text-3xl font-bold">{stats.aprovadas}</span>
                    </div>

                    <div className="bg-blue-200 text-blue-900 rounded-xl shadow p-6 text-center">
                        <p className="font-semibold">Concluídas</p>
                        <span className="text-3xl font-bold">{stats.concluidas}</span>
                    </div>
                </div>

                {/* === FILTROS === */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h2 className="text-2xl font-semibold mb-6">Consultas</h2>

                    <form onSubmit={handleFilter} className="grid grid-cols-12 gap-4 mb-6">
                        
                        {/* 🔎 Search */}
                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="text"
                                name="search"
                                placeholder="Pesquisar por paciente ou serviço"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* 📌 Status */}
                        <div className="col-span-12 md:col-span-4">
                            <Form
                                type="select"
                                name="status"
                                options={[
                                    { value: '', label: 'Todos' },
                                    { value: 'solicitado', label: 'Solicitado' },
                                    { value: 'aguardando_pagamento', label: 'Aguardando Pagamento' },
                                    { value: 'aprovado', label: 'Aprovado' },
                                    { value: 'concluido', label: 'Concluído' },
                                    { value: 'cancelado', label: 'Cancelado' },
                                ]}
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <div className="col-span-12 md:col-span-2">
                            <button
                                type="submit"
                                className="w-full h-10 bg-primary text-white rounded hover:bg-primary-dark transition"
                            >
                                Filtrar
                            </button>
                        </div>
                    </form>

                    {/* === TABELA === */}
                    <PaginatedTable
                        columns={[
                            { label: "ID", key: "id" },
                            { label: "Paciente", render: a => a.patient?.name || '-' },
                            { label: "Serviço", render: a => a.service?.name || '-' },
                            { label: "Data", key: "date" },
                            {
                                label: "Hora",
                                render: a =>
                                    a.slot ? `${a.slot.start_time.slice(0, 5)} - ${a.slot.end_time.slice(0, 5)}` : '-'
                            },
                            {
                                label: "Status",
                                render: a => (
                                    <span className={`px-3 py-1 rounded text-xs ${statusColors[a.status] ?? 'bg-gray-200'}`}>
                                        {a.status}
                                    </span>
                                )
                            },
                            // 🔹 Ações só aparecem se o status for "aprovado"
                            {
                                label: "Ações",
                                align: "right",
                                render: a =>
                                    a.status === 'aprovado' ? (
                                        <div className="flex justify-end items-center gap-2">
                                            <Link
                                                href={route('doctor.documentation.show', a.id)}
                                                className="text-primary hover:underline"
                                            >
                                                <FaFileMedical size={18} />
                                            </Link>
                                        </div>
                                    ) : null
                            }
                        ]}
                        data={appointments.data}
                        links={appointments.links}
                    />

                </div>
            </div>
        </DashboardLayout>
    );
}
