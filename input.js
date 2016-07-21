var input = {
    init: function(sock) {
        var sendButton = document.getElementById('send');
        var cancelButton = document.getElementById('cancel');
        var messageInput = document.getElementById('message');

        var sendMessage = function() {
            if (messageStatus.edit) {
                sock.send(JSON.stringify({
                    type: 'edit',
                    id: messageStatus.edit,
                    replyid: messageStatus.reply,
                    text: messageInput.value
                }));
                messageInput.value = '';
                messageStatus.clear('edit');
            } else {
                sock.send(JSON.stringify({
                    type: 'message',
                    replyid: messageStatus.reply,
                    text: messageInput.value
                }));
                messageInput.value = '';
            }
            messageStatus.clear('reply');
        };
        sendButton.addEventListener('click', function(e) {
            e.preventDefault();
            sendMessage();
        });
        cancelButton.addEventListener('click', function(e) {
            e.preventDefault();
            messageStatus.clear('edit');
            messageStatus.clear('reply');
        });
        messageInput.addEventListener('keypress', function(e) {
            if (e.which == 13 && !e.ctrlKey && !e.shiftKey && !e.altKey &&
                    !e.metaKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
};
