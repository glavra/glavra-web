var actions = {}, util = {};

window.addEventListener('load', function() {

    var roomId, roomMatch;
    if (roomMatch = location.search.slice(1).match(/(^|&)room=(\d+)/)) {
        roomId = +roomMatch[2];
    } else if (roomMatch = location.pathname.match(/^\/chat(-dark)?\/(\d+)$/)) {
        roomId = +roomMatch[2];
    } else return; // TODO room list?

    if (window.innerWidth <= 800) sidebar.collapse();

    document.getElementById('collapseSidebar').addEventListener('click', function() {
        sidebar.collapse();
    });
    document.getElementById('expandSidebar').addEventListener('click', function() {
        sidebar.expand();
    });

    var sock = new WebSocket('ws://127.0.0.1:3012?room=' + roomId);

    sock.addEventListener('open', function() {
        var loginLink = document.createElement('a');
        loginLink.textContent = 'log in';
        loginLink.href = 'javascript:;';
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            dialog.showLoginPrompt(sock);
        });
        document.getElementById('account').appendChild(loginLink);
    });

    sock.addEventListener('message', function(e) {
        var data = JSON.parse(e.data);
        console.log(data);
        actions[data.type](data);
    });

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

});
