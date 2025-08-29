import pool from "../config/db.js";
import {ForbiddenError} from "../utils/errors.js";

export async function createRegistration(id, email, user) {
    const [sqlUser] = await pool.query("SELECT * FROM client WHERE email = ?", [email]);
    if (sqlUser.length > 0 && (user === undefined || sqlUser[0].email !== user.email))
        throw new ForbiddenError("Only logged user with that email can register")

    const sql = `
        INSERT INTO registration (event_id, email)
        SELECT ?, ?
        FROM event
        WHERE event_id = ?
          AND (
            capacity IS NULL
            OR (SELECT COUNT(*) FROM registration WHERE event_id = ?) < capacity
            );
    `;
    const [result] = await pool.query(sql, [id, email, id, id]);
    return result;
}