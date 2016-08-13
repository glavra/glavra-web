actions.edit = function(data) {
    var message = document.querySelectorAll('[data-id="' + data.id + '"]');
    for (var i = 0; i < message.length; ++i) {
        message[i].dataset.markdown = data.text;
        message[i].innerHTML = markdown.render(data.text, data.replyid);
        markdown.attachReplyHandler(message[i]);
    }
};
