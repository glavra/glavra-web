actions.vote = function(data) {
    var message = document.querySelector('[data-id="' + data.messageid + '"]');
    if (message) {
        var voteboxes = document.querySelectorAll(
            '.votebox[data-messageid="' + data.messageid + '"]');

        if (!voteboxes.length) {
            var votebox = document.createElement('div');
            votebox.dataset.messageid = data.messageid;
            votebox.className = 'votebox';
            message.parentNode.insertBefore(votebox, message);
            voteboxes = [votebox];
        }

        for (var i = 0; i < voteboxes.length; ++i) {
            var votebox = voteboxes[i];
            var icon = document.createElement('span');
            icon.className = [
                'fa fa-thumbs-up',
                'fa fa-thumbs-down',
                'fa fa-star',
                'fa fa-thumb-tack'
            ][data.votetype - 1];
            icon.dataset.votetype = data.votetype;
            votebox.appendChild(icon);
        }
    }
};
