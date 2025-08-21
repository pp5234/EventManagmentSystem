import pool from "../config/db.js";
import {BadRequestError, NotFoundError} from "../utils/errors.js";
import * as sqlite from "node:sqlite";

export async function getEvent(page = 1, limit = 10, option, filter) {
    const { query, countQuery, params, isSimple } = prepareEventQueries(option, filter);

    if (isSimple) {
        const [rows] = await pool.query(query);
        return rows;
    }

    page = Math.max(1, Number(page) || 1);
    limit = Math.max(1, Number(limit) || 10);
    const offset = (page - 1) * limit;

    const dataParams = [...params, limit, offset];
    const countParams = [...params];

    const [[rows], [[countResult]]] = await Promise.all([
        pool.query(query, dataParams),
        pool.query(countQuery, countParams)
    ]);

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
        data: rows,
        pagination: {
            totalItems: total,
            totalPages: totalPages,
            currentPage: page,
            limit: limit
        }
    };
}
export async function getEventById(id) {

    const mainEventSql = ` SELECT e.event_id, e.title, e.description, e.location, e.start_date, e.creation_date, e.capacity,
                                e.views, e.likes, e.dislikes, c.name AS category_name, u.name AS author_name, e.category AS category_id 
                                FROM event e
                                JOIN category c ON e.category = c.category_id
                                JOIN client u ON e.author = u.user_id
                                WHERE e.event_id = ?`;

    const tagsSql = `SELECT t.tag_id, t.name
                            FROM tag t
                            JOIN event_tag et ON t.tag_id = et.tag_id
                            WHERE et.event_id = ?;`

    const commentsSql = `SELECT name, content, creation_date, likes, dislikes
                                FROM comment
                                WHERE event_id = ?
                                ORDER BY creation_date DESC;`;

    const rsvpCountSql = `SELECT COUNT(*) as rsvp_count 
                                 FROM registration 
                                 WHERE event_id = ?;`;


    const relatedEventsSql = `SELECT related_event.event_id, related_event.title, SUBSTRING(related_event.description, 1, 100) AS description,
                ( CASE WHEN related_event.category = main_event.category THEN 10 ELSE 0 END) + 
                ( SELECT COUNT(*) 
                  FROM event_tag et1
                  JOIN event_tag et2 ON et1.tag_id = et2.tag_id
                  WHERE et1.event_id = ? AND et2.event_id = related_event.event_id) AS relevance_score
                  FROM event AS main_event
                  JOIN event AS related_event ON main_event.event_id != related_event.event_id
                  WHERE main_event.event_id = ?
                  ORDER BY relevance_score DESC, related_event.views DESC 
                  LIMIT 3;`;

    try {
        const [
            mainEventResult,
            tagsResult,
            commentsResult,
            rsvpCountResult,
            relatedEventsResult
        ] = await Promise.all([
            pool.query(mainEventSql, [id]),
            pool.query(tagsSql, [id]),
            pool.query(commentsSql, [id]),
            pool.query(rsvpCountSql, [id]),
            pool.query(relatedEventsSql, [id, id])
        ]);

        const [eventRows] = mainEventResult;
        if (eventRows.length === 0) {
            throw new NotFoundError(`Event with ID ${id} not found.`);
        }
        const event = eventRows[0];

        const [tags] = tagsResult;
        const [comments] = commentsResult;
        const [rsvpCount] = rsvpCountResult;
        const [relatedEvents] = relatedEventsResult;

        const fullEventDetails = {
            ...event,
            tags: tags,
            comments: comments,
            rsvp_count: rsvpCount[0].rsvp_count,
            related_events: relatedEvents
        };

        return fullEventDetails;

    } catch (err) {
        console.error("Error fetching event by ID:", err);
        throw err;
    }
}

