window.addEventListener('load', function() {

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

    var messagesList = document.getElementById('messages');
    var starredList = document.getElementById('starred');
    var pinnedList = document.getElementById('pinned');

    var sock = new WebSocket('ws://127.0.0.1:3012');
    sock.addEventListener('open', function() {
        dialog.showLoginPrompt(sock);
    });
    sock.addEventListener('message', function(e) {
        var data = JSON.parse(e.data);
        console.log(data);
        switch (data.type) {
            case 'auth':
                if (data.success) {
                    // TODO update logged in
                    dialog.showText(strings.authSuccess);
                } else {
                    dialog.showText(strings.authFailure);
                }
                break;

            case 'register':
                if (data.success) {
                    // TODO update logged in
                    dialog.showText(strings.registerSuccess);
                } else {
                    dialog.showText(strings.registerFailure);
                }
                break;

            case 'message':
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

                    var timestamp = document.createElement('a');
                    timestamp.textContent =
                        strings.fmttime(new Date(data.timestamp * 1000), false);
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
                                messageInput.value = message.dataset.markdown;
                            }
                            messageStatus.clear(action);
                            messageStatus[action] = data.id;
                            message.classList.add(action);
                            messageInput.focus();
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
                            sock.send(JSON.stringify({
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
                            sock.send(JSON.stringify({
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

                if (messagesList.lastChild &&
                        messagesList.lastChild.dataset.userid == data.userid) {
                    messagesList.lastChild.lastChild.appendChild(message);
                } else {
                    var monologue = document.createElement('div');
                    monologue.dataset.userid = data.userid;
                    monologue.className = 'monologue';
                    messagesList.appendChild(monologue);

                    var usercard = document.createElement('div');
                    usercard.className = 'usercard';
                    usercard.innerText = data.username;
                    monologue.appendChild(usercard);

                    var messageList = document.createElement('div');
                    messageList.className = 'messageList';
                    monologue.appendChild(messageList);
                    messageList.appendChild(message);
                }
                messagesList.scrollTo(0, messagesList.scrollHeight);
                break;

            case 'edit':
                var message = document.querySelectorAll('[data-id="' +
                        data.id + '"]');
                for (var i = 0; i < message.length; ++i) {
                    message[i].dataset.markdown = data.text;
                    message[i].innerHTML = markdown.render(data.text,
                            data.replyid);
                    markdown.attachReplyHandler(message[i]);
                }
                break;

            case 'vote':
                var message = document.querySelector('[data-id="' +
                        data.messageid + '"]');
                if (message) {
                    var voteboxes = document.querySelectorAll(
                        '.votebox[data-messageid="' + data.messageid + '"]');

                    if (!voteboxes.length) {
                        var votebox = document.createElement('div');
                        votebox.dataset.messageid = data.messageid;
                        votebox.className = 'votebox';
                        message.parentNode.insertBefore(votebox,
                                message);
                        voteboxes = [votebox];
                    }

                    for (var i = 0; i < voteboxes.length; ++i) {
                        var votebox = voteboxes[i];
                        var icon = document.createElement('span');
                        icon.className = [
                            'fa fa-thumbs-up',
                            'fa fa-thumbs-down',
                            'fa fa-star',
                            'fa fa-thumb-tack'
                        ][data.votetype - 1];
                        icon.dataset.votetype = data.votetype;
                        votebox.appendChild(icon);
                    }
                }
                break;

            case 'undovote':
                var voteboxes = document.querySelectorAll(
                    '.votebox[data-messageid="' + data.messageid + '"]');
                for (var i = 0; i < voteboxes.length; ++i) {
                    var votebox = voteboxes[i];
                    var voteicon = votebox.querySelector(
                            '[data-votetype="' + data.votetype + '"]');
                    votebox.removeChild(voteicon);
                }
                break;

            case 'starboard':
                var votetype = ['', '', '', 'star', 'pin'][data.votetype];
                var list = votetype == 'star' ? starredList : pinnedList;

                while (list.lastChild) list.removeChild(list.lastChild);

                data.messages.forEach(function(messageData) {
                    var messageWrapper = document.createElement('div');
                    messageWrapper.className = 'messageList';
                    list.insertBefore(messageWrapper, list.firstChild);

                    var message = document.createElement('div');
                    message.dataset.id = messageData.id;
                    // messageData.reply is intentionally excluded here
                    // because there's no sense in rendering a reply on the
                    // starboard
                    message.innerHTML = markdown.render(messageData.text);
                    messageWrapper.appendChild(message);

                    var voteCount = document.createElement('span');
                    voteCount.className = 'starInfo';
                    voteCount.textContent = messageData.votecount == 1 ?
                        '' : messageData.votecount;
                    var voteIcon = document.createElement('span');
                    voteIcon.className = 'fa fa-' + (votetype == 'star' ?
                        'star' : 'thumb-tack');
                    voteCount.appendChild(voteIcon);
                    messageWrapper.appendChild(voteCount);

                    var starredInfo = document.createElement('span');
                    starredInfo.className = 'starInfo';
                    starredInfo.textContent = '—' +
                        (messageData.username ?
                            (messageData.username + ', ') : '') +
                        strings.fmttime(new Date(messageData.timestamp * 1000),
                            true) + ' ago';
                    messageWrapper.appendChild(starredInfo);
                });
                break;

            case 'error':
                dialog.showText(data.text);
                break;

            case 'history':
                // TODO
                break;

        }
    });

    window.addEventListener('beforeunload', function() {
        sock.close();
    });

});
