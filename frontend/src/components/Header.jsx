import { NavLink } from "react-router-dom";
import {
    House,
    LayoutDashboard,
    Users,
    ShoppingCart,
    Package,
    UserCircle
} from "lucide-react";

export default function Header() {
    return (
        <header className="bg-white border-b shadow-sm">

            <div className="max-w-7xl mx-auto h-16 px-8 flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold">
                        CO
                    </div>

                    <div>

                        <h1 className="font-bold text-gray-800">
                            Comandei
                        </h1>

                        <p className="text-xs text-gray-500">
                            Gestão de pedidos
                        </p>

                    </div>

                </div>

                <nav className="flex gap-2">

                    <NavLink
                        to="/"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-100 transition"
                    >
                        <House size={18} />
                        Página inicial
                    </NavLink>
                    
                    {/*
                    <NavLink
                        to="/"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-100 transition"
                    >
                        <LayoutDashboard size={18} />
                        Dashboard
                    </NavLink>
                    */}

                    <NavLink
                        to="/clients"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-100 transition"
                    >
                        <Users size={18} />
                        Clientes
                    </NavLink>

                    {/*
                    <NavLink
                        to="/orders"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-100 transition"
                    >
                        <ShoppingCart size={18} />
                        Pedidos
                    </NavLink>
                    */}

                    <NavLink
                        to="/products"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-100 transition"
                    >
                        <Package size={18} />
                        Produtos
                    </NavLink>

                </nav>

                <button
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
                >
                    <UserCircle size={24} />

                    Cristiano
                </button>

            </div>

        </header>
    );
}