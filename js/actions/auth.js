actions.auth = function(data) {
    if (data.success) {
        document.getElementById('account').innerText = 'logged in';
        dialog.showText(strings.authSuccess);
    } else {
        dialog.showText(strings.authFailure);
    }
};
