import React from 'react';

function LoadingSpinner({
    message = 'Carregando...'
}) {
    return (

        <div className="flex justify-center items-center gap-3 py-10">

            <div
                className="
                    w-6
                    h-6
                    border-4
                    border-purple-600
                    border-t-transparent
                    rounded-full
                    animate-spin
                "
            />

            <span className="text-gray-500 text-sm">
                {message}
            </span>

        </div>

    );
}

export default LoadingSpinner;