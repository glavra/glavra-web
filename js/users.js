var actions = {}, util = {}, onload = [];

window.addEventListener('load', function() {

    onload.forEach(function(f) { f(); });

    var userId, userMatch;
    if (userMatch = location.search.slice(1).match(/(^|&)id=(\d+)/)) {
        userId = +userMatch[2];
    } else if (userMatch = location.pathname.match(/^\/users\/(\d+)$/)) {
        userId = +userMatch[1];
    }

    if (userId) {
        document.getElementById('headerdesc').innerText = 'You are viewing ' +
            'the profile of a specific user.';
    }

    var token = localStorage.getItem('glavra-token');
    var sock = new WebSocket('ws://127.0.0.1:3012?' +
            (userId ? 'queryuser=' + userId : 'queryusers') +
            (token ? '&token=' + token : ''));

    sock.addEventListener('open', function() {
        var loginLink = document.createElement('a');
        loginLink.id = 'account';
        loginLink.textContent = 'log in';
        loginLink.href = 'javascript:;';
        loginLink.addEventListener('click', util.loginListener = function(e) {
            e.preventDefault();
            dialog.showLoginPrompt(sock);
        });
        document.getElementById('links').appendChild(loginLink);
    });

    sock.addEventListener('message', function(e) {
        var data = JSON.parse(e.data);
        console.log(data);
        actions[data.type](data);
    });

    util.pagetype = 'users';

    // needed by 'userinfo' and 'userlist'
    util.mainarea = document.getElementById('mainarea');

    window.addEventListener('beforeunload', function() {
        sock.close();
    });

});
