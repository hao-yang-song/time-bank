// AI Chat Bot functionality

// Initialize chat bot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create chat bot elements
    const chatBotContainer = document.createElement('div');
    chatBotContainer.id = 'ai-chat-bot';
    chatBotContainer.className = 'brut-chat-bot';
    
    // Chat bot toggle button
    const chatToggle = document.createElement('button');
    chatToggle.id = 'chat-toggle';
    chatToggle.className = 'btn-brut';
    chatToggle.innerHTML = '<i class="bi bi-robot"></i>';
    chatToggle.title = 'AI Assistant';
    
    // Chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chat-window';
    chatWindow.className = 'brut-card chat-window';
    
    // Chat header
    const chatHeader = document.createElement('div');
    chatHeader.className = 'chat-header';
    chatHeader.innerHTML = '<h5 class="font-monospace fw-bold">AI ASSISTANT</h5>';
    
    // Chat messages container
    const chatMessages = document.createElement('div');
    chatMessages.id = 'chat-messages';
    chatMessages.className = 'chat-messages';
    
    // Initial welcome message
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'chat-message bot-message';
    welcomeMessage.innerHTML = '<div class="message-content">Hello! I\'m your AI assistant. How can I help you today?</div>';
    chatMessages.appendChild(welcomeMessage);
    
    // Chat input area
    const chatInputArea = document.createElement('div');
    chatInputArea.className = 'chat-input-area';
    
    const chatInput = document.createElement('input');
    chatInput.type = 'text';
    chatInput.id = 'chat-input';
    chatInput.className = 'form-control brut-input';
    chatInput.placeholder = 'Type your message...';
    
    const sendButton = document.createElement('button');
    sendButton.id = 'send-message';
    sendButton.className = 'btn btn-brut btn-brut-red';
    sendButton.innerHTML = '<i class="bi bi-send-fill"></i>';
    
    chatInputArea.appendChild(chatInput);
    chatInputArea.appendChild(sendButton);
    
    // Assemble chat window
    chatWindow.appendChild(chatHeader);
    chatWindow.appendChild(chatMessages);
    chatWindow.appendChild(chatInputArea);
    
    // Assemble chat bot container
    chatBotContainer.appendChild(chatToggle);
    chatBotContainer.appendChild(chatWindow);
    
    // Add to document body
    document.body.appendChild(chatBotContainer);
    
    // Add CSS for chat bot
    const style = document.createElement('style');
    style.textContent = `
        /* AI Chat Bot Styles */
        .brut-chat-bot {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        }
        
        #chat-toggle {
            width: 60px;
            height: 60px;
            border-radius: 0 !important;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 4px 4px 0px var(--brut-black);
        }
        
        .chat-window {
            width: 350px;
            height: 450px;
            position: absolute;
            bottom: 70px;
            right: 0;
            display: none;
            flex-direction: column;
            overflow: hidden;
        }
        
        .chat-header {
            padding: 15px;
            border-bottom: 2px solid var(--brut-black);
            background-color: var(--brut-red);
            color: white;
        }
        
        .chat-messages {
            flex-grow: 1;
            padding: 15px;
            overflow-y: auto;
            background-color: var(--brut-white);
        }
        
        .chat-message {
            margin-bottom: 10px;
            max-width: 80%;
        }
        
        .user-message {
            margin-left: auto;
        }
        
        .bot-message {
            margin-right: auto;
        }
        
        .message-content {
            padding: 10px;
            border: 2px solid var(--brut-black);
            background-color: var(--brut-white);
            box-shadow: 2px 2px 0px var(--brut-black);
            font-family: var(--font-mono);
        }
        
        .user-message .message-content {
            background-color: var(--brut-black);
            color: var(--brut-white);
        }
        
        .chat-input-area {
            padding: 15px;
            border-top: 2px solid var(--brut-black);
            background-color: var(--brut-white);
            display: flex;
            gap: 10px;
        }
        
        #chat-input {
            flex-grow: 1;
        }
        
        #send-message {
            width: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);
    
    // Toggle chat window
    chatToggle.addEventListener('click', function() {
        chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
    });
    
    // Send message function
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            // Add user message
            const userMessage = document.createElement('div');
            userMessage.className = 'chat-message user-message';
            userMessage.innerHTML = '<div class="message-content">' + message + '</div>';
            chatMessages.appendChild(userMessage);
            
            // Clear input
            chatInput.value = '';
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Show loading indicator
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'chat-message bot-message loading-message';
            loadingMessage.innerHTML = '<div class="message-content"><i class="bi bi-three-dots"></i> Thinking...</div>';
            chatMessages.appendChild(loadingMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            try {
                // Call backend API
                const response = await fetch('http://localhost:22334/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: message })
                });
                
                const data = await response.json();
                
                // Remove loading message
                loadingMessage.remove();
                
                // Add bot response
                const botMessage = document.createElement('div');
                botMessage.className = 'chat-message bot-message';
                
                if (data.success) {
                    botMessage.innerHTML = '<div class="message-content">' + data.response + '</div>';
                } else {
                    botMessage.innerHTML = '<div class="message-content">Sorry, I encountered an error. Please try again later.</div>';
                }
                
                chatMessages.appendChild(botMessage);
                
            } catch (error) {
                console.error('AI Chat Error:', error);
                
                // Remove loading message
                loadingMessage.remove();
                
                // Add error message
                const botMessage = document.createElement('div');
                botMessage.className = 'chat-message bot-message';
                botMessage.innerHTML = '<div class="message-content">Sorry, I\'m having trouble connecting to the server. Please check your connection.</div>';
                chatMessages.appendChild(botMessage);
            }
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send message on enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
