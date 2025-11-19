import { usePage, Link, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/AuthenticatedLayout.jsx";
import PaginatedTable from "@/Components/Backend/PaginatedTable.jsx";
import Form from "@/Components/Backend/Form";
import { useState } from "react";
import Swal from "sweetalert2";
import { ViewIcon,DeleteIcon } from "@/Components/Backend/HeroIcons.jsx";

export default function InvoicesIndex() {
    const { invoices, filters } = usePage().props;

    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "");
    const [dateStart, setDateStart] = useState(filters.date_start || "");
    const [dateEnd, setDateEnd] = useState(filters.date_end || "");

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route("admin.invoices.index"), {
            search,
            status,
            date_start: dateStart,
            date_end: dateEnd
        }, { preserveState: true });
    };

    const handleCancel = (invoiceId, invoiceNumber) => {
        Swal.fire({
            title: `Cancelar fatura #${invoiceNumber}?`,
            text: "Essa ação irá reverter o estoque e marcar a fatura como cancelada.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sim, cancelar",
            cancelButtonText: "Não"
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("admin.invoices.destroy", invoiceId), {
                    onSuccess: () => {
                        Swal.fire("Cancelada!", "A fatura foi cancelada.", "success");
                    },
                    onError: () => {
                        Swal.fire("Erro", "Não foi possível cancelar a fatura.", "error");
                    }
                });
            }
        });
    };

    const columns = [
        { label: "Nº Fatura", key: "number" },
        {
            label: "Paciente",
            render: (row) => (row.patient?.name ?? row.patient_name) || "—",
        },
        {
            label: "Total",
            render: (row) =>
                `${Number(row.total_amount).toLocaleString("pt-MZ", {
                    minimumFractionDigits: 2,
                })} MT`,
        },
        {
            label: "Status",
            render: (row) => {
                switch (row.status) {
                    case "paid":
                        return "Pago";
                    case "unpaid":
                        return "Pendente";
                    case "cancelled":
                        return "Cancelado";
                    default:
                        return row.status ?? "—";
                }
            },
        },
        {
            label: "Data",
            render: (row) => new Date(row.created_at).toLocaleDateString("pt-BR"),
        },

        {
            label: "Ações",
            align: "right",
            render: (row) => (
                <div className="flex justify-end items-center gap-2">
                    <Link
                        href={route("admin.invoices.show", row.id)}
                        className="text-primary hover:underline flex items-center"
                    >
                        <ViewIcon className="w-7 h-7" />
                    </Link>

                    {row.status === "paid" && (
                        <button
                            type="button"
                            onClick={() => handleCancel(row.id, row.number)}
                            className="text-red-500 hover:text-red-700 flex items-center"
                        >
                            <DeleteIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout title="Faturas">
            <div className="max-w-7xl mx-auto px-4 py-10">

                <div className="flex justify-between items-center mb-6">
                    <Link href={route("admin.dashboard")} className="text-gray-600 dark:text-gray-300 hover:underline">
                        &larr; Voltar
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                            Faturas
                        </h2>

                        <Link
                            href={route("admin.invoices.create")}
                            className="bg-primary text-white px-4 py-2 rounded-md shadow hover:bg-primary-dark transition"
                        >
                            Nova Fatura
                        </Link>
                    </div>

                    {/* Filtros */}
                    <form onSubmit={handleFilter} className="grid grid-cols-12 gap-4 mb-6">
                        <div className="col-span-12 sm:col-span-4">
                            <Form
                                type="text"
                                placeholder="Pesquisar Nº fatura ou paciente"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="col-span-12 sm:col-span-2 mt-1">
                            <Form
                                type="select"
                                options={[
                                    { value: "", label: "Todos os Status" },
                                    { value: "paid", label: "Pago" },
                                    { value: "unpaid", label: "Pendente" },
                                    { value: "cancelled", label: "Cancelado" },
                                ]}
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            />
                        </div>

                        <div className="col-span-12 sm:col-span-2">
                            <Form
                                type="date"
                                value={dateStart}
                                onChange={(e) => setDateStart(e.target.value)}
                            />
                        </div>

                        <div className="col-span-12 sm:col-span-2">
                            <Form
                                type="date"
                                value={dateEnd}
                                onChange={(e) => setDateEnd(e.target.value)}
                            />
                        </div>

                        <div className="col-span-12 sm:col-span-2 mt-1">
                            <button
                                type="submit"
                                className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
                            >
                                Filtrar
                            </button>
                        </div>
                    </form>

                    <PaginatedTable columns={columns} data={invoices.data} links={invoices.links} />
                </div>
            </div>
        </DashboardLayout>
    );
}
