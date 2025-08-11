import pool from "../config/db.js";
import bcrypt from 'bcrypt';

export function extractLoginCredentials(req) {
    const results = { name: req.body.name, surname: req.body.surname, email: req.body.email, password: req.body.password }
    if (!results.name || !results.surname || !results.email || !results.password)
        throw Error("Requst body is in the bad format")
    return results;
}

export async function getClientDb (email) {
        const [rows] = await pool.query('SELECT * FROM client WHERE email = ?', [email]);
        if(!rows.length > 0)
            throw  Error("Failed to retrieve user from the database")
        return rows;
}

export async function verifyPassword (password, hashedPassword) {
    if (!await bcrypt.compare(password, hashedPassword))
        throw Error('Password not match');
}

export function verifyName (name, surname, nameDb, surnameDb) {
    if (!(name === nameDb && surname === surnameDb))
        throw Error('Name isn\'t valid');
}

export function isValidStatus(statusDb){
    if (statusDb === 0)
        throw Error('User\'s status is disabled');
}
