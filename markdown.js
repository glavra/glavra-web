var markdown = (function() {
    var reader = new commonmark.Parser();
    var writer = new commonmark.HtmlRenderer({safe: true});
    return {
        render: function(text, reply) {
            if (text === '') {
                return '<p class="deleted">(deleted)</p>';
            }
            // TODO fix this ugly hack, maybe by hooking into HtmlRenderer?
            var escaped = text.replace(/<([^:<]*)>/g, '&lt;$1>');
            var messageHTML = writer.render(reader.parse(escaped));
            if (reply) {
                messageHTML = '<a class="fa fa-reply reply-arrow" ' +
                    'data-replyid="' + reply + '" href="javascript:;"></a>' +
                    messageHTML;
            }
            return messageHTML;
        },
        attachReplyHandler: function(message) {
            var child = message.firstChild;
            if (child && child.tagName.toLowerCase() == 'a') {
                child.addEventListener('click', function(e) {
                    e.preventDefault();
                    transcript.jumpTo(child.dataset.replyid);
                });
            }
        }
    };
})();
