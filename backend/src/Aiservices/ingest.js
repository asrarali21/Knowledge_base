
import dotenv from "dotenv"
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";

dotenv.config({ path: '../../.env' })
    const file_path = "/Users/mohammedasrarali/Desktop/data/R22B.Tech.CSECourseStructureSyllabus2.pdf"
    const loader  =  new PDFLoader(file_path)

const ingestDocs =async ()=>{

    console.log("api key of gemi",process.env.GEMINI_API_KEY);
    
    

    const docs =await  loader.load()



    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize:1000,
        chunkOverlap:200,
    })


    const splitDocument = await splitter.splitDocuments(docs)


    const embedding = new GoogleGenerativeAIEmbeddings({
        apiKey:process.env.GEMINI_API_KEY,
       model: process.env.GEMINI_EMBED_MODEL || "text-embedding-004",
    })


  
   const vectorStore = await QdrantVectorStore.fromDocuments(
    docs,
    embedding,{
        url:"http://localhost:6333",
        collectionName:"regulations"
    }
   )
    


    console.log("Ingestion complete! The knowledge base has been created.");
     
  
}
ingestDocs().catch(console.error)