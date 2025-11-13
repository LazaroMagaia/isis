import React from 'react';
import Select from 'react-select';

export default function Form({
    type = 'text',
    label,
    name,
    value,
    checked,
    onChange,
    options = [],
    error,
    required = false,
    className = '',
    searchable = false,
    ...rest
}) {
    const inputClasses =
        'mt-1 block w-full border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-0 ' +
        className;

    const handleSelectChange = (selected) => {
        if (type === 'select-multiple') {
            onChange({
                target: {
                    name,
                    value: selected ? selected.map((opt) => opt.value) : [],
                },
            });
        } else {
            onChange({
                target: {
                    name,
                    value: selected ? selected.value : '',
                },
            });
        }
    };

    // 🎨 Estilos personalizados do React-Select (sem bordas no hover)
    const selectStyles = {
        container: (provided) => ({
            ...provided,
            width: '100%',
        }),
        control: (provided, state) => ({
            ...provided,
            width: '100%',
            borderRadius: '0.375rem',
            border: '1px solid #d1d5db', // sempre cinza
            boxShadow: 'none',            // sem sombra
            minHeight: '2.5rem',
            backgroundColor: 'white',
            '&:hover': {
                borderColor: '#d1d5db',   // mesmo border no hover
            },
        }),
        input: (provided) => ({ ...provided, color: 'black' }),
        singleValue: (provided) => ({ ...provided, color: 'black' }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#8B57A4',
            borderRadius: '0.25rem',
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: 'white',
            fontWeight: 500,
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: 'white',
            ':hover': {
                backgroundColor: '#702E8A',
                color: 'white',
            },
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '0.375rem',
            backgroundColor: 'white',
            zIndex: 50,
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#8B57A4' : 'white',
            color: state.isFocused ? 'white' : 'black',
            cursor: 'pointer',
        }),
        placeholder: (provided) => ({ ...provided, color: '#6b7280' }),
    };

    return (
        <div className="mb-4 w-full">
            {label && type !== 'checkbox' && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* ✅ SELECT e SELECT-MULTIPLE */}
            {type === 'select' || type === 'select-multiple' ? (
                <Select
                    isMulti={type === 'select-multiple'}
                    options={options}
                    value={
                        type === 'select-multiple'
                            ? options.filter((opt) => value?.includes(opt.value))
                            : options.find((opt) => opt.value === value) || null
                    }
                    onChange={handleSelectChange}
                    placeholder="Selecione..."
                    isSearchable={searchable}
                    styles={selectStyles}
                    {...rest}
                />
            ) : type === 'textarea' ? (
                <textarea
                    name={name}
                    id={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={inputClasses}
                    rows={rest.rows || 3}
                    {...rest}
                />
            ) : type === 'radio' ? (
                <div className="flex gap-4 mt-1 flex-wrap">
                    {options.map((opt) => (
                        <label
                            key={opt.value}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                            <input
                                type="radio"
                                name={name}
                                value={opt.value}
                                checked={value === opt.value}
                                onChange={onChange}
                                required={required}
                                className="text-primary focus:ring-primary"
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
            ) : type === 'checkbox' ? (
                <label className="flex items-center space-x-2 mt-1 text-gray-700 dark:text-gray-200">
                    <input
                        type="checkbox"
                        name={name}
                        checked={checked}
                        onChange={onChange}
                        className="rounded text-primary focus:ring-primary "
                        {...rest}
                    />
                    <span>{label}</span>
                </label>
            ) : (
                <input
                    type={type}
                    name={name}
                    id={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={inputClasses}
                    {...rest}
                />
            )}

            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}
