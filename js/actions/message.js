actions.message = function(data) {
    var message = document.createElement('div');
    message.dataset.id = data.id;
    message.dataset.markdown = data.text;
    message.innerHTML = markdown.render(data.text, data.replyid);
    markdown.attachReplyHandler(message);

    var menu;
    var showMenu = function() {
        var oldMenu = document.getElementsByClassName('messageMenu');
        if (oldMenu[0]) {
            oldMenu[0].parentNode.removeChild(oldMenu[0]);
        }

        menu = document.createElement('div');
        menu.className = 'messageMenu';
        message.appendChild(menu);

        var timestamp = util.timestampLink(strings.fmttime(
            new Date(data.timestamp * 1000), false), data.id);
        menu.appendChild(timestamp);

        var actions = ['edit', 'reply'];
        actions.forEach(function(action, idx) {
            var actionLink = document.createElement('a');
            actionLink.className = [
                'fa fa-pencil',
                'fa fa-reply'
            ][idx];
            actionLink.href = 'javascript:;';
            actionLink.addEventListener('click', function(e) {
                e.preventDefault();
                if (action == 'edit') {
                    util.messageInput.value = message.dataset.markdown;
                }
                messageStatus.clear(action);
                messageStatus[action] = data.id;
                message.classList.add(action);
                util.messageInput.focus();
            });
            menu.appendChild(actionLink);
        });

        var voteTypes = ['upvote', 'downvote', 'star', 'pin'];
        voteTypes.forEach(function(vote, idx) {
            var voteLink = document.createElement('a');
            voteLink.className = [
                'fa fa-thumbs-up',
                'fa fa-thumbs-down',
                'fa fa-star',
                'fa fa-thumb-tack'
            ][idx];
            voteLink.href = 'javascript:;';
            voteLink.addEventListener('click', function(e) {
                e.preventDefault();
                util.sock.send(JSON.stringify({
                    type: 'vote',
                    messageid: data.id,
                    votetype: idx + 1
                }));
            });
            menu.appendChild(voteLink);
        });

        var queryTypes = ['delete', 'history'];
        queryTypes.forEach(function(query, idx) {
            var queryLink = document.createElement('a');
            queryLink.className = [
                'fa fa-trash',
                'fa fa-history'
            ][idx];
            queryLink.href = 'javascript:;';
            queryLink.addEventListener('click', function(e) {
                e.preventDefault();
                util.sock.send(JSON.stringify({
                    type: query,
                    id: data.id
                }));
            });
            menu.appendChild(queryLink);
        });

        // apparently I can't use :has in here which is super
        // annoying >:(
        var highlights = document.querySelectorAll('[data-id="' +
            data.replyid + '"], div > a[data-replyid="' +
            data.id + '"]');
        for (var i = 0; i < highlights.length; ++i) {
            if (highlights[i].tagName.toLowerCase() == 'a') {
                highlights[i].parentNode.classList.add('hoverreply');
            } else {
                highlights[i].classList.add('hoverreply');
            }
        }
    };

    var hideMenu = function() {
        message.removeChild(menu);
        var highlights = document.getElementsByClassName('hoverreply');
        while (highlights.length) {
            highlights[0].classList.remove('hoverreply');
        }
    };

    message.addEventListener('mouseenter', showMenu);
    message.addEventListener('mouseleave', hideMenu);

    if (util.messagesList.lastChild &&
            util.messagesList.lastChild.dataset.userid == data.userid) {
        util.messagesList.lastChild.lastChild.appendChild(message);
    } else {
        var monologue = document.createElement('div');
        monologue.dataset.userid = data.userid;
        monologue.className = 'monologue';
        util.messagesList.appendChild(monologue);

        var usercard = document.createElement('div');
        usercard.className = 'usercard';
        usercard.innerText = data.username;
        monologue.appendChild(usercard);

        var messageList = document.createElement('div');
        messageList.className = 'messageList';
        monologue.appendChild(messageList);
        messageList.appendChild(message);
    }
    util.messagesList.scrollTop = util.messagesList.scrollHeight;

    if (typeof Notification !== 'undefined' && document.hidden &&
            Notification.permission == 'granted') {
        new Notification('Glavra', { body: data.text });
    }
};
