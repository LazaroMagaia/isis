import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import PaginatedTable from '@/Components/Backend/PaginatedTable.jsx';
import { ViewIcon } from "@/Components/Backend/HeroIcons"; // ícone para "Visualizar"
import { useState } from 'react';

export default function IndexDoctors() {
    const { doctor, filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');

    const columns = [
        { label: 'ID', key: 'id' },
        { label: 'Nome', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Telefone', key: 'phone_1' },
        {
            label: 'Ações',
            align: 'right',
            render: doctor => (
                <div className="flex justify-end items-center">
                    <Link
                        href={route('secretary.doctor-availability.show', doctor.id)}
                        className="text-primary hover:underline"
                    >
                        <ViewIcon />
                    </Link>
                </div>
            )
        }
    ];

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('secretary.doctor-availability.index'), { search }, { preserveState: true, replace: true });
    };

    return (
        <DashboardLayout title="Médicos">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex justify-between items-center mb-6">
                    <Link href={route('secretary.dashboard')} className="text-gray-600 dark:text-gray-300 hover:underline">
                        &larr; Voltar
                    </Link>
                </div>

                {/* Filtro de pesquisa */}
                <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, email ou telefone"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="mt-1 block w-1/3 border-gray-300 rounded-md shadow-sm
                            dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                    />
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition">
                        Filtrar
                    </button>
                </form>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        Lista de Médicos
                    </h2>
                    <PaginatedTable columns={columns} data={doctor.data} links={doctor.links} />
                </div>
            </div>
        </DashboardLayout>
    );
}
