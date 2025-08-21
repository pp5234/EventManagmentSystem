import {
    addDislike, addLike,
    createEvent,
    deleteEvent,
    getEvent,
    getEventById,
    incrementEventView, removeDislike, removeLike,
    updateEvent
} from "../services/eventService.js";
import {verifyTokenGraceful} from "../middleware/authMiddleware.js";
import {BadRequestError} from "../utils/errors.js";

export async function getEventController(req, res, next) {
    try {
        let option = 1
        if(verifyTokenGraceful(req)) {
            option = 0
        }
        const { page, limit } = req.query
        const result = await getEvent(page, limit, option)
        return res.status(200).json(result)
    }
    catch (err) {
        next(err)
    }
}

export async function getEventPopularController(req, res, next) {
    try {
        const result = await getEvent(null, null, 2)
        return res.status(200).json(result)
    }
    catch (err) {
        next(err)
    }
}

export async function getEventByReactionsController(req, res, next) {
    try {
        const result = await getEvent(null, null,6)
        return res.status(200).json(result)
    }
    catch (err) {
        next(err)
    }
}

export async function getEventByCategoryController(req, res, next) {
    try {
        const  categoryId = req.params.id
        const { page, limit } = req.query
        const result = await getEvent(page, limit, 3, categoryId)
        return res.status(200).json(result)
    }
    catch (err) {
        next(err)
    }
}

export async function getEventByTagController(req, res, next) {
    try {
        const  tagId = req.params.id
        const { page, limit } = req.query
        const result = await getEvent(page, limit, 4, tagId)
        return res.status(200).json(result)
    }
    catch (err) {
        next(err)
    }
}

export async function getEventByQueryController(req, res, next) {
    try {
        const  query = req.params.query
        const { page, limit } = req.query
        const result = await getEvent(page, limit, 5, query)
        return res.status(200).json(result)
    }
    catch (err) {
        next(err)
    }
}

export async function createEventController(req, res, next) {
    try{
        let { title, description, category, location, start_date, capacity, tags } = req.body
        const author = req.user.id
        if(!title || !description || !category || !location || !start_date){
            return next(new BadRequestError('Incorrect form for event'))
        }
        if(!capacity)
           capacity = null

        const result = await createEvent(title, description, author, category, location, start_date, capacity, tags)

        return res.status(201).json( { id: result.insertId } )
    }
    catch (err) {
        next(err)
    }
}

export async function getEventByIdController(req, res, next) {
    try {
        const id = req.params.id
        if(id === undefined || isNaN(id))
            return next(new BadRequestError("Id for event is missing"))
        await incrementEventView(id)
        const result = await getEventById(id)
        return res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}

export async function updateEventController(req, res, next) {
    try {
        const id = req.params.id
        const { title, description, location, start_date, category, tags } = req.body
        if(id === undefined || isNaN(id))
            return next(new BadRequestError("Id for event is missing"))

        const [result, resultTags] = updateEvent(id, title, description, location, start_date, category, tags)

        if(result.affectedRows === 0 && resultTags === 0)
            return next(new BadRequestError('Cannot delete event for this id'))

        return res.sendStatus(204)
    } catch (err) {
        next(err)
    }
}

export async function deleteEventController(req, res, next) {
    try {
        const id = req.params.id
        if(id === undefined || isNaN(id))
            return next(new BadRequestError("Id for event is missing"))
        const result = await deleteEvent(id)
        if(result.affectedRows === 0)
            return next(new BadRequestError('Cannot delete event for this id'))
        return res.sendStatus(204)
    } catch (err) {
        next(err)
    }
}

export async function likeEventController(req, res, next) {
    try {
        const id = req.params.id
        const reaction = null
        if(reaction === "LIKE")
            return next(new BadRequestError("Event is already liked"))
        else if (reaction === "DISLIKE")
            await removeDislike(id)
        await addLike(id)
        return res.sendStatus(204)
    }
    catch (err) {
        next(err)
    }
}

export async function dislikeEventController(req, res, next) {
    try {
        const id = req.params.id
        const reaction = null
        if(reaction === "DISLIKE")
            return next(new BadRequestError("Event is already liked"))
        else if (reaction === "LIKE")
            await removeLike(id)
        await addDislike(id)
        return res.sendStatus(204)
    }
    catch (err) {
        next(err)
    }
}
