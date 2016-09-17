var actions = {}, util = {}, onload = [];

window.addEventListener('load', function() {

    onload.forEach(function(f) { f(); });

    var token = localStorage.getItem('glavra-token');
    var sock = new WebSocket('ws://127.0.0.1:3012?queryrooms' +
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

    util.pagetype = 'rooms';

    // needed by 'roomlist'
    util.mainarea = document.getElementById('mainarea');

    document.getElementById('createRoom').addEventListener('submit', function(e) {
        e.preventDefault();
        sock.send(JSON.stringify({
            type: 'room',
            name: document.getElementById('newRoomName').value,
            desc: document.getElementById('newRoomDesc').value
        }));
        document.getElementById('createRoom').innerText = 'creating room...';
    });

    window.addEventListener('beforeunload', function() {
        sock.close();
    });

});
