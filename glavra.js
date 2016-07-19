// TODO make this not terrible
var strings = {
    authSuccess: 'You have successfully been authenticated.',
    authFailure: 'Your username or password was incorrect.',
    registerSuccess: 'Your account has been created.',
    registerFailure: 'Someone already has that username.'
};

window.addEventListener('load', function() {

    var loggedIn = false, messageEditing;

    var messagesList = document.getElementById('messages');
    var starredList = document.getElementById('starred');
    var inputForm = document.getElementById('inputForm');
    var messageInput = document.getElementById('message');

    var sendMessage = function() {
        if (loggedIn) {
            if (messageEditing) {
                sock.send(JSON.stringify({
                    type: 'edit',
                    id: messageEditing,
                    text: messageInput.value
                }));
                messageInput.value = '';
                messageEditing = null;
            } else {
                sock.send(JSON.stringify({
                    type: 'message',
                    text: messageInput.value
                }));
                messageInput.value = '';
            }
        } else showLoginPrompt(sock);
    };

    inputForm.addEventListener('submit', function(e) {
        e.preventDefault();
        sendMessage();
    });
    messageInput.addEventListener('keypress', function(e) {
        if (e.which == 13) {
            e.preventDefault();
            sendMessage();
        }
    });

    var reader = new commonmark.Parser();
    var writer = new commonmark.HtmlRenderer({safe: true});
    var markdown = function(text) {
        var escaped = text.replace(/[<&]/g, function(m) {
            return ({'<': '&lt;', '&': '&amp;'})[m];
        });
        return writer.render(reader.parse(escaped));
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
                newMessage.innerHTML = markdown(data.text);

                newMessage.addEventListener('click', function() {
                    var oldMenu = document.getElementsByClassName('messageMenu');
                    if (oldMenu[0]) {
                        oldMenu[0].parentNode.removeChild(oldMenu[0]);
                    }

                    var menu = document.createElement('div');
                    menu.className = 'messageMenu';
                    this.appendChild(menu);

                    var editLink = document.createElement('a');
                    editLink.textContent = 'edit';
                    editLink.href = 'javascript:;';
                    editLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        messageEditing = data.id;
                        messageInput.value = newMessage.dataset.markdown;
                        messageInput.focus();
                    });
                    menu.appendChild(editLink);

                    ['upvote', 'downvote', 'star', 'pin'].forEach(function(vote, idx) {
                        var voteLink = document.createElement('a');
                        voteLink.textContent = vote;
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

                    menu.addEventListener('click', function(e) {
                        e.stopPropagation();
                        newMessage.removeChild(menu);
                    });
                });

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
                    editedMessage[i].innerHTML = markdown(data.text);
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
                    starredMessage.innerHTML = markdown(messageData.text);
                    messageWrapper.appendChild(starredMessage);

                    var starCount = document.createElement('span');
                    starCount.className = 'starInfo';
                    starCount.textContent = messageData.starcount == 1 ?
                        '' : messageData.starcount;
                    var starIcon = document.createElement('span');
                    starIcon.className = 'fa fa-star';
                    starCount.appendChild(starIcon);
                    messageWrapper.appendChild(starCount);

                    var date = new Date(messageData.timestamp * 1000);
                    var starredInfo = document.createElement('span');
                    starredInfo.className = 'starInfo';
                    starredInfo.textContent = '—' +
                        (messageData.username ?
                            (messageData.username + ', ') : '') +
                        date.toDateString().split(' ').slice(1).join(' ') +
                        ' ' + date.toTimeString().split(' ')[0];
                    messageWrapper.appendChild(starredInfo);
                });
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
