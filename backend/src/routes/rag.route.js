import { Router } from "express"
import { sendQuestion } from "../controller/rag.controller.js"



const ragRouter = Router()


ragRouter.route("/answer").post(sendQuestion)



export default ragRouter