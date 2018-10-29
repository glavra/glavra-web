actions.auth = function(data) {
    if (data.success) {
        var account = document.getElementById('account');
        account.innerText = 'log out';
        account.removeEventListener('click', util.loginListener);
        account.addEventListener('click', function() {
            localStorage.removeItem('glavra-token');
            location.reload();
        });
        if (data.token) {
            localStorage.setItem('glavra-token', data.token);
            localStorage.setItem('userid', data.userid);
            dialog.showText(strings.authSuccess);
        }
    } else {
        dialog.showText(strings.authFailure);
    }
};
