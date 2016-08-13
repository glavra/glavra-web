actions.undovote = function(data) {
    var voteboxes = document.querySelectorAll(
        '.votebox[data-messageid="' + data.messageid + '"]');
    for (var i = 0; i < voteboxes.length; ++i) {
        var votebox = voteboxes[i];
        var voteicon = votebox.querySelector(
                '[data-votetype="' + data.votetype + '"]');
        votebox.removeChild(voteicon);
    }
};
