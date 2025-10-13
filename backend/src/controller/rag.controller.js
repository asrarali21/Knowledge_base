import { answerFromKb } from "../Aiservices/RAG.services.js"



const sendQuestion = async (req , res) => {
   
    const {question} = req.body

    const result = await answerFromKb(question)

    if (!result) {
        throw new Error("Failed to answer the question")
    }

    res.status(200).json({data :result})
}

export {sendQuestion}