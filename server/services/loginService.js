import pool from "../config/db.js";
import bcrypt from 'bcrypt';
import {BadRequestError, NotFoundError, UnauthorizedError} from "../utils/appErrors.js";

export async function extractLoginCredentials(req) {
    const results = { name: req.body.name, surname: req.body.surname, email: req.body.email, password: req.body.password}
    if (!results.name || !results.surname || !results.email || !results.password)
        throw new BadRequestError("Invalid credentials");
    return results;
}

export async function getClientByEmail (email) {
        const [rows] = await pool.query('SELECT * FROM client WHERE email = ?', [email]);
        if(!rows.length > 0)
            throw new NotFoundError("User doesn't exist for email: " + email);
        return rows;
}

export async function verifyCredentials(credentials, dbCredentials) {
    const match = await bcrypt.compare(credentials.password, dbCredentials.password)
    if (!match)
        throw new UnauthorizedError ('Password not match');
    if (!(credentials.name === dbCredentials.name && credentials.surname === dbCredentials.surname))
        throw new UnauthorizedError('Name isn\'t valid');
    if (dbCredentials.status === 0)
        throw new UnauthorizedError("User has inactive status");
}
