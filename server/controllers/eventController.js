import {
    addDislikeEvent, addLikeEvent,
    createEvent,
    deleteEvent,
    getEvent,
    getEventById,
    incrementEventView, removeDislikeEvent, removeLikeEvent,
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
        if(!capacity || capacity < 1)
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

        let viewedEvents = req.cookies.viewed_events ? JSON.parse(req.cookies.viewed_events) : [];
        let eventReaction = req.cookies.event_reactions ? JSON.parse(req.cookies.event_reactions) : {};
        let commentsReactions = req.cookies.comments_reactions ? JSON.parse(req.cookies.comments_reactions) : {};

        let currentEventReaction = eventReaction[id]

        if (!viewedEvents.includes(id)) {
            await incrementEventView(id);
            viewedEvents.push(id);
            res.cookie('viewed_events', JSON.stringify(viewedEvents), { maxAge: 1000 * 60 * 60 * 24  * 356, httpOnly: true });
        }

        const result = await getEventById(id)

        for (const comment of result.comments) {
            const commentId = comment.comment_id
            if (commentId in commentsReactions)
                result.commentsReactions[commentId] = commentsReactions[commentId]
        }

        if(currentEventReaction)
            result.eventReaction = currentEventReaction

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

        const { result, resultTags } = await updateEvent(id, title, description, location, start_date, category, tags)
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
        const reactions = req.cookies.event_reactions ? JSON.parse(req.cookies.event_reactions) : {};
        if(reactions[id] === "like")
            return next(new BadRequestError("Event is already liked"))
        else if (reactions[id] === "dislike") {
            await removeDislikeEvent(id)
            delete reactions[id]
        }
        await addLikeEvent(id)
        reactions[id] = "like"
        res.cookie('event_reactions', JSON.stringify(reactions), { httpOnly: true, maxAge: 1000 * 60 * 60 * 24  * 356 })
        return res.sendStatus(204)
    }
    catch (err) {
        next(err)
    }
}

export async function dislikeEventController(req, res, next) {
    try {
        const id = req.params.id
        let reactions = req.cookies.event_reactions ? JSON.parse(req.cookies.event_reactions) : {};
        if(reactions[id] === "dislike")
            return next(new BadRequestError("Event is already disliked"))
        else if (reactions[id] === "like") {
            await removeLikeEvent(id)
            delete reactions[id]
        }
        await addDislikeEvent(id)
        reactions[id] = "dislike"
        res.cookie('event_reactions', JSON.stringify(reactions), { httpOnly: true, maxAge: 1000 * 60 * 60 * 24  * 356 })
        return res.sendStatus(204)
    }
    catch (err) {
        next(err)
    }
}
