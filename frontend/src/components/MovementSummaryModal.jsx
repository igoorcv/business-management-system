import React from 'react';

function MovementSummaryModal({
    open,
    summary,
    onClose,
    onConfirmClose,
    showConfirmButton = false
}) {

    if (!open) return null;

    return (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div
                className="
                    bg-white
                    rounded-lg
                    shadow-lg
                    w-[700px]
                    max-w-[95vw]
                    flex
                    flex-col
                "
            >

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-lg">

                    <h2 className="text-xl font-semibold text-gray-800">
                        Visualização de resumo
                    </h2>

                </div>

                {/* BODY */}
                <div className="w-full px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">

                    {/* RESUMO */}
                    <div className="space-y-4">

                        <h3 className="text-sm font-semibold text-gray-700">
                            Visão geral
                        </h3>

                        <div className="grid grid-cols-2 gap-4">

                            <div className="border rounded-lg p-4 bg-gray-50">
                                <div className="text-sm text-gray-500">
                                    Total de pedidos
                                </div>

                                <div className="text-2xl font-bold text-gray-800">
                                    {summary?.total_orders || 0}
                                </div>
                            </div>

                            <div className="border rounded-lg p-4 bg-gray-50">
                                <div className="text-sm text-gray-500">
                                    Faturamento
                                </div>

                                <div className="text-2xl font-bold text-green-600">
                                    R$ {Number(summary?.revenue || 0).toFixed(2)}
                                </div>
                            </div>

                        </div>

                        <div className="grid grid-cols-3 gap-4">

                            <div className="border rounded-lg p-4">
                                <div className="text-sm text-gray-500">
                                    Balcão
                                </div>

                                <div className="text-xl font-semibold">
                                    {summary?.counter_orders || 0}
                                </div>
                            </div>

                            <div className="border rounded-lg p-4">
                                <div className="text-sm text-gray-500">
                                    Retirada
                                </div>

                                <div className="text-xl font-semibold">
                                    {summary?.pickup_orders || 0}
                                </div>
                            </div>

                            <div className="border rounded-lg p-4">
                                <div className="text-sm text-gray-500">
                                    Entrega
                                </div>

                                <div className="text-xl font-semibold">
                                    {summary?.delivery_orders || 0}
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* PRODUTOS */}

                    <div>

                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Produtos mais vendidos
                        </h3>

                        <div className="space-y-2">

                            {summary?.top_products?.map((product, index) => (

                                <div
                                    key={index}
                                    className="flex justify-between border rounded px-3 py-2"
                                >

                                    <span>
                                        {product.product_name}
                                    </span>

                                    <span className="font-semibold">
                                        {product.quantity}x
                                    </span>

                                </div>

                            ))}

                        </div>

                    </div>

                    {/* ENTREGADORES */}

                    {summary?.delivery_people?.length > 0 && (

                        <div>

                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Entregadores
                            </h3>

                            <div className="space-y-3">

                                {summary.delivery_people.map((driver, index) => (

                                    <div
                                        key={index}
                                        className="border rounded-lg p-4 flex justify-between items-center"
                                    >

                                        <div>

                                            <div className="font-semibold">
                                                {driver.name}
                                            </div>

                                            <div className="text-sm text-gray-500">

                                                Comandas:

                                                {' '}

                                                {driver.order_slip_ids?.length
                                                    ? driver.order_slip_ids
                                                        .map(id => `#${id}`)
                                                        .join(', ')
                                                    : '-'}

                                            </div>

                                        </div>

                                        <div className="text-right">

                                            <div className="text-sm text-gray-500">
                                                Comissão
                                            </div>

                                            <div className="font-bold text-green-600 text-lg">
                                                R$ {Number(driver.payment || 0).toFixed(2)}
                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        </div>

                    )}

                </div>

                {/* FOOTER */}

                <div className="p-4 px-6 border-t flex justify-end gap-4">

                    <button
                        onClick={onClose}
                        className="
                            w-32
                            px-8
                            py-2
                            rounded
                            border
                            border-purple-600
                            text-purple-600
                            bg-white
                            hover:bg-purple-50
                            transition-colors
                        "
                    >
                        Fechar
                    </button>

                    {showConfirmButton && (
                        <button
                            onClick={onConfirmClose}
                            className="
                                w-32
                                px-4
                                py-2
                                rounded
                                bg-red-600
                                hover:bg-red-700
                                text-white
                            "
                        >
                            Encerrar
                        </button>
                    )}

                </div>

            </div>

        </div>

    );

}

export default MovementSummaryModal;