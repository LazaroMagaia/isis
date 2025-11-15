import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { Link } from '@inertiajs/react';
import { FaUserFriends, FaCalendarCheck, FaClipboardList, FaNotesMedical } from 'react-icons/fa';

export default function DoctorDashboard({ consultasPendentes }) {

    const cards = [
        {
            title: 'Consultas',
            value: 'Minhas Consultas',
            description: 'Ver todas as consultas agendadas',
            icon: <FaCalendarCheck className="text-primary text-5xl group-hover:text-white transition-colors" />,
            href: route('doctor.appointments.index'),
        },
        {
            title: 'Pacientes',
            value: 'Meus Pacientes',
            description: 'Pacientes atendidos ou acompanhados',
            icon: <FaUserFriends className="text-primary text-5xl group-hover:text-white transition-colors" />,
            href: route('doctor.dashboard'),
        },
        {
            title: 'Exames / Laudos',
            value: 'Resultados',
            description: 'Emitir ou consultar laudos',
            icon: <FaClipboardList className="text-primary text-5xl group-hover:text-white transition-colors" />,
            href: route('doctor.dashboard'),
        },
        {
            title: 'Prontuários',
            value: 'Prontuários',
            description: 'Históricos e informações dos pacientes',
            icon: <FaNotesMedical className="text-primary text-5xl group-hover:text-white transition-colors" />,
            href: route('doctor.dashboard'),
        }
    ];

    return (
        <DashboardLayout title="Painel do Médico">
            <div className="container mx-auto px-4 pb-10">
              {/* 🔵 Top Bar – Consultas Pendentes */}
              <div className=" container mx-auto my-5 bg-primary text-white p-4 rounded-xl shadow mb-8 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Consultas Pendentes</h2>
                  <span className="text-3xl font-bold">{consultasPendentes}</span>
              </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {cards.map((card, index) => (
                        <Link
                            key={index}
                            href={card.href}
                            className="group w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl p-6 flex 
                              flex-col justify-between transition-all hover:bg-primary hover:text-white cursor-pointer min-h-[180px]"
                        >
                            <div className="flex flex-col items-center justify-center flex-1">
                                <div className="mb-4">{card.icon}</div>
                                <h3 className="text-xl font-semibold mb-2 text-center group-hover:text-white transition-colors">
                                    {card.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
