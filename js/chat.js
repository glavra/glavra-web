var actions = {}, util = {}, onload = [];

window.addEventListener('load', function() {

    onload.forEach(function(f) { f(); });

    var roomId, roomMatch;
    if (roomMatch = location.search.slice(1).match(/(^|&)room=(\d+)/)) {
        roomId = +roomMatch[2];
    } else if (roomMatch = location.pathname.match(/^\/chat\/(\d+)$/)) {
        roomId = +roomMatch[2];
    } else return; // TODO room list?

    var token = localStorage.getItem('glavra-token');
    var sock = new WebSocket('ws://127.0.0.1:3012?room=' + roomId +
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

    util.pagetype = 'chat';

    // needed by 'message'
    util.messagesList = document.getElementById('messages');
    util.messageInput = document.getElementById('message');
    util.sock = sock;
    // needed by 'starboard'
    util.starredList = document.getElementById('starred');
    util.pinnedList = document.getElementById('pinned');
    // needed by 'message', 'starboard', and 'history'
    util.timestampLink = function(text, jumpid) {
        var link = document.createElement('a');
        link.textContent = text;
        link.href = 'javascript:;'; // TODO permalink
        // TODO exact time on hover
        link.addEventListener('click', function(e) {
            e.preventDefault();
            transcript.jumpTo(jumpid);
        });
        return link;
    };

    window.addEventListener('beforeunload', function() {
        sock.close();
    });

    input.init(sock);

    if (typeof Notification !== 'undefined') Notification.requestPermission();

});
