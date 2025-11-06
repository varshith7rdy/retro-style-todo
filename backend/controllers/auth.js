import jwt from "jsonwebtoken"
import { pool } from "../db/index.js";
import { createHmac, randomBytes} from "node:crypto"
import { v4 } from "uuid"
import dotenv from "dotenv"

dotenv.config()

export async function signup(req, res) {
    
    const { email, password } = req.body;
    const query = `select email from users where email = ($1)`;
    const result = await pool.query(query, [email])
    if(result.rowCount)
    {
        res.status(409).send({
            msg:"User email already exists"
        })
    }
    else{
        
        const uuid = v4();
        const salt = randomBytes(256).toString('hex')
        const hashPass = createHmac("sha256", salt).update(password).digest('hex')
        const text = 'insert into users(id, email, password_hash, salt) values ($1, $2, $3, $4)';
        const values = [uuid, email, hashPass, salt] ;
        const result = await pool.query(text, values);
        res.status(200).send(result);

    }
}

export async function login(req, res) {
    
    const { email, password } = req.body;
    const text = 'SELECT email, salt, id FROM users WHERE email = ($1)'
    const exists = await pool.query(text, [email]);
    
    if(!exists.rowCount){
        console.log("User doesn't exists");
        res.status(400).json({ message: "user doesnt exists"})
        return;
    }
    else{

        const salt = exists.rows[0].salt;
        const hashedPassword = createHmac('sha256', salt).update(password).digest('hex')       
        const text1 = 'select * from users where password_hash = ($1)'
        const value1 = await pool.query(text1, [hashedPassword])
        if(!value1.rowCount){
            res.status(400).send({message:`Incorrect Password`})
        }
        return
    }
    const userId = exists.rows[0].id;
    const payload = {
        emailID: email,
        userId : userId
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    // console.log(req.user);
    
    // res.cookie("user_id", userId, {
    // })
    res.json({
        status: "success",
        user : email,
        token: token
    })
}

export async function verify(req, res) {

    const value = req.headers["authorization"];
    const token = value.split(" ")[1];
    try{
        const result = jwt.verify(token, process.env.JWT_SECRET)
        res.json(result).status(200)
    }
    catch{
        res.status(404);
    }
}