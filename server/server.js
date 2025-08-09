import express from 'express';
import { DbConnection } from './db.js'

const app = express();
const port = process.env.PORT


app.get('/', (req, res) => {
    res.send('Hello World!')
})

DbConnection().
    then( () => {
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        })
    })
    .catch((error) => console.log(error));




