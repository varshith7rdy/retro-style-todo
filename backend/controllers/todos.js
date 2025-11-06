import { pool } from "../db/index.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { v4 } from "uuid"
import { userInfo } from "os";

dotenv.config()


export async function getTodos(req, res) {
    
    const user_id = req.cookies.user_id;
    console.log(user_id);
    const query = 'select * from tasks where user_id = ($1)'
    const result = await pool.query(query, [user_id])
    res.send(result.rows).status(200)
    
}


export async function addTodo(req, res){

    const user_id = req.cookies.user_id;
    const uuid = v4()
    const { title } = req.body
    const query = `insert into tasks(id, user_id, title) values($1, $2, $3)`
    const result = await pool.query(query, [uuid, user_id, title])
    const query1 = 'select * from tasks where id = ($1)'
    const result1 = await pool.query(query1, [uuid])
    res.status(200).json(result1.rows[0]);
}

export async function updateTask(req, res) {
    
    const { completed } = req.body;
    const todoId = req.params.id;
    // console.log(req.params);
    const query = `update tasks set is_completed = TRUE where id = ($1)`
    const result = await pool.query(query, [todoId]);
    const query1 = 'select * from tasks where id = ($1)'
    const result1 = await pool.query(query1, [uuid])
    res.status(200).json(result.rows[0])

}

export async function deleteTask(req, res) {

    const todoId = req.params.id;
    const query = `delete from tasks where id = ($1)`
    const result = await pool.query(query, [todoId]);
    res.status(200).send({ message: "Deleted successfully" })
    
}   