export async function createEvent(title, description, author, category, location, start_date, capacity, tags) {
    const connection = await pool.getConnection()
    try {
        await connection.beginTransaction()

        const sql = `INSERT INTO event (event_id, title, description, author, category, location, start_date, capacity)
                            VALUES(NULL, ?, ?, ?, ?, ?, ?, ?)`

        const isCategorySql = "SELECT category_id FROM category WHERE name = ?"
        const [categoryRow] = await connection.query(isCategorySql, [category])

        if(categoryRow.length === 0)
            throw new BadRequestError('Category not found')

        const categoryId = categoryRow[0].category_id
        const [rows] = await connection.query(sql, [title, description, author, categoryId, location, start_date, capacity]);

        if(tags !== undefined && Array.isArray(tags)) {
            for(let tagName of tags) {
                console.log("Zapocinjem proveru za tag " + tagName)
                tagName = tagName.trim()
                if(tagName === '') continue;

                const isTagSql = "SELECT tag_id FROM tag where name = ?"
                const [existingTag] = await connection.query(isTagSql, [tagName])

                let tagId

                if(existingTag.length > 0) {
                    console.log("Tag " + existingTag[0].tag_id + " postoji")
                    tagId = existingTag[0].tag_id
                }
                else {
                    console.log("Tag " + tagName + " nepostoji, kreiram ga")
                    const [newTagResult] = await connection.query("INSERT INTO tag (tag_id, name) VALUES (NULL,?)", [tagName]);
                    tagId = newTagResult.insertId;
                    console.log("Tag " + tagId + " kreiran")
                }

                const tagSql = "INSERT INTO event_tag (event_id, tag_id) VALUES (?, ?)";
                await connection.query(tagSql, [rows.insertId, tagId]);
                console.log("Kreirao vezu " + rows.insertId + " " + tagId)
            }
        }
        await connection.commit();

        return rows
    }
    catch (err) {
        await connection.rollback();
        throw err;
    }
    finally {
        connection.release();
    }

}

export async function updateEvent(id, title, description, location, start_date, category, tags) {
    const connection = await pool.getConnection()

    try {
        await connection.beginTransaction()

        const updates = []
        const values = []

        if (title) {
            updates.push("title = ?")
            values.push(title)
        }
        if(description) {
            updates.push("description = ?")
            values.push(description)
        }
        if(location) {
            updates.push("location = ?")
            values.push(location)
        }
        if(start_date) {
            updates.push("start_date = ?")
            values.push(start_date)
        }
        if(category) {
            console.log(category)
            const isCategorySql = "SELECT category_id FROM category WHERE name = ?"
            const [categoryRow] = await connection.query(isCategorySql, [category])
            console.log(categoryRow.length)
            console.log(categoryRow)
            if(categoryRow.length > 0) {
                updates.push("category = ?")
                values.push(categoryRow[0].category_id)
            }
        }
        let result = null
        let resultTag = null

        if (updates.length !== 0) {
            values.push(id)
            console.log(updates)
            console.log(values)
            const sql  = `UPDATE event SET ${updates.join(', ')} WHERE event_id = ?`
            const [result] = await connection.query(sql, values)
        }

        if(Array.isArray(tags)) {

            await connection.query(`DELETE FROM event_tag WHERE event_id = ?`, id)

            for(let tagName of tags) {
                const isTagSql = "SELECT tag_id FROM tag where name = ?"
                const [existingTag] = await connection.query(isTagSql, [tagName])
                let tagId
                if(existingTag.length > 0)
                    tagId = existingTag[0].tag_id
                else {
                    const [newTagResult] = await connection.query("INSERT INTO tag (name) VALUES (?)", [tagName]);
                    tagId = newTagResult.insertId;
                }
                const tagSql = "INSERT INTO event_tag (event_id, tag_id) VALUES (?, ?)"
                resultTag = await connection.query(tagSql, [id, tagId]);
            }

        }

        await connection.commit();

        return {result, resultTag}
    }
    catch (err) {
        await connection.rollback();
        throw err;
    }
    finally {
        connection.release();
    }
}

export async function deleteEvent(id) {
    const sql = `DELETE FROM event WHERE event_id = ?`;
    const [result] = await pool.query(sql, [id]);
    return result
}

