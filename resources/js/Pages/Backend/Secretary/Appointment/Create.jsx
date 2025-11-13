import { useState, useEffect } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import Form from '@/Components/Backend/Form.jsx';
import Swal from 'sweetalert2';
import Select from 'react-select';

export default function CreateAppointment() {
    const { errors, services, patients, specialties: allSpecialties } = usePage().props;

    const [values, setValues] = useState({
        patient_id: '',
        specialties: [],      // agora seleciona especialidades primeiro
        doctor_id: '',
        service_id: '',
        date: '',
        slot_id: '',
        origin: 'online',
        discount: 0,
        amount: '',
        payment_method: '',
        notes: '',
        attachments: '',
    });

    const [doctors, setDoctors] = useState([]);         // médicos filtrados
    const [doctorDates, setDoctorDates] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);

    // 🔹 Atualiza automaticamente o valor do serviço
    useEffect(() => {
        const selectedService = services.find(s => s.id == values.service_id);
        if (selectedService) {
            const price = parseFloat(selectedService.price || 0);
            const discount = parseFloat(values.discount || 0);
            const finalAmount = price - (price * discount / 100);
            setValues(v => ({ ...v, amount: finalAmount.toFixed(2) }));
        }
    }, [values.service_id, values.discount]);

    // 🔹 Busca médicos ao mudar especialidades
    useEffect(() => {
        if (!values.specialties.length) {
            setDoctors([]);
            setValues(v => ({ ...v, doctor_id: '', date: '', slot_id: '' }));
            setDoctorDates([]);
            setAvailableSlots([]);
            return;
        }

        fetch('/api/doctors-by-specialties', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ specialties: values.specialties })
        })
        .then(res => res.json())
        .then(data => setDoctors(data))
        .catch(() => setDoctors([]));

        setValues(v => ({ ...v, doctor_id: '', date: '', slot_id: '' }));
        setDoctorDates([]);
        setAvailableSlots([]);
    }, [values.specialties]);

    // 🔹 Busca datas disponíveis quando o médico mudar
    useEffect(() => {
        if (!values.doctor_id) {
            setDoctorDates([]);
            setAvailableSlots([]);
            setValues(v => ({ ...v, date: '', slot_id: '' }));
            return;
        }

        fetch(`/api/doctor/${values.doctor_id}/available-dates`)
            .then(res => res.json())
            .then(data => setDoctorDates(data))
            .catch(() => setDoctorDates([]));

        setValues(v => ({ ...v, date: '', slot_id: '' }));
        setAvailableSlots([]);
    }, [values.doctor_id]);

    // 🔹 Busca horários disponíveis quando a data mudar
    useEffect(() => {
        if (!values.date) {
            setAvailableSlots([]);
            setValues(v => ({ ...v, slot_id: '' }));
            return;
        }

        const selectedDate = doctorDates.find(d => d.date === values.date);
        if (!selectedDate) return;

        fetch(`/api/availability-date/${selectedDate.id}/available-slots`)
            .then(res => res.json())
            .then(slots => setAvailableSlots(slots))
            .catch(() => setAvailableSlots([]));

        setValues(v => ({ ...v, slot_id: '' }));
    }, [values.date, doctorDates]);

        const handleChange = (e) => {
            const { name, type, value, selectedOptions } = e.target;
            if (type === 'select-multiple') {
                const valuesArray = Array.from(selectedOptions, option => option.value);
                setValues(v => ({ ...v, [name]: valuesArray }));
                return;
            }
            setValues(v => ({ ...v, [name]: value }));
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
                }).then(() => router.visit(route('secretary.appointments.index')));
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
                    <Link href={route('secretary.appointments.index')} className="text-gray-600 dark:text-gray-300 hover:underline">
                        &larr; Voltar
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
                        Novo Agendamento
                    </h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">

                        {/* Paciente */}
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

                        {/* Especialidades */}
                        <div className="col-span-12">
                           <Form
                                type="select-multiple"
                                label="Especialidades"
                                name="specialties"
                                value={values.specialties}
                                onChange={handleChange}
                                options={allSpecialties.map((s) => ({ value: s, label: s }))}
                                error={errors.specialties}
                            />

                        </div>

                        {/* Médico */}
                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="select"
                                label="Médico"
                                name="doctor_id"
                                value={values.doctor_id}
                                onChange={handleChange}
                                options={doctors.map(d => ({ value: d.id, label: d.name }))}
                                error={errors.doctor_id}
                                required
                                searchable
                                disabled={!doctors.length}
                            />
                        </div>

                        {/* Serviço */}
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

                        {/* Data */}
                        <div className="col-span-12 md:col-span-3">
                            <Form
                                type="select"
                                label="Data"
                                name="date"
                                value={values.date}
                                onChange={handleChange}
                                options={doctorDates.map(d => {
                                    const dateObj = new Date(d.date);
                                    const formattedDate = dateObj.toLocaleDateString('pt-MZ');
                                    return { value: d.date, label: formattedDate };
                                })}
                                error={errors.date}
                                required
                                placeholder="Selecione uma data"
                            />
                        </div>

                        {/* Hora / Slot */}
                        <div className="col-span-12 md:col-span-3">
                            <Form
                                type="select"
                                label="Hora"
                                name="slot_id"
                                value={values.slot_id}
                                onChange={handleChange}
                                options={availableSlots.map(s => ({
                                    value: s.id,
                                    label: `${s.start_time} - ${s.end_time}`
                                }))}
                                error={errors.slot_id}
                                required
                                placeholder="Selecione o horário"
                                disabled={!availableSlots.length}
                            />
                        </div>

                        {/* Desconto 
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
                        */}
                        {/* Valor */}
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
                                readOnly
                            />
                        </div>

                        {/* Método de pagamento */}
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

                        {/* Notas */}
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

                        {/* Botão */}
                        <div className="col-span-12 flex justify-end mt-6">
                            <button type="submit" className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition">
                                Criar Agendamento
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
