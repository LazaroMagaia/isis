import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { Link } from '@inertiajs/react';
import { FaUserFriends, FaPills, FaUsers, FaStethoscope } from 'react-icons/fa';

export default function Dashboard() {
    const cards = [
        {
            title: 'Pacientes',
            value: 120,
            description: 'Total de pacientes registrados',
            icon: <FaUserFriends className="text-primary text-5xl group-hover:text-white transition-colors" />,
            href: route('admin.patient.index'), // usando route()
        },
        {
            title: 'Equipe',
            value: 8,
            description: 'Especialistas disponíveis',
            icon: <FaUsers className="text-primary text-5xl group-hover:text-white transition-colors" />,
            href: route('admin.team.index'),
        },
        {
            title: 'Medicamentos',
            value: 'Medicamentos',
            description: 'Controle e estoque',
            icon: <FaPills className="text-primary text-5xl group-hover:text-white transition-colors" />,
            href: route('admin.medicines.index'),
        },
        {
            title: 'Serviços',
            value: 'Servicos',
            description: 'Este mês',
            icon: <FaStethoscope className="text-primary text-5xl group-hover:text-white transition-colors" />,
            href: route('admin.services.index'),
        }
    ];

    return (
        <DashboardLayout title="Painel da Clínica">
            <div className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {cards.map((card, index) => (
                        <Link
                            key={index}
                            href={card.href}
                            className="group w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl p-6 flex flex-col justify-between transition-all hover:bg-primary hover:text-white cursor-pointer min-h-[180px]"
                        >
                            <div className="flex flex-col items-center justify-center flex-1">
                                <div className="mb-4">{card.icon}</div>
                                <h3 className="text-xl font-semibold mb-2 text-center group-hover:text-white transition-colors">{card.title}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
