import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import './ChatBot.css'

function ChatBot({ sendRequest }) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage('')
    
    // Add user message to chat
    setChat([{ role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await sendRequest('POST', 'chat', { 
        message: userMessage,
        saveToHistory: false
      })
      // Replace chat with new conversation (max 2 messages)
      setChat([
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response.response }
      ])
    } catch (err) {
      console.error('Chat error:', err)
      setChat([
        { role: 'user', content: userMessage },
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setChat([])
    setMessage('')
  }

  return (
    <>
      {/* Chat Icon Button */}
      <button 
        className={`chat-icon-btn ${isOpen ? 'chat-icon-hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant"
      >
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-title">
              <div className="ai-icon-pulse">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span>AI Assistant</span>
            </div>
            <button 
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {chat.length === 0 ? (
              <div className="chat-welcome">
                <div className="welcome-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3>Hello! 👋</h3>
                <p>I'm your AI assistant for Auth.cc</p>
                <div className="welcome-suggestions">
                  <p>I can help you with:</p>
                  <ul>
                    <li>Managing license keys</li>
                    <li>Integrating our system</li>
                    <li>Premium features</li>
                    <li>Troubleshooting issues</li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                {chat.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.role}`}>
                    <div className="message-content">
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '')
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              )
                            },
                            p({ children }) {
                              return <p style={{ margin: '0 0 12px 0' }}>{children}</p>
                            },
                            ul({ children }) {
                              return <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>{children}</ul>
                            },
                            ol({ children }) {
                              return <ol style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>{children}</ol>
                            },
                            li({ children }) {
                              return <li style={{ margin: '4px 0' }}>{children}</li>
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="chat-message assistant">
                    <div className="message-content loading">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="chat-input-container">
            {chat.length >= 2 && (
              <button className="new-chat-btn" onClick={handleNewChat}>
                Start New Chat
              </button>
            )}
            <form onSubmit={handleSendMessage} className="chat-form">
              <input
                type="text"
                className="chat-input"
                placeholder={chat.length >= 2 ? "Start a new chat to ask another question..." : "Ask me anything..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading || chat.length >= 2}
              />
              <button 
                type="submit" 
                className="chat-send-btn"
                disabled={!message.trim() || isLoading || chat.length >= 2}
                aria-label="Send message"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatBot
