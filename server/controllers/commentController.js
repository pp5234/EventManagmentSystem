import {BadRequestError} from "../utils/errors.js";
import {
    addDislikeComment,
    addLikeComment,
    createComment,
    deleteComment, removeDislikeComment,
    removeLikeComment,
    updateComment
} from "../services/commentService.js";

export async function addCommentController(req, res, next) {
    try {
        const id = req.params.id
        const { name, content } = req.body;
        if(!name || !content)
            return next(new BadRequestError("Invalid field for comment"));
        if (id === undefined || isNaN(id))
            return next(new BadRequestError("Id for event is missing"))
        const result = await createComment(id, name, content);
        return res.status(201).json({ id: result.insertId })
    }
    catch (err) {
        next(err);
    }
}

export async function updateCommentController(req, res, next) {
    try {
        const id = req.params.id
        const { content } = req.body;
        if (id === undefined || isNaN(id))
            return next(new BadRequestError("Id for event is missing"))
        if(content === undefined)
            return next(new BadRequestError("No content provided"))
        const result = await updateComment(id, content);
        if(result.affectedRows === 0)
            return next(new BadRequestError("Id for event doesn't exist"))
        return res.sendStatus(204)
    }
    catch (err) {
        next(err);
    }
}

export async function deleteCommentController(req, res, next) {
    try {
        const id = req.params.id
        if (id === undefined || isNaN(id))
            return next(new BadRequestError("Id for event is missing"))
        const result = await deleteComment(id)
        if(result.affectedRows === 0)
            return next(new BadRequestError("Id for event doesn't exist"))
        return res.sendStatus(204)
    }
    catch (err) {
        next(err);
    }
}

export async function likeCommentController(req, res, next) {
    try {
        const id = req.params.id
        const reactions = req.cookies.comments_reactions ? JSON.parse(req.cookies.comments_reactions) : {};
        if(reactions[id] === "like")
            return next(new BadRequestError("Comment is already liked"))
        else if (reactions[id] === "dislike") {
            await removeDislikeComment(id)
            delete reactions[id]
        }
        await addLikeComment(id)
        reactions[id] = "like"
        res.cookie('comments_reactions', JSON.stringify(reactions), { httpOnly: true, maxAge: 1000 * 60 * 60 * 24  * 356 })
        return res.sendStatus(204)
    }
    catch (err) {
        next(err)
    }
}

export async function dislikeCommentController(req, res, next) {
    try {
        const id = req.params.id
        let reactions = req.cookies.comments_reactions ? JSON.parse(req.cookies.comments_reactions) : {};
        if(reactions[id] === "dislike")
            return next(new BadRequestError("Comment is already disliked"))
        else if (reactions[id] === "like") {
            await removeLikeComment(id)
            delete reactions[id]
        }
        await addDislikeComment(id)
        reactions[id] = "dislike"
        res.cookie('comments_reactions', JSON.stringify(reactions), { httpOnly: true, maxAge: 1000 * 60 * 60 * 24  * 356 })
        return res.sendStatus(204)
    }
    catch (err) {
        next(err)
    }
}