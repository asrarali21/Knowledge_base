import axios from "axios"
import { useState } from "react"

function App() {
  
  const [input , setInput] = useState()


  const handleMessage =  async ()=>{
         try {
             const response = await axios.post("http://localhost:8000/api/v1/answer" , {question :input} , {withCredentials:true})
             console.log(response.data.data)
         } catch (error) {
          console.log(error)
         }
  }


  console.log(input)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-normal text-gray-900 mb-8">Ready when you are.</h1>
        <div className="w-full">
          <input 
          onChange={(e) => setInput(e.target.value)}
            type="text" 
            placeholder="Ask anything" 
            className="w-full px-6 py-4 text-lg border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-black-500 focus:border-transparent"
          />
        </div>
        <button onClick={handleMessage} className="cursor-pointer">Send</button>
      </div>
    </div>
  )
}

export default App
