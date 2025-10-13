import express from "express";
import ragRouter from "./routes/rag.route.js";
import cors from "cors"



const app = express()


app.use(cors( {origin:"http://localhost:5173" , credentials:true}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1/", ragRouter)




export default app