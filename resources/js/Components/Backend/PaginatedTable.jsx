import { Link } from '@inertiajs/react';

export default function PaginatedTable({ columns, data, links }) {
    return (
        <div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className={`px-6 py-3 text-${col.align || 'left'} text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data.length > 0 ? (
                        data.map((row, index) => (
                            <tr key={row.id || index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 ${col.className || ''}`}
                                    >
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                Nenhum registro encontrado.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            {links && (
                <div className="mt-4 flex justify-end space-x-2">
                    {links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                className={`px-3 py-1 rounded border ${
                                    link.active
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={index}
                                className="px-3 py-1 rounded border bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    )}
                </div>
            )}
        </div>
    );
}
