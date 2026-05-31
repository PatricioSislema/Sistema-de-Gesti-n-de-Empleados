import pool from '@/lib/db';

export async function POST(request) {
    try {
        console.log('1. Solicitud recibida en /api/login');

        const body = await request.json();
        console.log('2. Body recibido:', body);

        const { correo, clave } = body;

        // Validar campos vacíos
        if (!correo || !clave) {
            console.log('3. Error: Campos vacíos');
            return Response.json({
                success: false,
                error: 'Todos los campos son obligatorios'
            }, { status: 400 });
        }

        console.log('4. Buscando usuario:', correo);

        // Intentar consultar la base de datos
        try {
            const result = await pool.query(
                'SELECT * FROM usuario WHERE usu_correo = $1 AND usu_clave = $2',
                [correo, clave]
            );

            console.log('5. Resultado de query:', result.rows);

            if (result.rows.length === 0) {
                console.log('6. Usuario no encontrado');
                return Response.json({
                    success: false,
                    error: 'Credenciales incorrectas o usuario no existe'
                }, { status: 401 });
            }

            const usuario = result.rows[0];
            console.log('7. Usuario encontrado:', usuario.usu_correo, 'Estado:', usuario.usu_estado);

            if (usuario.usu_estado !== 'A') {
                console.log('8. Usuario inactivo');
                return Response.json({
                    success: false,
                    error: 'Usuario inactivo'
                }, { status: 401 });
            }

            console.log('9. Login exitoso');
            return Response.json({
                success: true,
                message: 'Login exitoso',
                usuario: { correo: usuario.usu_correo }
            });

        } catch (dbError) {
            console.error('10. Error de base de datos:', dbError);
            return Response.json({
                success: false,
                error: 'Error en base de datos: ' + dbError.message
            }, { status: 500 });
        }

    } catch (error) {
        console.error('11. Error general:', error);
        return Response.json({
            success: false,
            error: 'Error en el servidor: ' + error.message
        }, { status: 500 });
    }
}