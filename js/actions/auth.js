actions.auth = function(data) {
    if (data.success) {
        document.getElementById('account').innerText = 'logged in';
        if (data.token) localStorage.setItem('glavra-token', data.token);
        dialog.showText(strings.authSuccess);
    } else {
        dialog.showText(strings.authFailure);
    }
};
