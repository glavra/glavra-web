actions.starboard = function(data) {
    var votetype = ['', '', '', 'star', 'pin'][data.votetype];
    var list = votetype == 'star' ? util.starredList : util.pinnedList;

    while (list.lastChild) list.removeChild(list.lastChild);

    data.messages.forEach(function(messageData) {
        var messageWrapper = document.createElement('div');
        messageWrapper.className = 'messageList';
        list.appendChild(messageWrapper);

        var message = document.createElement('div');
        message.dataset.id = messageData.id;
        // messageData.reply is intentionally excluded here
        // because there's no sense in rendering a reply on the
        // starboard
        message.innerHTML = markdown.render(messageData.text);
        messageWrapper.appendChild(message);

        var voteCount = document.createElement('span');
        voteCount.className = 'miniInfo';
        voteCount.textContent = messageData.votecount == 1 ?
            '' : messageData.votecount;
        var voteIcon = document.createElement('span');
        voteIcon.className = 'fa fa-' + (votetype == 'star' ?
            'star' : 'thumb-tack');
        voteCount.appendChild(voteIcon);
        messageWrapper.appendChild(voteCount);

        var starredInfo = document.createElement('span');
        starredInfo.className = 'miniInfo';
        starredInfo.textContent = '—' +
            (messageData.username ? (messageData.username + ', ') : '');
        var timestamp = util.timestampLink(strings.fmttime(
            new Date(messageData.timestamp * 1000), true), messageData.id);
        starredInfo.appendChild(timestamp);
        messageWrapper.appendChild(starredInfo);
    });
};
