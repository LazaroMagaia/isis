import { useState, useEffect } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import Form from '@/Components/Backend/Form.jsx';
import Swal from 'sweetalert2';

export default function EditAppointment() {
    const { appointment, services, doctors, patients, specialties: allSpecialties, errors } = usePage().props;

    const currentDoctor = doctors.find(d => d.id == appointment.doctor_id);
    const initialSpecialties = currentDoctor ? JSON.parse(currentDoctor.specialties || '[]') : [];

    const [values, setValues] = useState({
        patient_id: appointment.patient_id || '',
        specialties: initialSpecialties, // especialidades do médico atual
        doctor_id: appointment.doctor_id || '',
        service_id: appointment.service_id || '',
        date: appointment.date || '',
        slot_id: appointment.slot_id || '',
        origin: appointment.origin || 'online',
        discount: appointment.discount || 0,
        amount: appointment.amount || '',
        payment_method: appointment.payment_method || '',
        notes: appointment.notes || '',
        attachments: appointment.attachments || '',
        status: appointment.status || '',
    });

    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [doctorDates, setDoctorDates] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);

    // 🔹 Atualiza automaticamente o valor do serviço
    useEffect(() => {
        const selectedService = services.find((s) => s.id == values.service_id);
        if (selectedService) {
            let price = parseFloat(selectedService.price || 0);
            let discount = parseFloat(values.discount || 0);
            let finalAmount = price - (price * discount) / 100;
            setValues((v) => ({ ...v, amount: finalAmount.toFixed(2) }));
        }
    }, [values.service_id, values.discount]);

    // 🔹 Filtra médicos quando as especialidades mudam
    useEffect(() => {
        if (!values.specialties.length) {
            setFilteredDoctors([]);
            setValues((v) => ({ ...v, doctor_id: '', date: '', slot_id: '' }));
            setDoctorDates([]);
            setAvailableSlots([]);
            return;
        }

        const filtered = doctors.filter((doc) => {
            const docSpecs = JSON.parse(doc.specialties || '[]');
            return values.specialties.some((s) => docSpecs.includes(s));
        });

        setFilteredDoctors(filtered);

        // Se o médico atual não está entre os filtrados, limpar seleção
        if (!filtered.find(d => d.id == values.doctor_id)) {
            setValues((v) => ({ ...v, doctor_id: '', date: '', slot_id: '' }));
            setDoctorDates([]);
            setAvailableSlots([]);
        }
    }, [values.specialties, doctors]);

    // 🔹 Carrega datas e slots disponíveis ao iniciar a página ou mudar médico
    useEffect(() => {
        if (!values.doctor_id) return;

        fetch(`/api/doctor/${values.doctor_id}/available-dates`)
            .then(res => res.json())
            .then((dates) => {
                setDoctorDates(dates);

                // Se já existe uma data no appointment, buscar os slots automaticamente
                if (values.date) {
                    const selectedDate = dates.find(d => d.date === values.date);

                    if (selectedDate) {
                        fetch(`/api/availability-date/${selectedDate.id}/available-slots`)
                            .then(res => res.json())
                            .then((slots) => {
                                setAvailableSlots(slots);

                                // Mantém o slot atual se ainda estiver disponível
                                if (values.slot_id && slots.find(s => s.id == values.slot_id)) {
                                    setValues(v => ({ ...v, slot_id: v.slot_id }));
                                } else {
                                    setValues(v => ({ ...v, slot_id: '' }));
                                }
                            })
                            .catch(() => setAvailableSlots([]));
                    }
                }
            })
            .catch(() => setDoctorDates([]));
    }, [values.doctor_id]);


    // 🔹 Atualiza horários disponíveis quando a data muda
    useEffect(() => {
        if (!values.date) {
            setAvailableSlots([]);
            setValues((v) => ({ ...v, slot_id: '' }));
            return;
        }

        const selectedDate = doctorDates.find(d => d.date === values.date);
        if (!selectedDate) return;

        fetch(`/api/availability-date/${selectedDate.id}/available-slots`)
            .then(res => res.json())
            .then((slots) => setAvailableSlots(slots))
            .catch(() => setAvailableSlots([]));

        // Limpa slot se não estiver mais disponível
        if (!availableSlots.find((s) => s.id === values.slot_id)) {
            setValues((v) => ({ ...v, slot_id: '' }));
        }
    }, [values.date, doctorDates]);

    // 🔹 Atualiza campos
    const handleChange = (e) => {
        const { name, type, value, selectedOptions, checked } = e.target;

        if (name === 'slot_id') {
            const selectedSlot = availableSlots.find((s) => s.id == value);
            setValues((v) => ({
                ...v,
                slot_id: value,
                start_time: selectedSlot?.start_time || '',
                end_time: selectedSlot?.end_time || '',
            }));
            return;
        }

        if (type === 'select-multiple') {
            const selectedValues = Array.from(selectedOptions, (option) => option.value);
            setValues((v) => ({ ...v, [name]: selectedValues }));
            return;
        }

        setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
    };

    // 🔹 Submissão
    const handleSubmit = (e) => {
        e.preventDefault();

        router.put(route('secretary.appointments.update', appointment.id), values, {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Agendamento atualizado!',
                    text: 'O agendamento foi atualizado com sucesso.',
                    confirmButtonColor: '#8B57A4',
                }).then(() => router.visit(route('secretary.appointments.index')));
            },
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Ocorreu um problema ao atualizar o agendamento. Verifique os campos.',
                    confirmButtonColor: '#8B57A4',
                });
            },
        });
    };

    return (
        <DashboardLayout title="Editar Agendamento">
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
                        Editar Agendamento
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
                                options={patients.map((p) => ({ value: p.id, label: p.name }))}
                                error={errors.patient_id}
                                searchable
                                required
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
                                options={filteredDoctors.map((d) => ({ value: d.id, label: d.name }))}
                                error={errors.doctor_id}
                                searchable
                                disabled={!filteredDoctors.length}
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
                                options={services.map((s) => ({ value: s.id, label: s.name }))}
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
                                options={doctorDates.map((d) => ({
                                    value: d.date,
                                    label: new Date(d.date).toLocaleDateString('pt-MZ'),
                                }))}
                                error={errors.date}
                                required
                                placeholder="Selecione uma data"
                            />
                        </div>

                        {/* Hora */}
                        <div className="col-span-12 md:col-span-3">
                            <Form
                                type="select"
                                label="Hora"
                                name="slot_id"
                                value={values.slot_id}
                                onChange={handleChange}
                                options={availableSlots.map((s) => ({
                                    value: s.id,
                                    label: `${s.start_time} - ${s.end_time}`,
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
                                    { value: 'card', label: 'Débito' },
                                    { value: 'deposito_bancario', label: 'Depósito Bancário' },
                                ]}
                                required
                            />
                        </div>

                        {/* Status */}
                        <div className="col-span-12 md:col-span-4">
                            <Form
                                type="select"
                                label="Status do Agendamento"
                                name="status"
                                value={values.status}
                                onChange={handleChange}
                                error={errors.status}
                                options={[
                                    { value: 'solicitado', label: 'Solicitado' },
                                    { value: 'aguardando_pagamento', label: 'Aguardando Pagamento' },
                                    { value: 'aprovado', label: 'Aprovado' },
                                    { value: 'cancelado', label: 'Cancelado' },
                                    { value: 'concluido', label: 'Concluído' },
                                ]}
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
                            <button
                                type="submit"
                                className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition"
                            >
                                Atualizar Agendamento
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
