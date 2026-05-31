"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";

export default function Empleados() {
    const router = useRouter();

    // Estados para el formulario
    const [emp_cedula, setEmpCedula] = useState("");
    const [emp_nombre, setEmpNombre] = useState("");
    const [emp_apellido, setEmpApellido] = useState("");
    const [emp_direccion, setEmpDireccion] = useState("");
    const [emp_telefono, setEmpTelefono] = useState("");
    const [emp_tipo_sangre, setEmpTipoSangre] = useState("");
    const [emp_sueldo, setEmpSueldo] = useState("");

    const [empleados, setEmpleados] = useState([]);
    const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [editando, setEditando] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [errores, setErrores] = useState({});

    // Estados para el buscador
    const [buscarPor, setBuscarPor] = useState("emp_cedula");
    const [textoBusqueda, setTextoBusqueda] = useState("");

    // Paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 5;

    // Verificar autenticación
    useEffect(() => {
        const usuario = localStorage.getItem("usuario");
        if (!usuario) {
            router.push("/");
        } else {
            cargarEmpleados();
        }
    }, []);

    // Filtrar empleados en tiempo real
    useEffect(() => {
        if (textoBusqueda === "") {
            setEmpleadosFiltrados(empleados);
        } else {
            const filtrados = empleados.filter((empleado) => {
                const valor = empleado[buscarPor]?.toString().toLowerCase() || "";
                return valor.includes(textoBusqueda.toLowerCase());
            });
            setEmpleadosFiltrados(filtrados);
        }
    }, [textoBusqueda, empleados, buscarPor]);

    // Reiniciar a página 1 cuando cambia la búsqueda
    useEffect(() => {
        setPaginaActual(1);
    }, [textoBusqueda, buscarPor]);

    // Calcular paginación
    const indexUltimo = paginaActual * itemsPorPagina;
    const indexPrimero = indexUltimo - itemsPorPagina;
    const empleadosPagina = empleadosFiltrados.slice(indexPrimero, indexUltimo);
    const totalPaginas = Math.ceil(empleadosFiltrados.length / itemsPorPagina);

    // Cargar empleados desde la API
    const cargarEmpleados = async () => {
        try {
            const response = await fetch("/api/empleados");
            const data = await response.json();
            if (data.success) {
                setEmpleados(data.empleados);
                setEmpleadosFiltrados(data.empleados);
            }
        } catch (error) {
            console.error("Error al cargar empleados:", error);
        }
    };

    // Validar cédula (10 dígitos numéricos)
    const validarCedula = (cedula) => {
        return /^\d{10}$/.test(cedula);
    };

    // Guardar (crear o actualizar)
    const guardar = async () => {
        let nuevosErrores = {};

        // Validación de cédula
        if (!emp_cedula.trim()) {
            nuevosErrores.emp_cedula = "Debe ingresar la cédula";
        } else if (!validarCedula(emp_cedula)) {
            nuevosErrores.emp_cedula = "La cédula debe tener exactamente 10 dígitos numéricos";
        }

        if (!emp_nombre.trim()) {
            nuevosErrores.emp_nombre = "Debe ingresar el nombre";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(emp_nombre)) {
            nuevosErrores.emp_nombre = "El nombre solo puede contener letras";
        }

        if (!emp_apellido.trim()) {
            nuevosErrores.emp_apellido = "Debe ingresar el apellido";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(emp_apellido)) {
            nuevosErrores.emp_apellido = "El apellido solo puede contener letras";
        }

        // Validación de teléfono (opcional pero con formato)
        if (emp_telefono && !/^\d{10}$/.test(emp_telefono)) {
            nuevosErrores.emp_telefono = "El teléfono debe tener 10 dígitos";
        }

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) {
            Swal.fire({
                icon: "error",
                title: "Error de validación",
                text: "Corrija los campos marcados en rojo",
            });
            return;
        }

        const empleadoData = {
            emp_cedula,
            emp_nombre: emp_nombre.trim().toUpperCase(),
            emp_apellido: emp_apellido.trim().toUpperCase(),
            emp_direccion: emp_direccion.trim().toUpperCase(),
            emp_telefono,
            emp_tipo_sangre,
            emp_sueldo: parseFloat(emp_sueldo) || 0,
        };

        try {
            let response;
            if (editando) {
                response = await fetch("/api/empleados", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        emp_id: editandoId,
                        ...empleadoData
                    }),
                });
            } else {
                response = await fetch("/api/empleados", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(empleadoData),
                });
            }

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Correcto",
                    text: editando ? "Empleado actualizado" : "Empleado agregado",
                });
                limpiar();
                setMostrarModal(false);
                cargarEmpleados();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: data.error,
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al guardar el empleado",
            });
        }
    };

    // Eliminar empleado
    const eliminar = async (id, nombre) => {
        const result = await Swal.fire({
            title: "¿Eliminar empleado?",
            text: `¿Está seguro de eliminar a ${nombre}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch("/api/empleados", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ emp_id: id }),
                });
                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        icon: "success",
                        title: "Eliminado",
                        text: "Empleado eliminado correctamente",
                    });
                    cargarEmpleados();
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: data.error,
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Error al eliminar el empleado",
                });
            }
        }
    };

    // Editar empleado
    const editar = (empleado) => {
        setEditando(true);
        setEditandoId(empleado.emp_id);
        setEmpCedula(empleado.emp_cedula || "");
        setEmpNombre(empleado.emp_nombre || "");
        setEmpApellido(empleado.emp_apellido || "");
        setEmpDireccion(empleado.emp_direccion || "");
        setEmpTelefono(empleado.emp_telefono || "");
        setEmpTipoSangre(empleado.emp_tipo_sangre || "");
        setEmpSueldo(empleado.emp_sueldo || "");
        setMostrarModal(true);
    };

    const limpiar = () => {
        setEmpCedula("");
        setEmpNombre("");
        setEmpApellido("");
        setEmpDireccion("");
        setEmpTelefono("");
        setEmpTipoSangre("");
        setEmpSueldo("");
        setErrores({});
        setEditando(false);
        setEditandoId(null);
    };

    return (
        <div style={{
            backgroundImage: "linear-gradient(135deg, #E3F2FD 0%, #B3E5FC 100%)",
            minHeight: "100vh"
        }}>
            <Navbar />

            <div className="container mt-4 pb-5">
                {/* Buscador en tiempo real */}
                <div className="card shadow mb-4" style={{ borderTop: "4px solid #4ad8c0" }}>
                    <div className="card-body">
                        <div className="row align-items-center">
                            <div className="col-md-3 mb-3 mb-md-0">
                                <label className="form-label fw-bold">Buscar por:</label>
                                <select
                                    className="form-select"
                                    value={buscarPor}
                                    onChange={(e) => setBuscarPor(e.target.value)}
                                    style={{ borderColor: "#4ad8c0" }}
                                >
                                    <option value="emp_cedula">📄 Cédula</option>
                                    <option value="emp_nombre">👤 Nombre</option>
                                    <option value="emp_apellido">👥 Apellido</option>
                                </select>
                            </div>
                            <div className="col-md-6 mb-3 mb-md-0">
                                <label className="form-label fw-bold">Valor a buscar:</label>
                                <div className="input-group">
                                    <span className="input-group-text" style={{ backgroundColor: "#4ad8c0", color: "white" }}>
                                        🔍
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Escriba para buscar..."
                                        value={textoBusqueda}
                                        onChange={(e) => setTextoBusqueda(e.target.value)}
                                        style={{ borderColor: "#4ad8c0" }}
                                    />
                                </div>
                            </div>
                            <div className="col-md-3 text-end">
                                <button
                                    className="btn px-4"
                                    style={{ backgroundColor: "#4ad8c0", color: "white" }}
                                    onClick={() => {
                                        setTextoBusqueda("");
                                        setBuscarPor("emp_cedula");
                                    }}
                                    title="Limpiar búsqueda"
                                >
                                    🔄 Limpiar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón Agregar Empleado */}
                <div className="d-flex justify-content-end mb-3">
                    <button
                        className="btn px-4"
                        style={{ backgroundColor: "#4ad8c0", color: "white" }}
                        onClick={() => {
                            limpiar();
                            setMostrarModal(true);
                        }}
                        title="Agregar nuevo empleado"
                    >
                        ➕ Agregar Empleado
                    </button>
                </div>

                {/* Tabla de empleados */}
                <div className="card shadow">
                    <div className="card-header" style={{ backgroundColor: "#4ad8c0", color: "white" }}>
                        <h4 className="mb-0">📋 Listado de Empleados</h4>
                        <small>Mostrando {empleadosFiltrados.length} de {empleados.length} empleados</small>
                    </div>

                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                                <thead className="table-dark">
                                    <tr>
                                        <th>📄 Cédula</th>
                                        <th>👤 Nombre</th>
                                        <th>👥 Apellido</th>
                                        <th>📍 Dirección</th>
                                        <th>📞 Teléfono</th>
                                        <th>🩸 Tipo Sangre</th>
                                        <th>💰 Sueldo</th>
                                        <th>⚙️ Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {empleadosPagina.map((empleado) => (
                                        <tr key={empleado.emp_id}>
                                            <td>{empleado.emp_cedula}</td>
                                            <td>{empleado.emp_nombre}</td>
                                            <td>{empleado.emp_apellido}</td>
                                            <td>{empleado.emp_direccion}</td>
                                            <td>{empleado.emp_telefono}</td>
                                            <td>{empleado.emp_tipo_sangre}</td>
                                            <td>${empleado.emp_sueldo}</td>
                                            <td>
                                                <button
                                                    className="btn btn-warning btn-sm me-2"
                                                    onClick={() => editar(empleado)}
                                                    title="Editar empleado"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => eliminar(empleado.emp_id, empleado.emp_nombre)}
                                                    title="Eliminar empleado"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Paginador */}
                    {totalPaginas > 1 && (
                        <div className="card-footer bg-white">
                            <nav aria-label="Paginación de empleados">
                                <ul className="pagination justify-content-center mb-0">
                                    <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setPaginaActual(paginaActual - 1)}
                                            style={{ color: paginaActual === 1 ? "#6c757d" : "#4ad8c0" }}
                                        >
                                            ◀ Anterior
                                        </button>
                                    </li>

                                    {[...Array(totalPaginas)].map((_, i) => {
                                        const pagina = i + 1;
                                        if (totalPaginas <= 5 ||
                                            (pagina >= paginaActual - 2 && pagina <= paginaActual + 2)) {
                                            return (
                                                <li key={i} className={`page-item ${paginaActual === pagina ? 'active' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setPaginaActual(pagina)}
                                                        style={paginaActual === pagina ? { backgroundColor: "#4ad8c0", borderColor: "#4ad8c0" } : { color: "#4ad8c0" }}
                                                    >
                                                        {pagina}
                                                    </button>
                                                </li>
                                            );
                                        }
                                        if (pagina === paginaActual - 3 && totalPaginas > 5) {
                                            return <li key="dots1" className="page-item disabled"><span className="page-link">...</span></li>;
                                        }
                                        if (pagina === paginaActual + 3 && totalPaginas > 5) {
                                            return <li key="dots2" className="page-item disabled"><span className="page-link">...</span></li>;
                                        }
                                        return null;
                                    })}

                                    <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setPaginaActual(paginaActual + 1)}
                                            style={{ color: paginaActual === totalPaginas ? "#6c757d" : "#4ad8c0" }}
                                        >
                                            Siguiente ▶
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                            <div className="text-center mt-2">
                                <small className="text-muted">
                                    Mostrando {indexPrimero + 1} - {Math.min(indexUltimo, empleadosFiltrados.length)} de {empleadosFiltrados.length} empleados
                                </small>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {mostrarModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: "#4ad8c0", color: "white" }}>
                                <h5 className="modal-title">{editando ? "✏️ Editar Empleado" : "➕ Nuevo Empleado"}</h5>
                                <button className="btn-close btn-close-white" onClick={() => setMostrarModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">📄 Cédula *</label>
                                        <input
                                            type="text"
                                            maxLength="10"
                                            className={`form-control ${errores.emp_cedula ? "is-invalid" : ""}`}
                                            value={emp_cedula}
                                            onChange={(e) => {
                                                const soloNumeros = e.target.value.replace(/\D/g, '');
                                                setEmpCedula(soloNumeros);
                                            }}
                                            onKeyPress={(e) => {
                                                if (!/[0-9]/.test(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            placeholder="Ej: 1712345678"
                                        />
                                        <div className="invalid-feedback">{errores.emp_cedula}</div>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">👤 Nombre *</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errores.emp_nombre ? "is-invalid" : ""}`}
                                            value={emp_nombre}
                                            onChange={(e) => {
                                                const soloLetras = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                                setEmpNombre(soloLetras);
                                            }}
                                            placeholder="Ej: Juan"
                                        />
                                        <div className="invalid-feedback">{errores.emp_nombre}</div>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">👥 Apellido *</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errores.emp_apellido ? "is-invalid" : ""}`}
                                            value={emp_apellido}
                                            onChange={(e) => {
                                                const soloLetras = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                                setEmpApellido(soloLetras);
                                            }}
                                            placeholder="Ej: Perez"
                                        />
                                        <div className="invalid-feedback">{errores.emp_apellido}</div>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">📍 Dirección</label>
                                        <input
                                            className="form-control"
                                            value={emp_direccion}
                                            onChange={(e) => setEmpDireccion(e.target.value)}
                                            placeholder="Ej: Av. Amazonas N45-23"
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">📞 Teléfono</label>
                                        <input
                                            type="text"
                                            maxLength="10"
                                            className={`form-control ${errores.emp_telefono ? "is-invalid" : ""}`}
                                            value={emp_telefono}
                                            onChange={(e) => {
                                                const soloNumeros = e.target.value.replace(/\D/g, '');
                                                setEmpTelefono(soloNumeros);
                                            }}
                                            onKeyPress={(e) => {
                                                if (!/[0-9]/.test(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            placeholder="Ej: 0991234567"
                                        />
                                        <div className="invalid-feedback">{errores.emp_telefono}</div>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">🩸 Tipo de Sangre</label>
                                        <select
                                            className="form-control"
                                            value={emp_tipo_sangre}
                                            onChange={(e) => setEmpTipoSangre(e.target.value)}
                                        >
                                            <option value="">Seleccione</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">💰 Sueldo</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control"
                                            value={emp_sueldo}
                                            onChange={(e) => setEmpSueldo(e.target.value)}
                                            placeholder="Ej: 1500.50"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setMostrarModal(false)}>❌ Cancelar</button>
                                <button className="btn" style={{ backgroundColor: "#4ad8c0", color: "white" }} onClick={guardar}>
                                    {editando ? "💾 Actualizar" : "💾 Guardar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


