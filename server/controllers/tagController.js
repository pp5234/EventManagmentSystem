import {createTag, deleteTag, getTag} from "../services/tagService.js";
import {BadRequestError} from "../utils/errors.js";


export async function getTagController(req, res, next) {
    try {
        const {page, limit} = req.query
        const result  = await getTag(page, limit)
        return res.status(200).send(result)
    }
    catch (err) {
        next(err)
    }
}

export async function createTagController(req, res, next) {
    try {
        const name = req.body.name
        if(!name)
            return  next(new BadRequestError("Name is missing"))
        const result = await createTag(name)

        return res.status(201).send({ id: result.insertId })
    }
    catch (err) {
        next(err)
    }
}

export async function deleteTagController(req, res, next) {
    try {
        const id = req.params.id
        if(id === undefined || isNaN(id))
            return next(new BadRequestError("Id for category is missing"))

        const result = await deleteTag(id)

        if(result.affectedRows === 0)
            return next(new BadRequestError("Id for tag doesn't exist"))

        return res.sendStatus(204)
    }
    catch (err) {
        next(err)
    }
}
