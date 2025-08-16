import express from 'express';
import { dbConnection } from './config/db.js'
import login from './routes/loginRoute.js'
import user from './routes/userRoute.js'
import {errorMiddleware, NotFoundMiddleware} from "./middleware/errorMiddleware.js";

const app = express();
const port = process.env.PORT

app.use(express.json());

app.use('/api/login', login)
app.use('/api/user', user)

//Error handlers
app.use(NotFoundMiddleware)
app.use(errorMiddleware)

dbConnection().
    then( () => {
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        })
    })
    .catch((error) => console.log(error));




