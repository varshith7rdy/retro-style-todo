import express from "express"
import dotenv from "dotenv"
import { logger } from "./middlewares/logger.js"
import { ensureTasksTable  } from "./schema/tasks.js"
import { ensureUsersTable } from "./schema/users.js"
import { pool } from "./db/index.js"
import { router } from "./routes/auth.route.js"
import { router1 } from "./routes/todos.route.js"
import cookiesParser from "cookie-parser"
import { authentication } from "./middlewares/auth.middleware.js";


const app = express();

app.use(express.json())
app.use(logger)
// This adds a 'cookies' object to all 'req' (req.cookies)
// and a 'cookie' method to all 'res' (res.cookie)
app.use(cookiesParser())

dotenv.config()
const PORT = process.env.PORT

app.use("/api/auth", router)
app.use(authentication)
app.use("/api/todos", router1);

app.listen(PORT, async ()=>{
    console.log(`Server is running on ${PORT}`);
    await ensureUsersTable(pool)
    await ensureTasksTable(pool)
})