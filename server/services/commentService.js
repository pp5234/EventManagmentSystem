import pool from "../config/db.js";
import {BadRequestError} from "../utils/errors.js";

export async function createComment(id, name, content) {
    const sql = 'INSERT INTO comment (name, content, event_id) VALUES (?, ?, ?)'
    const [result] = await pool.query(sql, [name, content, id])
    return result
}

export async function deleteComment(id) {
    const sql = 'DELETE FROM comment WHERE comment_id = ?';
    const [result] = await pool.query(sql, [id]);
    return result
}

export async function updateComment(id, content) {
    const sql  = `UPDATE comment SET content = ? WHERE comment_id = ?`
    const [result] = await pool.query(sql, [content, id])
    return result
}

export async function addLikeComment(id) {
    await pool.query("UPDATE comment SET likes = likes + 1 WHERE comment_id = ?", [id]);
}

export async function removeLikeComment(id) {
    await pool.query("UPDATE comment SET likes = likes - 1 WHERE comment_id = ?", [id]);
}

export async function addDislikeComment(id) {
    await pool.query("UPDATE comment SET dislikes = dislikes + 1 WHERE comment_id = ?", [id]);
}

export async function removeDislikeComment(id) {
    await pool.query("UPDATE comment SET dislikes = dislikes - 1 WHERE comment_id = ?", [id]);
}
