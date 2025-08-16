import {generateJwt} from "../utils/jwt.js";
import {getClientByEmail, verifyLoginCredentials} from "../services/loginService.js";
import {BadRequestError} from "../utils/errors.js";

    export default async function loginController (req, res, next) {
        try {
            if (!req.body.email || !req.body.password) {
                return next(new BadRequestError("Email and password are required."))
            }
            const dbClient = await getClientByEmail(req.body.email);
            await verifyLoginCredentials(req.body, dbClient)

            const tokenPayload = {
                id: dbClient.user_id,
                email: dbClient.email,
                name: dbClient.name,
                surname: dbClient.surname,
                type: dbClient.type
            };

            const token = generateJwt(tokenPayload);
            res.status(200).json({jwt: token, user: tokenPayload });

        } catch (err) {
            next(err)
        }
    }