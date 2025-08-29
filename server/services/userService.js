import pool from "../config/db.js";
import {BadRequestError, ForbiddenError, NotFoundError} from "../utils/errors.js";
import {hashPassword} from "../utils/bcrypt.js";


export async function getUsers(page = 1, limit = 10) {
    page = Math.max(1, Number(page) || 1);
    limit = Math.max(1, Number(limit) || 10);

    const offset = (page - 1) * limit;

    const countSql = 'SELECT COUNT(*) AS total FROM client';
    const listSql  = `
        SELECT user_id, name, surname, email, type, status
        FROM client
        ORDER BY user_id ASC
        LIMIT ? OFFSET ?`;

    const [countRows] = await pool.query(countSql);
    const total = Number((countRows[0] && countRows[0].total) || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const [rows] = await pool.query(listSql, [limit, offset]);

    return {
        data: rows,
        pagination: {
            totalItems: total,
            totalPages: totalPages,
            currentPage: page,
            limit: limit
        }
    };
}

export async function createUser(email, name, surname, type, password) {

    const sql = `INSERT INTO client (email, name, surname, type, status, password) VALUES (?, ?, ?, ?, ?, ?)`;
    const status = 1;
    const hashed = await hashPassword(password);
    const [result] = await pool.query(sql, [email, name, surname, type, status, hashed]);

    return result
}

export async function updateUser(id, email, name, surname, type, password) {
    const updates = [];
    const values = [];

    if (email) {
        if(!isValidEmail(email))
            throw new BadRequestError("Invalid email address");
        updates.push('email = ?');
        values.push(email);
    }
    if (name) {
        updates.push('name = ?');
        values.push(name);
    }
    if (surname) {
        updates.push('surname = ?');
        values.push(surname);
    }
    if (type) {
        updates.push('type = ?');
        values.push(type);
    }
    if (password) {
        if(password.length < 8)
            throw new BadRequestError("Password must be at least 8 characters");
        updates.push('password = ?');
        values.push(await hashPassword(password));
    }

    if (updates.length === 0)
        throw new BadRequestError("No fields provided")

    const [row] = await pool.query("SELECT type FROM client WHERE user_id = ?;", [id]);
    if (row[0].type === "ADMIN" && row[0].type !== type)
        throw new ForbiddenError("You cannot change role to an admin user.")

    const sql = `UPDATE client SET ${updates.join(', ')} WHERE user_id = ?`;
    values.push(id);

    const [result] = await pool.query(sql, values);

    return result;
}

export async function changeUserStatus(id) {
    const [row] = await pool.query("SELECT type FROM client WHERE user_id = ?;", [id]);
    if (row[0].type !== "EVENT_CREATOR")
        throw new ForbiddenError("You cannot change status to an admin user.")

    const [result] = await pool.query(`UPDATE client SET status = !status WHERE user_id = ? && type = 'EVENT_CREATOR'`, id)
    return result
}

export async function deleteUser(id) {
    const [rows] = await pool.query("SELECT type FROM client WHERE user_id = ?;", [id]);
    if (rows.length === 0) {
        throw new NotFoundError("User not found.");
    }
    if (rows[0].type !== "EVENT_CREATOR") {
        throw new ForbiddenError("You cannot delete an admin user.");
    }
    const [result] = await pool.query(`DELETE FROM client WHERE user_id = ?`, [id]);
    return result;
}

export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}




