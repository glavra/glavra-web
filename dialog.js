var dialog = {

    show: function(contents) {
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
    },

    showLoginPrompt: function(sock) {
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

        closeDialog = dialog.show(loginForm);
        document.getElementById('usernameInput').focus();
    },

    showText: function(text) {
        var para = document.createElement('p');
        para.textContent = text;
        dialog.show(para);
    }

};
