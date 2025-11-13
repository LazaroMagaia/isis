import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { Link } from '@inertiajs/react';
import { FaCalendarAlt } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { EditIcon } from "@/Components/Backend/HeroIcons";

export default function MostrarMedico({
    doctor,
    specificAvailability = {},
    availability = [],
    slotDuration = 30,
}) {
    // Normaliza disponibilidades específicas
    const disponibilidadesUnificadas = availability.map(avail => {
        const dates = specificAvailability[avail.id];
        if (!dates) return null;

        return {
            type: 'specific_date',
            availabilityId: avail.id,
            minDate: dates.minDate,
            maxDate: dates.maxDate,
            slotDuration: avail.slot_duration || slotDuration,
        };
    }).filter(Boolean);

    return (
        <DashboardLayout title={doctor.name}>
            <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col gap-6">

                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Link
                        href={route('secretary.doctor-availability.index')}
                        className="text-gray-600 dark:text-gray-300 hover:underline"
                    >
                        &larr; Voltar
                    </Link>

                    <Link
                        href={route('secretary.doctor-availability.create', doctor.id)}
                        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition mt-2 sm:mt-0"
                    >
                        Nova Disponibilidade
                    </Link>
                </div>

                {/* Grid principal */}
                <div className="grid grid-cols-12 gap-6 mt-8">
                    {disponibilidadesUnificadas.length > 0 ? (
                        disponibilidadesUnificadas.map(dispon => (
                            <div
                                key={dispon.availabilityId}
                                className="col-span-12 md:col-span-6 bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200">
                                        Disponibilidade Específica
                                    </h2>
                                    <Link
                                        href={route('secretary.doctor-availability.edit', { id: dispon.availabilityId })}
                                        className="text-primary hover:text-primary-dark flex items-center gap-1"
                                    >
                                        <EditIcon />
                                    </Link>
                                </div>

                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 flex-wrap">
                                    <FaCalendarAlt />
                                    <span>{`Período: ${format(parseISO(dispon.minDate), 'dd/MM/yyyy')} até ${format(parseISO(dispon.maxDate), 'dd/MM/yyyy')}`}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-12 bg-yellow-50 dark:bg-yellow-800 rounded-xl shadow p-6 text-center text-gray-700 dark:text-gray-200">
                            Nenhuma disponibilidade cadastrada para este médico.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
