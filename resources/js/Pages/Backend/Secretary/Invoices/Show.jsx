import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { usePage, Link } from '@inertiajs/react';
import { FaArrowLeft, FaFilePdf } from 'react-icons/fa';
import { useState } from 'react';

export default function InvoiceShow() {
    const { invoice } = usePage().props;

    // Estado para tipo de destinatário
    const [recipientType, setRecipientType] = useState('patient'); // 'patient' ou 'secretary'
    const [recipientName, setRecipientName] = useState(invoice.patient?.name ?? '');

    const handleRecipientTypeChange = (e) => {
        const value = e.target.value;
        setRecipientType(value);
        if (value === 'patient') {
            setRecipientName(invoice.patient?.name ?? '');
        } else if (value === 'secretary') {
            setRecipientName(invoice.secretary?.name ?? '');
        }
    };

    const handlePdf = () => {
        const query = `?recipient=${encodeURIComponent(recipientName)}&type=${encodeURIComponent(recipientType)}`;
        window.open(route('secretary.invoices.pdf', invoice.id) + query, '_blank');
    };


    return (
        <DashboardLayout title={`Fatura #${invoice.number}`}>
            <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">

                <Link href={route('secretary.invoices.index')} className="text-gray-600 dark:text-gray-300 hover:underline flex items-center gap-2">
                    <FaArrowLeft /> Voltar
                </Link>

                {/* Select destinatário */}
                <div className="flex items-end justify-between mb-4 gap-4">
                    {/* Select do destinatário */}
                    <div className="w-64">
                        <label className="block mb-1 font-medium">Destinatário do PDF</label>
                        <select
                            value={recipientType}
                            onChange={handleRecipientTypeChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="patient">Paciente</option>
                            <option value="secretary">Secretária</option>
                        </select>
                    </div>

                    {/* Botão gerar PDF */}
                    <div>
                        <button
                            onClick={handlePdf}
                            className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-700 transition"
                        >
                            <FaFilePdf /> Gerar PDF
                        </button>
                    </div>
                </div>


                {/* Tabela */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                    <h2 className="text-2xl font-semibold mb-4">Paciente: {invoice.patient?.name ?? '—'}</h2>

                    <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg text-start">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-start">Medicamento</th>
                                <th className="px-4 py-2 text-start">Lote</th>
                                <th className="px-4 py-2 text-center">Qtd.</th>
                                <th className="px-4 py-2 text-end">Preço Unit.</th>
                                <th className="px-4 py-2 text-end">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item) => (
                                <tr key={item.id} className="border-t border-gray-200 dark:border-gray-700">
                                    <td className="px-4 py-2 text-start">{item.medicine?.name ?? item.prescription?.medication ?? '—'}</td>
                                    <td className="px-4 py-2 text-start">{item.batch?.batch_number ?? '—'}</td>
                                    <td className="px-4 py-2 text-center">{item.quantity}</td>
                                    <td className="px-4 py-2 text-end">
                                        {Number(item.unit_price).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT
                                    </td>
                                    <td className="px-4 py-2 text-end font-semibold">
                                        {Number(item.total_price).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-gray-200 dark:border-gray-700">
                                <td colSpan="4" className="px-4 py-2 text-end font-bold">Total Fatura</td>
                                <td className="px-4 py-2 text-end font-bold">
                                    {Number(invoice.total_amount).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
