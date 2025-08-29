import {BadRequestError} from "../utils/errors.js";
import {createRegistration} from "../services/registrationService.js";
import {verifyTokenGraceful} from "../middleware/authMiddleware.js";
import {isValidEmail} from "../services/userService.js";

export async function registrationController(req, res, next) {
    const id = req.params.id;
    const { email } = req.body;
    if (!email && !isValidEmail(email))
        return next(new BadRequestError(`No email provided for registration`));
    verifyTokenGraceful(req)
    const result = await createRegistration(id, email, req.user)
    if(result.affectedRows === 0)
        return next(new BadRequestError(`Id for event not found`));
    return res.sendStatus(204);
}