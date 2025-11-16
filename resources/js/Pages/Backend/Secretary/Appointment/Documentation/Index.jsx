import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import PaginatedTable from '@/Components/Backend/PaginatedTable.jsx';
import { Link, router } from '@inertiajs/react';
import { FaFileMedical } from 'react-icons/fa';
import { useState } from 'react';
import Form from '@/Components/Backend/Form.jsx';

export default function DocumentationIndex({ appointments, doctors, patients, filters }) {
    const [doctorIds, setDoctorIds] = useState(filters.doctor_ids || []);
    const [patientIds, setPatientIds] = useState(filters.patient_ids || []);

    const applyFilter = () => {
        router.get(route('secretary.documentation.index'), {
            doctor_ids: doctorIds,
            patient_ids: patientIds,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <DashboardLayout title="Documentação Médica">
            <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
                <Link href={route('secretary.dashboard')} className="text-gray-600 dark:text-gray-300 hover:underline">
                    &larr; Voltar
                </Link>

                {/* === FILTROS === */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Filtros</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* 👨‍⚕️ Filtro múltiplo Médico */}
                        <Form
                            type="select-multiple"
                            label="Médicos"
                            options={doctors.map(d => ({ value: d.id, label: d.name }))}
                            value={doctorIds}
                            onChange={(e) => setDoctorIds(e.target.value)}
                            searchable={true}
                        />

                        {/* 🧍 Filtro múltiplo Pacientes */}
                        <Form
                            type="select-multiple"
                            label="Pacientes"
                            options={patients.map(p => ({ value: p.id, label: p.name }))}
                            value={patientIds}
                            onChange={(e) => setPatientIds(e.target.value)}
                            searchable={true}
                        />
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={applyFilter}
                            className="px-6 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark"
                        >
                            Aplicar Filtros
                        </button>
                    </div>
                </div>

                {/* === TABELA === */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <FaFileMedical className="text-primary" /> Documentação Médica
                    </h2>

                    <PaginatedTable
                        columns={[
                            { label: 'ID', key: 'id' },
                            { label: 'Paciente', render: a => a.patient?.name || '-' },
                            { label: 'Médico', render: a => a.doctor?.name || '-' },
                            { label: 'Serviço', render: a => a.service?.name || '-' },
                            { label: 'Data', key: 'date' },
                            { 
                                label: 'Hora',
                                render: a => a.slot ? `${a.slot.start_time.slice(0,5)} - ${a.slot.end_time.slice(0,5)}` : '-'
                            },
                            {
                                label: 'Ações',
                                align: 'right',
                                render: a => (
                                    <Link
                                        href={route('secretary.appointments.documentation.index', a.id)}
                                        className="text-primary hover:underline"
                                    >
                                        Ver Documentação
                                    </Link>
                                )
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
