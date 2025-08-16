import pool from "../config/db.js";
import bcrypt from 'bcrypt';
import {ForbiddenError, UnauthorizedError} from "../utils/errors.js";


export async function getClientByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM client WHERE email = ?', [email]);
        if(!rows.length > 0)
            throw new UnauthorizedError("User doesn't exist for email: " + email);
        return rows[0];
}

export async function verifyLoginCredentials(credentials, dbCredentials) {
    const match = await bcrypt.compare(credentials.password, dbCredentials.password)
    if (!match)
        throw new UnauthorizedError ('Password not match');
    if (!(credentials.name === dbCredentials.name && credentials.surname === dbCredentials.surname))
        throw new UnauthorizedError('Name isn\'t valid');
    if (dbCredentials.status === 0)
        throw new ForbiddenError("User has inactive status");
}
