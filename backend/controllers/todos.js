import { pool } from "../db/index.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { v4 } from "uuid"
import { userInfo } from "os";

dotenv.config()


export async function getTodos(req, res) {
    
    const { userId } = req.user;
    const query = 'select * from tasks where user_id = ($1)'
    try
    {
        const result = await pool.query(query, [userId])
        res.send(result.rows).status(200)
    }
    catch{
        res.status(404).send({message: "Error occured"})
    }    
}


export async function addTodo(req, res){

    const {userId} = req.user;
    const user_id = userId
    const uuid = v4()
    const { title } = req.body
    if(!title)
    {
        res.status(404).send({message: "Title can't be empty"})
        return;
    }
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
    const result1 = await pool.query(query1, [todoId])
    res.status(200).json(result.rows[0])

}

export async function deleteTask(req, res) {

    const todoId = req.params.id;
    if(!todoId)
    {
        res.send({message:"Missing task ID"}).status(404)
        return
    }
    const query = `delete from tasks where id = ($1)`
    const result = await pool.query(query, [todoId]);
    res.status(200).send({ message: "Deleted successfully" }) 
}   