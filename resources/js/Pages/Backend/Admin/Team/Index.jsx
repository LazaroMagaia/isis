import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import PaginatedTable from '@/Components/Backend/PaginatedTable.jsx';
import { EditIcon, DeleteIcon } from "@/Components/Backend/HeroIcons";
import { useState } from 'react';
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from 'sweetalert2';

export default function IndexUsers() {
    const { team, filters } = usePage().props;

    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    // Mapa de roles PT-PT
    const rolesPT = {
        admin: 'Administrador',
        doctor: 'Médico',
        nurse: 'Enfermeiro(a)',
        secretary: 'Secretário(a)',
        patient: 'Paciente'
    };
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Tem certeza?',
            text: "Essa ação não poderá ser desfeita!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#8B57A4', // cor primary
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, deletar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.team.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deletado!',
                            text: 'O usuário foi excluído com sucesso.',
                            confirmButtonColor: '#8B57A4',
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro',
                            text: 'Não foi possível excluir o usuário.',
                            confirmButtonColor: '#8B57A4',
                        });
                    }
                });
            }
        });
    };

    const columns = [
        { label: 'ID', key: 'id' },
        { label: 'Nome', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Telefone', key: 'phone_1' },
        { label: 'Função', key: 'role', render: user => rolesPT[user.role] || user.role },
        {
            label: 'Ações',
            align: 'right',
            render: user => (
                <div className="flex justify-end items-center">
                    <Link
                        href={route('admin.team.edit', user.id)}
                        className="text-primary hover:underline mr-4"
                    >
                    <EditIcon/>
                    </Link>
                    <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:underline"
                    >
                      <DeleteIcon/>
                    </button>
                </div>
            )
        }
    ];

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.team.index'), { search, role }, { preserveState: true, replace: true });
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
                            Equipe
                        </h2>

                        <Link
                            href={route('admin.team.create')}
                            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
                        >
                            Novo Membro
                        </Link>
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
                        <select
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            className="border rounded px-4 py-2 w-full sm:w-1/4 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Todos os papéis</option>
                            <option value="admin">Admin</option>
                            <option value="doctor">Médico</option>
                            <option value="secretary">Recepcionista</option>
                        </select>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition">
                            Filtrar
                        </button>
                    </form>

                    <PaginatedTable columns={columns} data={team.data} links={team.links} />
                </div>
            </div>
        </DashboardLayout>
    );
}
