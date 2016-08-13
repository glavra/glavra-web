actions.register = function(data) {
    if (data.success) {
        document.getElementById('account').innerText = 'logged in';
        dialog.showText(strings.registerSuccess);
    } else {
        dialog.showText(strings.registerFailure);
    }
};
