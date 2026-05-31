import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres',     // Cambia si tu usuario es diferente
    password: '515l3m4k3ll', // Tu contraseña de PostgreSQL
    host: 'localhost',
    port: 5432,
    database: 'empleado',
});

export default pool;