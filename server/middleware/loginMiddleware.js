import {extractLoginCredentials, getClientByEmail, verifyCredentials} from '../services/loginService.js'

export default async function loginMiddleware(req, res, next) {
    try {
        const client = await extractLoginCredentials(req)
        const dbClient = await getClientByEmail(client.email);

        await verifyCredentials(client, dbClient[0])
        req.user = dbClient[0];
        next()
    } catch (error) {
        console.log(error.message);
        if(error.code)
            res.status(error.code).json({ error: error.type });
        res.status(500).json({ error: "INTERNAL_ERROR"});
    }
}