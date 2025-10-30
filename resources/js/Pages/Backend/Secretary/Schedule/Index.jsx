
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { Link } from '@inertiajs/react';
import { FaUserFriends, FaCalendarAlt, FaUsers, FaMoneyBillWave } from 'react-icons/fa';

export default function Dashboard() {


    return (
        <DashboardLayout title="Painel da Clínica">
            <div className="container mx-auto px-4 py-10">
                <p>Agendamentos</p>
            </div>
        </DashboardLayout>
    );
}
