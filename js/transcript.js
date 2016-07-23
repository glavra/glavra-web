var transcript = {
    jumpTo: function(id) {
        var message = document.querySelector('#messages [data-id="' + id + '"]');
        if (message) {
            message.scrollIntoView();
            message.classList.add('jumpHighlight');
            setTimeout(function() {
                message.classList.remove('jumpHighlight');
            }, 3000);
        } else {
            // TODO transcript
        }
    }
};
