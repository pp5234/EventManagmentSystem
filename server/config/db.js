import mysql2 from "mysql2/promise";
/*
CREATE TABLE  client
(
    user_id int AUTO_INCREMENT,
    email varchar(64) NOT NULL UNIQUE,
    name varchar(32) NOT NULL,
    surname varchar(32) NOT NULL,
    type enum('EVENT_CREATOR', 'ADMIN') NOT NULL,
    status bool NOT NULL,
    password varchar(128) NOT NULL,
    PRIMARY KEY (user_id)
);

CREATE TABLE category
(
    category_id int AUTO_INCREMENT,
    name varchar(32) NOT NULL UNIQUE,
    description text NOT NULL,
    PRIMARY KEY (category_id)
);

CREATE TABLE tag
(
    tag_id int AUTO_INCREMENT,
    name varchar(32) NOT NULL UNIQUE,
    PRIMARY KEY (tag_id)
);

CREATE TABLE event
(
    event_id int AUTO_INCREMENT,
    title varchar(255) NOT NULL,
    description text NOT NULL,
    creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    start_date DATETIME NOT NULL,
    location varchar(32) NOT NULL,
    views int NOT NULL DEFAULT 0,
    author int NOT NULL,
    category int NOT NULL,
    capacity int NULL,
    PRIMARY KEY (event_id),
    FOREIGN KEY (author)
        REFERENCES client (user_id)
        ON DELETE RESTRICT,
    FOREIGN KEY (category)
        REFERENCES category (category_id)
	ON DELETE RESTRICT
);

CREATE TABLE comment
(
    comment_id int AUTO_INCREMENT NOT NULL,
    name varchar(64) NOT NULL,
    content text NOT NULL,
    creation_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event_id int NOT NULL,
    likes int NOT NULL DEFAULT 0,
    dislikes int NOT NULL DEFAULT 0,
    PRIMARY KEY (comment_id),
    FOREIGN KEY (event_id)
        REFERENCES event (event_id)
        ON DELETE CASCADE
);

CREATE TABLE registration
(
    registration_id int AUTO_INCREMENT NOT NULL,
    email varchar(64) NOT NULL,
    event_id int NOT NULL,
    registration_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, email),
    PRIMARY KEY (registration_id),
    FOREIGN KEY (event_id)
        REFERENCES event (event_id)
        ON DELETE CASCADE
);

CREATE TABLE event_tag
(
    event_id INT NOT NULL,
    tag_id   INT NOT NULL,
    PRIMARY KEY (event_id, tag_id),
    FOREIGN KEY (event_id)
        REFERENCES event (event_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (tag_id)
        REFERENCES tag (tag_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
 */

const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
})

export async function dbConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection successful!')
        connection.release();
    } catch (error) {
        throw error;
    }
}
export default pool




