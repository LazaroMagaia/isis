import { useState, useEffect } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import Form from '@/Components/Backend/Form.jsx';
import Swal from 'sweetalert2';

export default function CreateAppointment() {
    const { errors, services, doctors, patients } = usePage().props;

    const [values, setValues] = useState({
        patient_id: '',
        doctor_id: '',
        service_id: '',
        date: '',
        time: '',
        origin: 'online',
        discount: 0,
        amount: '',
        payment_method: '',
        notes: '',
        attachments: '',
    });

    // Atualiza automaticamente o valor do serviço ao escolher serviço ou alterar desconto
    useEffect(() => {
        const selectedService = services.find(s => s.id == values.service_id);
        if (selectedService) {
            let price = parseFloat(selectedService.price || 0);
            let discount = parseFloat(values.discount || 0);
            let finalAmount = price - (price * discount / 100);
            setValues(v => ({ ...v, amount: finalAmount.toFixed(2) }));
        }
    }, [values.service_id, values.discount]);

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setValues({
            ...values,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post(route('secretary.appointments.store'), values, {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Agendamento criado!',
                    text: 'O agendamento foi cadastrado com sucesso.',
                    confirmButtonColor: '#8B57A4',
                }).then(() => {
                    router.visit(route('secretary.appointments.index'));
                });
            },
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Ocorreu um problema ao criar o agendamento. Verifique os campos.',
                    confirmButtonColor: '#8B57A4',
                });
            },
        });
    };

    return (
        <DashboardLayout title="Criar Agendamento">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex justify-between items-center mb-6">
                    <Link
                        href={route('secretary.appointments.index')}
                        className="text-gray-600 dark:text-gray-300 hover:underline"
                    >
                        &larr; Voltar
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
                        Novo Agendamento
                    </h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="select"
                                label="Paciente"
                                name="patient_id"
                                value={values.patient_id}
                                onChange={handleChange}
                                options={patients.map(p => ({ value: p.id, label: p.name }))}
                                error={errors.patient_id}
                                required
                                searchable
                            />
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="select"
                                label="Médico"
                                name="doctor_id"
                                value={values.doctor_id}
                                onChange={handleChange}
                                options={doctors.map(d => ({ value: d.id, label: d.name }))}
                                error={errors.doctor_id}
                                searchable
                            />
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="select"
                                label="Serviço"
                                name="service_id"
                                value={values.service_id}
                                onChange={handleChange}
                                options={services.map(s => ({ value: s.id, label: s.name }))}
                                error={errors.service_id}
                                required
                            />
                        </div>

                        <div className="col-span-12 md:col-span-3">
                            <Form
                                type="date"
                                label="Data"
                                name="date"
                                value={values.date}
                                onChange={handleChange}
                                error={errors.date}
                                required
                            />
                        </div>

                        <div className="col-span-12 md:col-span-3">
                            <Form
                                type="time"
                                label="Hora"
                                name="time"
                                value={values.time}
                                onChange={handleChange}
                                error={errors.time}
                                required
                            />
                        </div>

                        <div className="col-span-12 md:col-span-4">
                            <Form
                                type="number"
                                label="Desconto (%)"
                                name="discount"
                                value={values.discount}
                                onChange={handleChange}
                                error={errors.discount}
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="col-span-12 md:col-span-4">
                            <Form
                                type="number"
                                label="Valor (MZN)"
                                name="amount"
                                value={values.amount}
                                onChange={handleChange}
                                error={errors.amount}
                                step="0.01"
                                required
                                readOnly // calculado automaticamente
                            />
                        </div>

                        <div className="col-span-12 md:col-span-4">
                            <Form
                                type="select"
                                label="Método de Pagamento"
                                name="payment_method"
                                value={values.payment_method}
                                onChange={handleChange}
                                error={errors.payment_method}
                                options={[
                                    { value: 'e-mola', label: 'E-Mola' },
                                    { value: 'm-pesa', label: 'M-Pesa' },
                                    { value: 'm-kesh', label: 'M-Kesh' },
                                    { value: 'dinheiro', label: 'Dinheiro' },
                                    { value:"card",label:"Débito"},
                                    { value: 'deposito_bancario', label: 'Depósito Bancário' },
                                ]}
                                placeholder="Selecione o método"
                                required
                            />
                        </div>

                        <div className="col-span-12">
                            <Form
                                type="textarea"
                                label="Notas"
                                name="notes"
                                value={values.notes}
                                onChange={handleChange}
                                error={errors.notes}
                                rows={3}
                            />
                        </div>

                        <div className="col-span-12 flex justify-end mt-6">
                            <button
                                type="submit"
                                className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition"
                            >
                                Criar Agendamento
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
