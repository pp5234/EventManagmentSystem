import db from "../config/db.js";
import pool from "../config/db.js";
import {BadRequestError} from "../utils/errors.js";


export async function getCategories(page = 1, limit = 10) {
    page = Math.max(1,  Number(page) || 1)
    limit = Math.max(1, Number(limit) || 10)

    const offset =  (page - 1) * limit

    const sql = `SELECT * FROM category LIMIT ? OFFSET ?`
    const countSql = 'SELECT COUNT(*) AS total FROM category';

    const [countRows] = await pool.query(countSql);
    const [rows] = await db.query(sql, [limit, offset])

    const total = Number((countRows[0] && countRows[0].total) || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

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

export async function createCategory(name, description) {
    const sql = `INSERT INTO category (category_id, name, description) VALUES(NULL, ?, ?)`

    const [result] = await db.query(sql, [name, description])

    return result
}

export async function updateCategory(id, name, description) {
    const updates = []
    const values = []

    if (name) {
        updates.push("name = ?")
        values.push(name)
    }
    if (description) {
        updates.push("description = ?")
        values.push(description)
    }

    if (updates.length === 0)
        throw new BadRequestError('No fields provided for update.');

    values.push(id)

    const sql  = `UPDATE category SET ${updates.join(', ')} WHERE category_id = ?`
    const [result] = await db.query(sql, values)

    return result
}

export async function deleteCategory(id) {
    const sql = `DELETE FROM category WHERE category_id = ?`
    const [result] = await db.query(sql, [id])

    return result
}