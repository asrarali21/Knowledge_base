import express from "express";
import ragRouter from "./routes/rag.route.js";




const app = express()



app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1/", ragRouter)




export default app