function prepareEventQueries(number, filter) {
    let query = '';
    let countQuery = '';
    const params = [];

    let isSimple = false;

    switch (number) {
        case 1: // Najnoviji događaji
            isSimple = true;
            query = `SELECT e.event_id, e.title, SUBSTRING(e.description, 1, 150) AS description, e.creation_date, c.name AS category_name
                     FROM event AS e
                     INNER JOIN category AS c ON e.category = c.category_id
                     ORDER BY e.creation_date DESC LIMIT 10`;
            break;

        case 2: // Najposećeniji u 30 dana
            isSimple = true;
            query = `SELECT event_id, title, SUBSTRING(description, 1, 150) AS description
                     FROM event
                     WHERE creation_date >= NOW() - INTERVAL 30 DAY
                     ORDER BY views DESC LIMIT 10`;
            break;

        case 3: // Po kategoriji
            query = `SELECT event_id, title, SUBSTRING(description, 1, 150) AS description, creation_date
                     FROM event
                     WHERE category = ?
                     ORDER BY creation_date DESC LIMIT ? OFFSET ?`;
            countQuery = `SELECT COUNT(*) AS total FROM event WHERE category = ?`;
            params.push(filter);
            break;

        case 4: // Po tagu
            query = `SELECT e.event_id, e.title, SUBSTRING(e.description, 1, 150) AS description, e.creation_date, c.name AS category_name
                     FROM tag AS t
                     INNER JOIN event_tag AS et ON t.tag_id = et.tag_id
                     INNER JOIN event AS e ON et.event_id = e.event_id
                     INNER JOIN category AS c ON e.category = c.category_id
                     WHERE t.tag_id = ?
                     LIMIT ? OFFSET ?`;
            countQuery = `SELECT COUNT(*) AS total
                          FROM tag AS t
                          INNER JOIN event_tag AS et ON t.tag_id = et.tag_id
                          INNER JOIN event AS e ON et.event_id = e.event_id
                          WHERE t.tag_id = ?`;
            params.push(filter);
            break;
        case 5: // Pretraga po tekstu
            query = `SELECT event_id, title, description
                     FROM event
                     WHERE title LIKE ? OR description LIKE ?
                     LIMIT ? OFFSET ?`;
            countQuery = `SELECT COUNT(*) AS total FROM event WHERE title LIKE ? OR description LIKE ?`;
            const searchTerm = `%${filter}%`;
            params.push(searchTerm, searchTerm);
            break;
        case 6:
            isSimple = true;
            query = `SELECT event_id, title, (likes + dislikes) AS total_reactions
                     FROM event
                     ORDER BY total_reactions DESC
                     LIMIT 3;`
            break;
        default:
            query = `SELECT e.event_id, e.title, e.creation_date, c.name AS author_name
                     FROM event AS e
                     INNER JOIN client AS c ON e.author = c.user_id
                     ORDER BY e.creation_date DESC LIMIT ? OFFSET ?`;
            countQuery = `SELECT COUNT(*) AS total
                          FROM event AS e
                          INNER JOIN category AS c ON e.category = c.category_id`;
            break;
    }
    return { query, countQuery, params, isSimple };
}

export async function incrementEventView(id) {
   await pool.query("UPDATE event SET views = views + 1 WHERE event_id = ?", [id]);
}

export async function addLike(eventId) {
    await pool.query("UPDATE event SET likes = likes + 1 WHERE event_id = ?", [eventId]);
}

export async function removeLike(eventId) {
    await pool.query("UPDATE event SET likes = likes - 1 WHERE event_id = ?", [eventId]);
}

export async function addDislike(eventId) {
    await pool.query("UPDATE event SET dislikes = dislikes + 1 WHERE event_id = ?", [eventId]);
}

export async function removeDislike(eventId) {
    await pool.query("UPDATE event SET dislikes = dislikes - 1 WHERE event_id = ?", [eventId]);
}




