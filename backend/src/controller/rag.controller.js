import { answerFromKb } from "../Aiservices/RAG.services.js"



const sendQuestion = async (req , res) => {
   
   try {
     const {question} = req.body
 
     const result = await answerFromKb(question)
 
     if (!result) {
         throw new Error("Failed to answer the question")
     }
 
     res.status(200).json({data :result})
   } catch (error) {
    console.log(error)
    res.status(400)
   }
}

export {sendQuestion}