actions.history = function(data) {
    var list = document.createElement('div');

    var original = document.createElement('span');
    original.className = 'miniInfo';
    original.textContent = 'original revision';
    list.appendChild(original);

    data.revisions.forEach(function(revision) {
        var messageWrapper = document.createElement('div');
        messageWrapper.className = 'messageList';
        list.appendChild(messageWrapper);

        var message = document.createElement('div');
        // excluding revision.reply here for similar reasons as
        // in the starboard above (in fact, TODO: merge very
        // similar code into function)
        message.innerHTML = markdown.render(revision.text);
        messageWrapper.appendChild(message);

        var timestamp = document.createElement('span');
        timestamp.className = 'miniInfo';
        timestamp.textContent = 'revised ';
        var tsLink = util.timestampLink(strings.fmttime(
            new Date(revision.timestamp * 1000), true), revision.id);
        timestamp.appendChild(tsLink);
        list.appendChild(timestamp);
    });
    dialog.show(list);
};
