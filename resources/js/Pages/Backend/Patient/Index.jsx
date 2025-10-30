import React from 'react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { usePage } from '@inertiajs/react';

export default function Index(){
    const { totalAppointments, appointmentsByStatus } = usePage().props;

    const statusColors = {
        solicitado: 'bg-yellow-200 text-yellow-800',
        aprovado: 'bg-green-200 text-green-800',
        cancelado: 'bg-red-200 text-red-800',
        concluido: 'bg-blue-200 text-blue-800',
    };

    return (
        <DashboardLayout title="Meu Painel">
            <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card total */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-300">Total de Agendamentos</p>
                    <span className="text-3xl font-bold text-gray-800 dark:text-white">{totalAppointments}</span>
                </div>

                {/* Cards por status */}
                {Object.entries(appointmentsByStatus).map(([status, count]) => (
                    <div
                        key={status}
                        className={`rounded-xl shadow p-6 flex flex-col items-center justify-center ${statusColors[status] || 'bg-gray-200 text-gray-800'}`}
                    >
                        <p className="capitalize font-semibold">{status.replace('_', ' ')}</p>
                        <span className="text-2xl font-bold">{count}</span>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
};
