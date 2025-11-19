import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { Link } from '@inertiajs/react';
import { 
    FaUserFriends, 
    FaCalendarAlt, 
    FaUserMd, 
    FaFileMedical,
    FaMoneyBillWave
} from 'react-icons/fa';

export default function Dashboard() {
    const cards = [
        {
            title: 'Pacientes',
            value: 120,
            description: 'Total de pacientes registrados',
            icon: <FaUserFriends className="text-primary text-5xl group-hover:text-white transition-colors" />,
            href: route('secretary.patient.index'),
        },
        {
            title: 'Consultas',
            value: 45,
            description: 'Agendadas hoje',
            icon: <FaCalendarAlt className="text-primary text-5xl group-hover:text-white transition-colors" />,
            href: route('secretary.appointments.index'),
        },
        {
            title: 'Documentação Médica',
            description: 'Consultas já documentadas pelo médico',
            icon: <FaFileMedical className="text-primary text-5xl group-hover:text-white transition-colors" />,
            href: route('secretary.documentation.index'),
        },
        {
            title: 'Medicos',
            value: 45,
            description: 'Disponibilidade dos medicos',
            icon: <FaUserMd className="text-primary text-5xl group-hover:text-white transition-colors" />,
            href: route('secretary.doctor-availability.index'),
        },

        // --- NOVO MENU ADICIONADO AQUI ---
        {
            title: 'Faturação',
            description: 'Gestão de pagamentos e faturas',
            icon: <FaMoneyBillWave className="text-primary text-5xl group-hover:text-white transition-colors" />,
            href: route('secretary.invoices.index'), // ajuste para seu nome real da rota
        },
    ];

    return (
        <DashboardLayout title="Painel da Clínica">
            <div className="container mx-auto px-4 py-10">
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
                                <h3 className="text-xl font-semibold mb-2 text-center group-hover:text-white transition-colors">{card.title}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
