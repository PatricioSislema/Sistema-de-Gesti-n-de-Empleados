"use client";

import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Navbar() {
    const router = useRouter();

    const cerrarSesion = () => {
        Swal.fire({
            title: "¿Cerrar sesión?",
            text: "¿Está seguro que desea salir?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, salir",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("usuario");
                router.push("/");
                Swal.fire({
                    icon: "success",
                    title: "Sesión cerrada",
                    text: "Ha salido del sistema",
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        });
    };

    const irAInicio = () => {
        router.push("/menu");
    };

    const irAEmpleados = () => {
        router.push("/empleados");
    };

    const irAContacto = () => {
        window.location.href = "mailto:kurtsislema@hotmail.com";
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark shadow" style={{ backgroundColor: "#4ad8c0" }}>
            <div className="container">
                <a className="navbar-brand fw-bold fs-4" href="#" onClick={irAInicio}>
                    🏢 Sistema de Gestión de Empleados
                </a>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <button className="nav-link btn text-white fw-semibold" onClick={irAInicio}>
                                Inicio
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link btn text-white fw-semibold" onClick={irAEmpleados}>
                                Empleados
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link btn text-white fw-semibold" onClick={irAContacto}>
                                Contacto
                            </button>
                        </li>
                        <li className="nav-item ms-2">
                            <button className="btn btn-light btn-sm" onClick={cerrarSesion}>
                                Cerrar Sesión
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}