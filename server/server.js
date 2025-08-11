import express from 'express';
import { DbConnection } from './config/db.js'
import login from './routes/loginRoute.js'

const app = express();
const port = process.env.PORT

app.use(express.json());
app.use('/api/login', login)

DbConnection().
    then( () => {
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        })
    })
    .catch((error) => console.log(error));




