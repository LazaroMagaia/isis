import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import PaginatedTable from '@/Components/Backend/PaginatedTable.jsx';
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function IndexUsers() {
    const { user, filters } = usePage().props;

    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');

    const columns = [
        { label: 'ID', key: 'id' },
        { label: 'Nome', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Telefone', key: 'phone_1' },
    ];

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.patient.index'), { search, role }, { preserveState: true, replace: true });
    };

    return (
        <DashboardLayout title="Equipe">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex justify-between items-center mb-6">
                    <Link href={route('admin.dashboard')} className="text-gray-600 dark:text-gray-300 hover:underline">
                        &larr; Voltar
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="inline text-2xl font-semibold text-gray-800 dark:text-gray-100">
                            Pacientes
                        </h2>
                    </div>

                    {/* Filtros */}
                    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Pesquisar por nome, email ou telefone"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="border rounded px-4 py-2 w-full sm:w-1/3 dark:bg-gray-700 dark:text-white"
                        />
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition">
                            Filtrar
                        </button>
                    </form>

                    <PaginatedTable columns={columns} data={user.data} links={user.links} />
                </div>
            </div>
        </DashboardLayout>
    );
}
