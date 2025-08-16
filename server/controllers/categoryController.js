import {createCategory, deleteCategory, getCategories, updateCategory} from "../services/categoryService.js";
import {BadRequestError} from "../utils/errors.js";

export async function getCategoryController(req, res, next) {
    try {
        const {page, limit} = req.query
        const results = await getCategories(page, limit)
        res.status(200).json(results)
    }
    catch (err) {
        next(err)
    }
}

export async function createCategoryController(req, res, next) {
    try {
        const {name, description} = req.body
        if (!name || !description)
         return next(new BadRequestError("Format for category is not correct"))

        const result = await createCategory(name, description)

        return res.status(201).json({ id: result.insertId })
    }
    catch (err) {
        next(err)
    }
}

export async function updateCategoryController(req, res, next) {
    try {
        const id = req.params.id
        const { name, description } = req.body
        if (id === undefined || isNaN(id))
            return next(new BadRequestError("Id for category is missing"))

        const result = await updateCategory(id, name, description)

        if(result.affectedRows === 0)
            return next(new BadRequestError("Id for category doesn't exist"))

        return res.sendStatus(204)
    }
    catch (err) {
        next(err)
    }
}

export async function deleteCategoryController(req, res, next) {
    try {
        const id = req.params.id
        if (id === undefined || isNaN(id))
            return next(new BadRequestError("Id for category is missing"))

        const result = await deleteCategory(id)

        if(result.affectedRows === 0)
            return next(new BadRequestError("Id for category doesn't exist"))

        return res.sendStatus(204)
    }
    catch (err) {
        next(err)
    }
}