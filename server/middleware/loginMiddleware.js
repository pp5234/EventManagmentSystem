import { extractLoginCredentials, getClientDb, verifyPassword, isValidStatus, verifyName } from '../services/loginService.js'

export async function verifyCredentials (req, res, next) {
    try {
        const client = extractLoginCredentials(req)
        const clientDb = await getClientDb(client.email);

        verifyPassword(client.password, clientDb[0].password);
        verifyName(client.name, clientDb[0].name, client.surname, clientDb[0].surname);
        isValidStatus(clientDb[0].status);

        req.user = clientDb[0];

        next()
    } catch (error) {
        console.log(error);
    }

}