import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";



export async function  answerFromKb (question , k=5  ){
     
    console.log(question);
  
    if (!question || !question.trim()) {
        return {answer : "please provide a question" , source : []}
    } 
    

   const embedding = new GoogleGenerativeAIEmbeddings({
    apiKey : process.env.GEMINI_API_KEY,
    model:process.env.GEMINI_EMBED_MODEL,
   })
   


   const store = await  QdrantVectorStore.fromExistingCollection(
    embedding , {
        url:"http://localhost:6333",
        collectionName:"regulations"
   })


   const results = await store.similaritySearch(question , k)

   console.log("retrived chunks" , results);
   

    

    const chat = new ChatGoogleGenerativeAI({
        model:"gemini-2.5-flash",
        apiKey:process.env.GEMINI_API_KEY
    })

    const context = results.map(r=>r.pageContent).join("\n\n") 


      const response = await chat.call([
    { role: "system", content: "You are a knowledgeable assistant answering from university regulations." },
    { role: "user", content: `Use only the following context to answer:\n${context}\n\nQuestion: ${question}` }
  ]);

    
  return {
    answer: response.content,
    source: results.map(r => r.metadata || {})
  };
                
} 