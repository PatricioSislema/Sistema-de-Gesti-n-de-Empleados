"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "../components/Navbar";

export default function Menu() {
    const router = useRouter();

    // Verificar autenticación
    useEffect(() => {
        const usuario = localStorage.getItem("usuario");
        if (!usuario) {
            router.push("/");
        }
    }, []);

    const irAEmpleados = () => {
        router.push("/empleados");
    };

    const irAContacto = () => {
        window.location.href = "mailto:kurtsislema@hotmail.com";
    };

    return (
        <div style={{
            backgroundImage: "linear-gradient(135deg, #E3F2FD 0%, #B3E5FC 100%)",
            minHeight: "100vh"
        }}>
            <Navbar />

            <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "calc(100vh - 76px)" }}>
                <div className="row w-100 justify-content-center">
                    <div className="col-md-10 col-lg-8">
                        <div className="text-center mb-5">
                            <h1 className="display-4 fw-bold" style={{ color: "#4ad8c0" }}>Bienvenido</h1>
                            <p className="lead text-muted">Seleccione una opción para continuar</p>
                        </div>

                        <div className="row g-4">
                            {/* Botón Inicio */}
                            <div className="col-md-4">
                                <div className="card shadow-lg border-0 h-100 text-center" style={{ cursor: "pointer", transition: "transform 0.3s" }} onClick={() => router.push("/menu")}>
                                    <div className="card-body p-4">
                                        <div className="mb-3">
                                            <span style={{ fontSize: "60px" }}>🏠</span>
                                        </div>
                                        <h3 className="fw-bold">Inicio</h3>
                                        <p className="text-muted">Página principal del sistema</p>
                                    </div>
                                </div>
                            </div>

                            {/* Botón Empleados */}
                            <div className="col-md-4">
                                <div className="card shadow-lg border-0 h-100 text-center" style={{ cursor: "pointer", transition: "transform 0.3s" }} onClick={irAEmpleados}>
                                    <div className="card-body p-4">
                                        <div className="mb-3">
                                            <span style={{ fontSize: "60px" }}>👥</span>
                                        </div>
                                        <h3 className="fw-bold">Empleados</h3>
                                        <p className="text-muted">Gestionar empleados (CRUD completo)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Botón Contacto */}
                            <div className="col-md-4">
                                <div className="card shadow-lg border-0 h-100 text-center" style={{ cursor: "pointer", transition: "transform 0.3s" }} onClick={irAContacto}>
                                    <div className="card-body p-4">
                                        <div className="mb-3">
                                            <span style={{ fontSize: "60px" }}>📧</span>
                                        </div>
                                        <h3 className="fw-bold">Contacto</h3>
                                        <p className="text-muted">Enviar correo al soporte técnico</p>
                                        <small className="text-info">kurtsislema@hotmail.com</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}