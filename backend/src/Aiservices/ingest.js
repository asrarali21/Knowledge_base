
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf"


    const file_path = "/Users/mohammedasrarali/Desktop/data/R22B.Tech.CSECourseStructureSyllabus2.pdf"
    const loader  =  new PDFLoader(file_path)

const ingestDocs =async ()=>{
    

    const docs =await  loader.load()

    console.log(docs[0])
  
}
ingestDocs()