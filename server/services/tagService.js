import pool from "../config/db.js";
import db from "../config/db.js";


export async function getTag(page = 1, limit = 10) {
    page = Math.max(1, Number(page) || 1)
    limit = Math.max(1, Number(limit) || 10)

    const offset = (page -  1) * limit

    const countSql = 'SELECT COUNT(*) AS total FROM tag'
    const sql = 'SELECT * FROM tag LIMIT ? OFFSET ?'

    const countRows = pool.query(countSql)
    const [rows] = await pool.query(sql, [limit, offset])


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
    }
}

export async function createTag(name) {
    const sql = "INSERT INTO tag (tag_id, name) VALUES(NULL, ?)"

    const [result] = await pool.query(sql, [name])

    return result
}

export async function deleteTag(id) {
    const sql = `DELETE FROM tag WHERE tag_id = ?`

    const [result] = await db.query(sql, [id])

    return result
}