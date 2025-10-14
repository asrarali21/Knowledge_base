import axios from "axios"
import { useState, useRef, useEffect } from "react"

function App() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleMessage = async () => {
    if (!input.trim()) return

    const userMessage = { type: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await axios.post("http://localhost:8000/api/v1/answer", 
        { question: input }, 
        { withCredentials: true }
      )
      console.log(response.data.data)
      
      const botMessage = { 
        type: "bot", 
        content: response.data.data.answer,
        source: response.data.data.source 
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.log(error)
      const errorMessage = { type: "bot", content: "Sorry, I encountered an error. Please try again." }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleMessage()
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 shadow-sm">
        <h1 className="text-xl font-semibold text-white text-center">Ask JNTUH</h1>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <h2 className="text-4xl font-normal text-white mb-4 animate-fade-in">
                Ready when you are.
              </h2>
              <p className="text-gray-400 animate-fade-in-delay">
                Ask me anything about JNTUH regulations and syllabus
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === "user"
                    ? "bg-white text-black ml-12"
                    : "bg-gray-800 text-white shadow-sm border border-gray-700 mr-12"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.source && message.source.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <p className="text-sm text-gray-400 font-medium">Sources:</p>
                    {message.source.map((source, sourceIndex) => (
                      <div key={sourceIndex} className="mt-2">
                        <p className="text-sm text-gray-300">{source.source || source}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-slide-up">
              <div className="bg-gray-800 text-white shadow-sm border border-gray-700 rounded-2xl px-4 py-3 mr-12">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Container */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-4 shadow-lg">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                type="text"
                placeholder="Ask anything..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200 shadow-sm placeholder-gray-400"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleMessage}
              disabled={!input.trim() || isLoading}
              className="bg-white hover:bg-gray-200 disabled:bg-gray-600 disabled:cursor-not-allowed text-black rounded-full p-3 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.3s both;
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}

export default App
