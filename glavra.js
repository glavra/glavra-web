window.addEventListener('load', function() {

    var output = document.getElementById('output');

    var sock = new WebSocket('ws://127.0.0.1:3012');
    sock.addEventListener('open', function() {
        sock.send(JSON.stringify({
            type: 'auth',
            username: Math.random().toString().slice(2),
            password: 'notarealpassword'
        }));
    });
    sock.addEventListener('message', function(e) {
        var data = JSON.parse(e.data);
        console.log(data);
        switch (data.type) {
            case 'authResponse':
                console.log('auth success: ' + data.success);
                break;
            case 'message':
                output.innerText +=
                    new Date(data.timestamp * 1000).toLocaleTimeString() +
                    ' <' + data.username + '> ' + data.text + '\n';
                break;
        }
    });

    var inputForm = document.getElementById('inputForm'),
        message = document.getElementById('message');
    inputForm.addEventListener('submit', function(e) {
        e.preventDefault();
        sock.send(JSON.stringify({
            type: 'message',
            text: message.value
        }));
        message.value = '';
    });

    window.addEventListener('beforeunload', function() {
        sock.close();
    });

});
