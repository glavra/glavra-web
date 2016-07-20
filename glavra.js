// TODO make this not terrible
var strings = {
    authSuccess: 'You have successfully been authenticated.',
    authFailure: 'Your username or password was incorrect.',
    registerSuccess: 'Your account has been created.',
    registerFailure: 'Someone already has that username.'
};

window.addEventListener('load', function() {

    var loggedIn = false, messageEditing = null, messageReplying = null;

    var clearEdit = function() {
        if (messageEditing) {
            var editEl = document.getElementsByClassName('edit')[0];
            if (editEl) editEl.classList.remove('edit');
            messageEditing = null;
        }
    };
    var clearReply = function() {
        if (messageReplying) {
            var replyEl = document.getElementsByClassName('reply')[0];
            if (replyEl) replyEl.classList.remove('reply');
            messageReplying = null;
        }
    };

    var messagesList = document.getElementById('messages');
    var starredList = document.getElementById('starred');
    var sendButton = document.getElementById('send');
    var cancelButton = document.getElementById('cancel');
    var messageInput = document.getElementById('message');

    var sendMessage = function() {
        if (loggedIn) {
            if (messageEditing) {
                sock.send(JSON.stringify({
                    type: 'edit',
                    id: messageEditing,
                    replyid: messageReplying,
                    text: messageInput.value
                }));
                messageInput.value = '';
                clearEdit();
            } else {
                sock.send(JSON.stringify({
                    type: 'message',
                    replyid: messageReplying,
                    text: messageInput.value
                }));
                messageInput.value = '';
            }
            clearReply();
        } else showLoginPrompt(sock);
    };

    sendButton.addEventListener('click', function(e) {
        e.preventDefault();
        sendMessage();
    });
    cancelButton.addEventListener('click', function(e) {
        e.preventDefault();
        clearEdit();
        clearReply();
    });
    messageInput.addEventListener('keypress', function(e) {
        if (e.which == 13) {
            e.preventDefault();
            sendMessage();
        }
    });

    var reader = new commonmark.Parser();
    var writer = new commonmark.HtmlRenderer({safe: true});
    var renderMessage = function(text, reply) {
        var escaped = text.replace(/[<&]/g, function(m) {
            return ({'<': '&lt;', '&': '&amp;'})[m];
        });
        var messageHTML = writer.render(reader.parse(escaped));
        if (reply) {
            messageHTML = '<span class="fa fa-reply reply-arrow" ' +
                'data-replyid="' + reply + '"></span>' +
                messageHTML;
        }
        return messageHTML;
    };

    var sock = new WebSocket('ws://127.0.0.1:3012');
    sock.addEventListener('open', function() {
        showLoginPrompt(sock);
    });
    sock.addEventListener('message', function(e) {
        var data = JSON.parse(e.data);
        console.log(data);
        switch (data.type) {

            case 'auth':
                if (data.success) {
                    loggedIn = true;
                    var text = document.createTextNode(strings.authSuccess);
                    showDialog(text);
                } else {
                    var text = document.createTextNode(strings.authFailure);
                    showDialog(text);
                }
                break;

            case 'register':
                if (data.success) {
                    loggedIn = true;
                    var text = document.createTextNode(strings.registerSuccess);
                    showDialog(text);
                } else {
                    var text = document.createTextNode(strings.registerFailure);
                    showDialog(text);
                }
                break;

            case 'message':
                var newMessage = document.createElement('div');
                newMessage.dataset.id = data.id;
                newMessage.dataset.markdown = data.text;
                newMessage.innerHTML = renderMessage(data.text, data.replyid);

                var menu;
                var showMenu = function() {
                    var oldMenu = document.getElementsByClassName('messageMenu');
                    if (oldMenu[0]) {
                        oldMenu[0].parentNode.removeChild(oldMenu[0]);
                    }

                    menu = document.createElement('div');
                    menu.className = 'messageMenu';
                    newMessage.appendChild(menu);

                    var timestamp = document.createElement('a');
                    timestamp.textContent =
                        fmttime(new Date(data.timestamp * 1000), false);
                    menu.appendChild(timestamp);

                    var editLink = document.createElement('a');
                    editLink.className = 'fa fa-pencil';
                    editLink.href = 'javascript:;';
                    editLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        clearEdit();
                        messageEditing = data.id;
                        newMessage.classList.add('edit');
                        messageInput.value = newMessage.dataset.markdown;
                        messageInput.focus();
                    });
                    menu.appendChild(editLink);

                    var replyLink = document.createElement('a');
                    replyLink.className = 'fa fa-reply';
                    replyLink.href = 'javascript:;';
                    replyLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        clearReply();
                        messageReplying = data.id;
                        newMessage.classList.add('reply');
                        messageInput.focus();
                    });
                    menu.appendChild(replyLink);

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

                    // apparently I can't use :has in here which is super
                    // annoying >:(
                    var highlights = document.querySelectorAll('[data-id="' +
                        data.replyid + '"], div > span[data-replyid="' +
                        data.id + '"]');
                    for (var i = 0; i < highlights.length; ++i) {
                        if (highlights[i].tagName.toLowerCase() == 'span') {
                            highlights[i].parentNode.classList.add('hoverreply');
                        } else {
                            highlights[i].classList.add('hoverreply');
                        }
                    }
                };

                var hideMenu = function() {
                    newMessage.removeChild(menu);
                    var highlights = document.getElementsByClassName('hoverreply');
                    while (highlights.length) {
                        highlights[0].classList.remove('hoverreply');
                    }
                };

                newMessage.addEventListener('mouseenter', showMenu);
                newMessage.addEventListener('mouseleave', hideMenu);

                if (messagesList.lastChild &&
                        messagesList.lastChild.dataset.userid == data.userid) {
                    messagesList.lastChild.lastChild.appendChild(newMessage);
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
                    messageList.appendChild(newMessage);
                }
                messagesList.scrollTo(0, messagesList.scrollHeight);
                break;

            case 'edit':
                var editedMessage = document.querySelectorAll('[data-id="' +
                        data.id + '"]');
                for (var i = 0; i < editedMessage.length; ++i) {
                    editedMessage[i].dataset.markdown = data.text;
                    editedMessage[i].innerHTML = renderMessage(data.text,
                            data.replyid);
                }
                break;

            case 'vote':
                var votedMessage = document.querySelector('[data-id="' +
                        data.messageid + '"]');
                if (votedMessage) {
                    var voteboxes = document.querySelectorAll(
                        '.votebox[data-messageid="' + data.messageid + '"]');

                    if (!voteboxes.length) {
                        var votebox = document.createElement('div');
                        votebox.dataset.messageid = data.messageid;
                        votebox.className = 'votebox';
                        votedMessage.parentNode.insertBefore(votebox,
                                votedMessage);
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
                while (starredList.lastChild) {
                    starredList.removeChild(starredList.lastChild);
                }

                data.messages.forEach(function(messageData) {
                    var messageWrapper = document.createElement('div');
                    messageWrapper.className = 'messageList';
                    starredList.insertBefore(messageWrapper,
                            starredList.firstChild);

                    var starredMessage = document.createElement('div');
                    starredMessage.dataset.id = messageData.id;
                    // messageData.reply is intentionally excluded here
                    // because there's no sense in rendering a reply on the
                    // starboard
                    starredMessage.innerHTML = renderMessage(messageData.text);
                    messageWrapper.appendChild(starredMessage);

                    var starCount = document.createElement('span');
                    starCount.className = 'starInfo';
                    starCount.textContent = messageData.starcount == 1 ?
                        '' : messageData.starcount;
                    var starIcon = document.createElement('span');
                    starIcon.className = 'fa fa-star';
                    starCount.appendChild(starIcon);
                    messageWrapper.appendChild(starCount);

                    var starredInfo = document.createElement('span');
                    starredInfo.className = 'starInfo';
                    starredInfo.textContent = '—' +
                        (messageData.username ?
                            (messageData.username + ', ') : '') +
                        fmttime(new Date(messageData.timestamp * 1000), true) +
                        ' ago';
                    messageWrapper.appendChild(starredInfo);
                });
                break;

            case 'error':
                var text = document.createTextNode(data.text);
                showDialog(text);
                break;

        }
    });

    window.addEventListener('beforeunload', function() {
        sock.close();
    });

});

