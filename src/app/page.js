"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorCorreo, setErrorCorreo] = useState("");
  const [errorClave, setErrorClave] = useState("");

  const validarCampos = () => {
    let valido = true;

    if (!correo.trim()) {
      setErrorCorreo("El correo electrónico es obligatorio");
      valido = false;
    } else {
      setErrorCorreo("");
    }

    if (!clave.trim()) {
      setErrorClave("La contraseña es obligatoria");
      valido = false;
    } else {
      setErrorClave("");
    }

    return valido;
  };

  const iniciarSesion = async () => {
    if (!validarCampos()) {
      return;
    }

    setCargando(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo, clave }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        Swal.fire({
          icon: "success",
          title: "Bienvenido",
          text: "Inicio de sesión exitoso",
          timer: 1500,
          showConfirmButton: false,
        });

        router.push("/menu");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Credenciales incorrectas",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error de conexión con el servidor",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      backgroundImage: "linear-gradient(135deg, #E3F2FD 0%, #B3E5FC 100%)",
      minHeight: "100vh",
      backgroundAttachment: "fixed"
    }}>
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="row w-100 justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="bg-primary text-white rounded-circle d-inline-flex p-3 mb-3">
                    <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />
                    </svg>
                  </div>
                  <h3 className="fw-bold">Sistema de Empleados</h3>
                  <p className="text-muted">Ingrese sus credenciales</p>
                </div>

                {/* Campo Correo */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Correo Electrónico</label>
                  <input
                    type="email"
                    className={`form-control form-control-lg ${errorCorreo ? "is-invalid" : ""}`}
                    placeholder="admin@empresa.com"
                    value={correo}
                    onChange={(e) => {
                      setCorreo(e.target.value);
                      if (e.target.value.trim()) setErrorCorreo("");
                    }}
                    onKeyPress={(e) => e.key === "Enter" && iniciarSesion()}
                  />
                  {errorCorreo && (
                    <div className="text-danger mt-1 small">{errorCorreo}</div>
                  )}
                </div>

                {/* Campo Contraseña */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Contraseña</label>
                  <input
                    type="password"
                    className={`form-control form-control-lg ${errorClave ? "is-invalid" : ""}`}
                    placeholder="••••••"
                    value={clave}
                    onChange={(e) => {
                      setClave(e.target.value);
                      if (e.target.value.trim()) setErrorClave("");
                    }}
                    onKeyPress={(e) => e.key === "Enter" && iniciarSesion()}
                  />
                  {errorClave && (
                    <div className="text-danger mt-1 small">{errorClave}</div>
                  )}
                </div>

                <button
                  className="btn btn-primary btn-lg w-100"
                  onClick={iniciarSesion}
                  disabled={cargando}
                >
                  {cargando ? "Ingresando..." : "Iniciar Sesión"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
