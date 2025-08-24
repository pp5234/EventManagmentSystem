import pool from "../config/db.js";

export async function createRegistration(id, email) {
    const sql = `
        INSERT INTO registration (event_id, email)
        SELECT ?, ?
        FROM event
        WHERE event_id = ?
          AND capacity IS NOT NULL
          AND (SELECT COUNT(*) FROM registration WHERE event_id = ?) < capacity;
    `;
    const [result] = await pool.query(sql, [id, email, id, id]);
    return result;
}