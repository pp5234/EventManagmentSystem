import {BadRequestError, ForbiddenError} from "../utils/errors.js";
import {changeUserStatus, createUser, deleteUser, getUsers, updateUser} from "../services/userService.js";


export async function getUserController(req, res, next) {
    try {
        const { page, limit } = req.query;
        const result = await getUsers(page, limit)

        return res.status(200).json(result)
    }
    catch (err) {
        next(err);
    }
}

export async function createUserController(req, res, next) {
    try {
        const {email, name, surname, type, password } = req.body

        if (!email || !name || !surname || !password || !type)
            return next(new BadRequestError("Missing required field"))
        if (password.length < 8)
            return next(new BadRequestError("Password must be at least 8 characters"))

        const result = await createUser(email.trim(), name.trim(), surname.trim(), type.trim(), password)

        return res.status(201).json({ id: result.insertId })
    }
    catch (err) {
        next(err);
    }
}

export async function updateUserController(req, res, next) {
    try {
        const id = req.params.id
        const {email, name, surname, type, password} = req.body
        if(id === undefined || isNaN(id))
            return next(new BadRequestError("User id is undefined"))

        await updateUser(id, email, name, surname, type, password)

        return res.sendStatus(204)

    }
    catch(err) {
        next(err);
    }
}

export async function changeUserStatusController(req, res, next) {
    try {
        const id = req.params.id

        if(id === undefined || isNaN(id))
            return next(new BadRequestError("User id is undefined"))

        await changeUserStatus(id)

        return res.sendStatus(204)
    }
    catch (err) {
        next(err);
    }
}

export async function deleteUserController(req, res, next) {
    try {
        const id = req.params.id
        if(id === undefined || isNaN(id))
            return next(new BadRequestError("User id is undefined"))

        await deleteUser(id)

        return res.sendStatus(204)
    }
    catch (err) {
        next(err);
    }
}
