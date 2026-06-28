import React from 'react';

function Pagination({
    currentPage,
    totalPages,
    onPageChange
}) {

    if (totalPages <= 1) return null;

    return (

        <div className="flex justify-between items-center mt-6">

            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="
                    px-4
                    py-2
                    border
                    rounded
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    hover:bg-gray-100
                "
            >
                Anterior
            </button>

            <span className="text-gray-600">
                Página {currentPage} de {totalPages}
            </span>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="
                    px-4
                    py-2
                    border
                    rounded
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    hover:bg-gray-100
                "
            >
                Próxima
            </button>

        </div>

    );
}

export default Pagination;