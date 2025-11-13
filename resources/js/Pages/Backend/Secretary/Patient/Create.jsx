import { useState } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import Form from '@/Components/Backend/Form.jsx';
import countries from '@/nationalities';
import Swal from 'sweetalert2';

export default function CreateUserMultiStep() {
    const { errors: serverErrors } = usePage().props;

    const [step, setStep] = useState(1);

    const [values, setValues] = useState({
        // Role
        role: 'patient',

        // Basic information
        name: '',
        father_name: '',
        mother_name: '',
        gender: '',
        nationality: '',
        birth_date: '',

        // Identification
        identification_type: '',
        identification_number: '',

        // Address
        address: '',
        province: '',

        // Contact
        phone_1: '',
        phone_2: '',

        // Personal details
        marital_status: '',
        sexual_orientation: '',

        // Emergency contacts
        emergency_contact_1_name: '',
        emergency_contact_1_address: '',
        emergency_contact_1_relationship: '',
        emergency_contact_1_phone: '',
        emergency_contact_1_fax: '',

        emergency_contact_2_name: '',
        emergency_contact_2_address: '',
        emergency_contact_2_relationship: '',
        emergency_contact_2_phone: '',
        emergency_contact_2_fax: '',

        // Insurance
        insurance_name: '',
        insurance_number: '',
        insurance_provider: '',

        // Authentication
        email: '',
    });

    // client-side errors per field
    const [clientErrors, setClientErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
        // clear client error on change
        setClientErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    // Define required fields per step
    const requiredPerStep = {
        1: ['name', 'email'], // basic auth + name
        2: ['gender', 'birth_date', 'nationality'], // personal
        3: ['identification_type', 'identification_number'], // identification
        4: ['address', 'province', 'phone_1'], // address & contact
        5: [], // personal details (optional)
        6: [], // emergency contact 1 (optional)
        7: [], // emergency contact 2 (optional)
        8: [], // insurance (optional)
    };

    // Validate step returns true if ok, sets clientErrors otherwise
    const validateStep = (currentStep) => {
        const required = requiredPerStep[currentStep] || [];
        const newClientErrors = {};

        required.forEach((field) => {
            const val = values[field];
            if (val === undefined || val === null || String(val).trim() === '') {
                newClientErrors[field] = 'Campo obrigatório';
            }
        });

        setClientErrors((prev) => ({ ...prev, ...newClientErrors }));
        return Object.keys(newClientErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep((s) => Math.min(s + 1, 8));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // scroll to top to show errors
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        setStep((s) => Math.max(s - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // validate all steps required fields before sending
        let allOk = true;
        for (let s = 1; s <= 8; s++) {
            if (!validateStep(s)) allOk = false;
        }
        if (!allOk) {
            setStep(1);
            Swal.fire({
                icon: 'error',
                title: 'Campos faltando',
                text: 'Preencha os campos obrigatórios antes de enviar.',
                confirmButtonColor: '#8B57A4',
            });
            return;
        }

        router.post(route('secretary.patient.store'), values, {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Usuário criado!',
                    text: 'O paciente foi cadastrado com sucesso.',
                    confirmButtonColor: '#8B57A4',
                }).then(() => router.visit(route('secretary.patient.index')));
            },
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao criar paciente',
                    text: 'Verifique os campos e tente novamente.',
                    confirmButtonColor: '#8B57A4',
                });
            },
        });
    };

    // helper to get error for a field: serverErrors take precedence, then clientErrors
    const getError = (field) => serverErrors?.[field] || clientErrors?.[field];

    // Small progress label
    const stepsLabel = [
        '1. Conta & Básicos',
        '2. Pessoais',
        '3. Identificação',
        '4. Endereço & Contato',
        '5. Detalhes Pessoais',
        '6. Emergência 1',
        '7. Emergência 2',
        '8. Seguro',
    ];

    return (
        <DashboardLayout title="Novo Paciente - Criação por Etapas">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex justify-between items-center mb-6">
                    <Link
                        href={route('secretary.patient.index')}
                        className="text-gray-600 dark:text-gray-300 hover:underline"
                    >
                        &larr; Voltar
                    </Link>

                    <div className="text-sm text-gray-500">
                        Etapa {step} de 8 — {stepsLabel[step - 1]}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
                        Novo Paciente
                    </h2>

                    {/* Progress bar */}
                    <div className="mb-6">
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${(step / 8) * 100}%` }}
                            />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* STEP 1 - Conta & Básicos */}
                        {step === 1 && (
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-12 md:col-span-6">
                                    <Form
                                        type="text"
                                        label="Nome completo"
                                        name="name"
                                        value={values.name}
                                        onChange={handleChange}
                                        error={getError('name')}
                                        required
                                    />
                                </div>

                                <div className="col-span-12 md:col-span-6">
                                    <Form
                                        type="email"
                                        label="Email"
                                        name="email"
                                        value={values.email}
                                        onChange={handleChange}
                                        error={getError('email')}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 2 - Pessoais */}
                        {step === 2 && (
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-12 md:col-span-3">
                                    <Form
                                        type="select"
                                        label="Gênero"
                                        name="gender"
                                        value={values.gender}
                                        onChange={handleChange}
                                        options={[
                                            { value: 'male', label: 'Masculino' },
                                            { value: 'female', label: 'Feminino' },
                                            { value: 'other', label: 'Outro' },
                                        ]}
                                        error={getError('gender')}
                                        required
                                    />
                                </div>

                                <div className="col-span-12 md:col-span-3">
                                    <Form
                                        type="date"
                                        label="Data de Nascimento"
                                        name="birth_date"
                                        value={values.birth_date}
                                        onChange={handleChange}
                                        error={getError('birth_date')}
                                        required
                                    />
                                </div>

                                <div className="col-span-12 md:col-span-6">
                                    <Form
                                        type="select"
                                        label="Nacionalidade"
                                        name="nationality"
                                        value={values.nationality}
                                        onChange={handleChange}
                                        options={countries}
                                        error={getError('nationality')}
                                        required
                                        searchable
                                    />
                                </div>

                                <div className="col-span-12 md:col-span-6">
                                    <Form
                                        type="text"
                                        label="Nome do Pai"
                                        name="father_name"
                                        value={values.father_name}
                                        onChange={handleChange}
                                        error={getError('father_name')}
                                    />
                                </div>

                                <div className="col-span-12 md:col-span-6">
                                    <Form
                                        type="text"
                                        label="Nome da Mãe"
                                        name="mother_name"
                                        value={values.mother_name}
                                        onChange={handleChange}
                                        error={getError('mother_name')}
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 3 - Identificação */}
                        {step === 3 && (
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-12 md:col-span-4">
                                    <Form
                                        type="select"
                                        label="Tipo de Identificação"
                                        name="identification_type"
                                        value={values.identification_type}
                                        onChange={handleChange}
                                        error={getError('identification_type')}
                                        required
                                        options={[
                                            { value: 'BI', label: 'BI' },
                                            { value: 'Passport', label: 'Passaporte' },
                                            { value: 'Carta de conducao', label: 'Carta de Condução' },
                                        ]}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-8">
                                    <Form
                                        type="text"
                                        label="Número de Identificação"
                                        name="identification_number"
                                        value={values.identification_number}
                                        onChange={handleChange}
                                        error={getError('identification_number')}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 4 - Endereço & Contato */}
                        {step === 4 && (
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-12 md:col-span-8">
                                    <Form
                                        type="text"
                                        label="Endereço"
                                        name="address"
                                        value={values.address}
                                        onChange={handleChange}
                                        error={getError('address')}
                                        required
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <Form
                                        type="text"
                                        label="Província"
                                        name="province"
                                        value={values.province}
                                        onChange={handleChange}
                                        error={getError('province')}
                                        required
                                    />
                                </div>

                                <div className="col-span-12 md:col-span-6">
                                    <Form
                                        type="text"
                                        label="Telefone Principal"
                                        name="phone_1"
                                        value={values.phone_1}
                                        onChange={handleChange}
                                        error={getError('phone_1')}
                                        required
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-6">
                                    <Form
                                        type="text"
                                        label="Telefone Secundário"
                                        name="phone_2"
                                        value={values.phone_2}
                                        onChange={handleChange}
                                        error={getError('phone_2')}
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 5 - Detalhes Pessoais */}
                        {step === 5 && (
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-12 md:col-span-6">
                                    <Form
                                        type="select"
                                        label="Estado Civil"
                                        name="marital_status"
                                        value={values.marital_status}
                                        onChange={handleChange}
                                        error={getError('marital_status')}
                                        options={[
                                            { value: 'solteiro', label: 'Solteiro(a)' },
                                            { value: 'casado', label: 'Casado(a)' },
                                            { value: 'divorciado', label: 'Divorciado(a)' },
                                            { value: 'viuvo', label: 'Viúvo(a)' },
                                            { value: 'outro', label: 'Outro (a)' },
                                        ]}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-6">
                                    <Form
                                        type="select"
                                        label="Orientação Sexual"
                                        name="sexual_orientation"
                                        value={values.sexual_orientation}
                                        onChange={handleChange}
                                        error={getError('sexual_orientation')}
                                        options={[
                                            { value: 'heterossexual', label: 'Heterossexual' },
                                            { value: 'homossexual', label: 'Homossexual' },
                                            { value: 'bissexual', label: 'Bissexual' },
                                            { value: 'pansexual', label: 'Pansexual' },
                                            { value: 'assexual', label: 'Assexual' },
                                            { value: 'outro', label: 'Outro (a)' },
                                        ]}
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 6 - Emergência 1 */}
                        {step === 6 && (
                            <>
                                <div className="text-lg font-semibold mt-2 mb-3 text-gray-700 dark:text-gray-200">
                                    Contato de Emergência 1
                                </div>
                                <div className="grid grid-cols-12 gap-6">
                                    <div className="col-span-12 md:col-span-4">
                                        <Form
                                            type="text"
                                            label="Nome"
                                            name="emergency_contact_1_name"
                                            value={values.emergency_contact_1_name}
                                            onChange={handleChange}
                                            error={getError('emergency_contact_1_name')}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-4">
                                        <Form
                                            type="select"
                                            label="Relação"
                                            name="emergency_contact_1_relationship"
                                            value={values.emergency_contact_1_relationship}
                                            onChange={handleChange}
                                            error={getError('emergency_contact_1_relationship')}
                                            options={[
                                                { value: 'pai', label: 'Pai' },
                                                { value: 'mae', label: 'Mãe' },
                                                { value: 'irmao', label: 'Irmão (a)' },
                                                { value: 'tio', label: 'Tio (a)' },
                                                { value: 'conjuge', label: 'Cônjuge' },
                                                { value: 'filho', label: 'Filho (a)' },
                                                { value: 'amigo', label: 'Amigo (a)' },
                                                { value: 'outro', label: 'Outro (a)' },
                                            ]}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-4">
                                        <Form
                                            type="text"
                                            label="Telefone"
                                            name="emergency_contact_1_phone"
                                            value={values.emergency_contact_1_phone}
                                            onChange={handleChange}
                                            error={getError('emergency_contact_1_phone')}
                                        />
                                    </div>

                                    <div className="col-span-12 md:col-span-6">
                                        <Form
                                            type="text"
                                            label="Endereço"
                                            name="emergency_contact_1_address"
                                            value={values.emergency_contact_1_address}
                                            onChange={handleChange}
                                            error={getError('emergency_contact_1_address')}
                                        />
                                    </div>

                                    <div className="col-span-12 md:col-span-6">
                                        <Form
                                            type="text"
                                            label="Fax"
                                            name="emergency_contact_1_fax"
                                            value={values.emergency_contact_1_fax}
                                            onChange={handleChange}
                                            error={getError('emergency_contact_1_fax')}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* STEP 7 - Emergência 2 */}
                        {step === 7 && (
                            <>
                                <div className="text-lg font-semibold mt-2 mb-3 text-gray-700 dark:text-gray-200">
                                    Contato de Emergência 2
                                </div>
                                <div className="grid grid-cols-12 gap-6">
                                    <div className="col-span-12 md:col-span-4">
                                        <Form
                                            type="text"
                                            label="Nome"
                                            name="emergency_contact_2_name"
                                            value={values.emergency_contact_2_name}
                                            onChange={handleChange}
                                            error={getError('emergency_contact_2_name')}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-4">
                                        <Form
                                            type="select"
                                            label="Relação"
                                            name="emergency_contact_2_relationship"
                                            value={values.emergency_contact_2_relationship}
                                            onChange={handleChange}
                                            error={getError('emergency_contact_2_relationship')}
                                            options={[
                                                { value: 'pai', label: 'Pai' },
                                                { value: 'mae', label: 'Mãe' },
                                                { value: 'irmao', label: 'Irmão (a)' },
                                                { value: 'tio', label: 'Tio (a)' },
                                                { value: 'conjuge', label: 'Cônjuge' },
                                                { value: 'filho', label: 'Filho (a)' },
                                                { value: 'amigo', label: 'Amigo (a)' },
                                                { value: 'outro', label: 'Outro (a)' },
                                            ]}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-4">
                                        <Form
                                            type="text"
                                            label="Telefone"
                                            name="emergency_contact_2_phone"
                                            value={values.emergency_contact_2_phone}
                                            onChange={handleChange}
                                            error={getError('emergency_contact_2_phone')}
                                        />
                                    </div>

                                    <div className="col-span-12 md:col-span-6">
                                        <Form
                                            type="text"
                                            label="Endereço"
                                            name="emergency_contact_2_address"
                                            value={values.emergency_contact_2_address}
                                            onChange={handleChange}
                                            error={getError('emergency_contact_2_address')}
                                        />
                                    </div>

                                    <div className="col-span-12 md:col-span-6">
                                        <Form
                                            type="text"
                                            label="Fax"
                                            name="emergency_contact_2_fax"
                                            value={values.emergency_contact_2_fax}
                                            onChange={handleChange}
                                            error={getError('emergency_contact_2_fax')}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* STEP 8 - Seguro */}
                        {step === 8 && (
                            <>
                                <div className="text-lg font-semibold mt-2 mb-3 text-gray-700 dark:text-gray-200">
                                    Informações do Seguro
                                </div>
                                <div className="grid grid-cols-12 gap-6">
                                    <div className="col-span-12 md:col-span-4">
                                        <Form
                                            type="text"
                                            label="Nome da Seguradora"
                                            name="insurance_name"
                                            value={values.insurance_name}
                                            onChange={handleChange}
                                            error={getError('insurance_name')}
                                        />
                                    </div>

                                    <div className="col-span-12 md:col-span-4">
                                        <Form
                                            type="text"
                                            label="Número do Seguro"
                                            name="insurance_number"
                                            value={values.insurance_number}
                                            onChange={handleChange}
                                            error={getError('insurance_number')}
                                        />
                                    </div>

                                    <div className="col-span-12 md:col-span-4">
                                        <Form
                                            type="text"
                                            label="Provedor do Seguro"
                                            name="insurance_provider"
                                            value={values.insurance_provider}
                                            onChange={handleChange}
                                            error={getError('insurance_provider')}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* navigation buttons */}
                        <div className="flex items-center justify-between mt-6">
                            <div>
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 transition"
                                    >
                                        &larr; Anterior
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-3">
                                {step < 8 && (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition"
                                    >
                                        Próximo
                                    </button>
                                )}

                                {step === 8 && (
                                    <button
                                        type="submit"
                                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                                    >
                                        Criar Paciente
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
