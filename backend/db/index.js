import { Pool } from "pg";
import dotenv from "dotenv"

dotenv.config()

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
console.log("Server Established");


export { pool };