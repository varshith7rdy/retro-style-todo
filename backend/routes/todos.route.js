import express from "express";
import { getTodos, addTodo, updateTask, deleteTask } from "../controllers/todos.js"

const router1 = express.Router();

router1.get("/", getTodos);
router1.post("/", addTodo);
router1.patch("/:id", updateTask);
router1.delete("/:id", deleteTask)

export { router1 }