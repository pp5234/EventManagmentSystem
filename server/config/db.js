import mysql2 from "mysql2/promise";


const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
})

export async function DbConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection successful!')
        connection.release();
    } catch (error) {
        throw error;
    }
}
export default pool




