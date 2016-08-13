actions.register = function(data) {
    if (data.success) {
        document.getElementById('account').innerText = 'logged in';
        localStorage.setItem('glavra-token', data.token);
        dialog.showText(strings.registerSuccess);
    } else {
        dialog.showText(strings.registerFailure);
    }
};
