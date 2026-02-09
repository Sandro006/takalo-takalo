document.addEventListener('DOMContentLoaded', function() {
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');
    const onlineStatus = document.getElementById('online-status');
    const otherUserId = window.otherUserId;
    const currentUserId = window.currentUserId;

    let lastMessageId = window.lastMessageId;
    let typingTimeout;

    // Send message via AJAX
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message) {
            fetch(`${window.baseUrl}/chat/${otherUserId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `message=${encodeURIComponent(message)}`
            })
            .then(response => {
                if (response.ok) {
                    messageInput.value = '';
                    syncMessages();
                }
            });
        }
    });

    // Typing indicator
    messageInput.addEventListener('input', function() {
        setTyping(true);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => setTyping(false), 2000);
    });

    // Sync messages every 3 seconds
    setInterval(syncMessages, 3000);

    function syncMessages() {
        fetch(`${window.baseUrl}/api/chat/${otherUserId}/sync?last_id=${lastMessageId}`)
            .then(response => response.json())
            .then(data => {
                // Append new messages
                data.messages.forEach(msg => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `message ${msg.sender_id == currentUserId ? 'sent' : 'received'}`;
                    messageDiv.innerHTML = `<p>${msg.message}</p><small>${msg.created_at}</small>`;
                    chatMessages.appendChild(messageDiv);
                    lastMessageId = Math.max(lastMessageId, msg.id);
                });

                // Update typing status
                if (data.typing) {
                    typingIndicator.style.display = 'block';
                } else {
                    typingIndicator.style.display = 'none';
                }

                // Update online status
                if (data.online_status) {
                    onlineStatus.textContent = 'En ligne';
                } else {
                    onlineStatus.textContent = 'Hors ligne';
                }
            });
    }

    function setTyping(isTyping) {
        fetch(`/api/chat/${otherUserId}/typing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `is_typing=${isTyping ? 1 : 0}`
        });
    }
});
