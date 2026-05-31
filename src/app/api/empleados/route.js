import pool from '../../../lib/db';
// AHORA sí, todas las funciones usan el mismo pool
export async function GET() {
    try {
        const result = await pool.query('SELECT * FROM empleado ORDER BY emp_id DESC');
        return Response.json({ success: true, empleados: result.rows });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

// ... resto del código

// POST - Crear
export async function POST(request) {
    try {
        const body = await request.json();
        const { emp_cedula, emp_nombre, emp_apellido, emp_direccion, emp_telefono, emp_tipo_sangre, emp_sueldo } = body;

        const result = await pool.query(
            `INSERT INTO empleado (emp_cedula, emp_nombre, emp_apellido, emp_direccion, emp_telefono, emp_tipo_sangre, emp_sueldo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [emp_cedula, emp_nombre, emp_apellido, emp_direccion, emp_telefono, emp_tipo_sangre, emp_sueldo]
        );

        return Response.json({ success: true, empleado: result.rows[0] });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT - Actualizar (el ID va en el body)
export async function PUT(request) {
    try {
        const body = await request.json();
        const { emp_id, emp_cedula, emp_nombre, emp_apellido, emp_direccion, emp_telefono, emp_tipo_sangre, emp_sueldo } = body;

        const result = await pool.query(
            `UPDATE empleado SET emp_cedula=$1, emp_nombre=$2, emp_apellido=$3, emp_direccion=$4, emp_telefono=$5, emp_tipo_sangre=$6, emp_sueldo=$7 
       WHERE emp_id=$8 RETURNING *`,
            [emp_cedula, emp_nombre, emp_apellido, emp_direccion, emp_telefono, emp_tipo_sangre, emp_sueldo, emp_id]
        );

        return Response.json({ success: true, empleado: result.rows[0] });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - Eliminar (el ID va en el body)
export async function DELETE(request) {
    try {
        const body = await request.json();
        const { emp_id } = body;

        await pool.query('DELETE FROM empleado WHERE emp_id=$1', [emp_id]);

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}