function showDialog(contents) {
    var dialog = document.createElement('div');
    dialog.appendChild(contents);
    dialog.className = 'dialog';
    document.body.appendChild(dialog);

    var overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    var closeDialog = function() {
        document.body.removeChild(dialog);
        document.body.removeChild(overlay);
    };

    var closeBtn = document.createElement('button');
    dialog.appendChild(closeBtn);
    closeBtn.className = 'closeBtn';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', closeDialog);

    return closeDialog;
}

function showLoginPrompt(sock) {
    var loginForm = document.createElement('form');

    ['username', 'password'].forEach(function(type) {
        var container = document.createElement('p');
        loginForm.appendChild(container);

        var label = document.createElement('label');
        label.textContent = type.replace(/./, type[0].toUpperCase()) + ': ';
        label['for'] = type + 'Input';
        container.appendChild(label);

        var input = document.createElement('input');
        input.type = type == 'password' ? type : 'text';
        input.id = type + 'Input';
        container.appendChild(input);
    });

    var submitAction = 'auth';

    var submitLogin = document.createElement('input');
    submitLogin.type = 'submit';
    submitLogin.value = 'Login';
    loginForm.appendChild(submitLogin);

    var submitRegister = document.createElement('input');
    submitRegister.type = 'submit';
    submitRegister.value = 'Register';
    submitRegister.addEventListener('click', function() {
        submitAction = 'register';
    });
    loginForm.appendChild(submitRegister);

    var closeDialog;
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        sock.send(JSON.stringify({
            type: submitAction,
            username: document.getElementById('usernameInput').value,
            password: document.getElementById('passwordInput').value
        }));
        closeDialog();
    });

    closeDialog = showDialog(loginForm);
    document.getElementById('usernameInput').focus();
}

function fmttime(date, relative) {
    var days = Math.floor(now / (1000 * 60 * 60 * 24)) -
        Math.floor(date / (1000 * 60 * 60 * 24));
    if (relative) {
        var now = new Date();
        var seconds = (now.getTime() - date.getTime()) / 1000;
        if (seconds < 60) return Math.floor(seconds) + 's';
        var minutes = seconds / 60;
        if (minutes < 60) return Math.floor(minutes) + 'm';
        var hours = minutes / 60;
        if (hours < 24) return Math.floor(hours) + 'h';
        if (days < 32) return days + 'd';
        return fmttime(date, false);
    } else {
        return date.toLocaleTimeString() + (days ?
                ' ' + date.toLocaleDateString() : '');
    }
}
