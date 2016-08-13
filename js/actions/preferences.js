actions.preferences = function(data) {
    if (data.theme) {
        document.getElementsByTagName('link')[0].href =
            '/css/chat-' + data.theme + '.css';
    }
};
