// TODO make this not terrible
var strings = {
    authSuccess: 'You have successfully been authenticated.',
    authFailure: 'Your username or password was incorrect.'
};

window.addEventListener('load', function() {

    var loggedIn = false;

    var output = document.getElementById('output');

    var sock = new WebSocket('ws://127.0.0.1:3012');
    sock.addEventListener('open', function() {
        showLoginPrompt(sock);
    });
    sock.addEventListener('message', function(e) {
        var data = JSON.parse(e.data);
        console.log(data);
        switch (data.type) {
            case 'authResponse':
                if (data.success) {
                    loggedIn = true;
                    var text = document.createTextNode(strings.authSuccess);
                    showDialog(text);
                } else {
                    var text = document.createTextNode(strings.authFailure);
                    showDialog(text);
                }
                break;
            case 'message':
                output.innerText +=
                    new Date(data.timestamp * 1000).toLocaleTimeString() +
                    ' <' + data.username + '> ' + data.text + '\n';
                break;
        }
    });

    var inputForm = document.getElementById('inputForm'),
        message = document.getElementById('message');
    inputForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (loggedIn) {
            sock.send(JSON.stringify({
                type: 'message',
                text: message.value
            }));
            message.value = '';
        } else showLoginPrompt(sock);
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
