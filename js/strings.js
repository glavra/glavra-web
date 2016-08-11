// TODO make this not terrible
var strings = {
    authSuccess: 'You have successfully been authenticated.',
    authFailure: 'Your username or password was incorrect.',
    registerSuccess: 'Your account has been created.',
    registerFailure: 'Someone already has that username.',
    errCodes: [
        'You need to be logged in to do that.',
        'The request was malformed.',
        'Your message may not be empty.',
        'You may not edit or delete a message that is already deleted.',
        'The request URL could not be parsed.',
        'No room ID was specified.',
        'The room ID that was specified was invalid.',
        'The room ID that was specified does not exist.',
        'Your username may not be more than 20 characters long.',
        'You can\'t vote on your own messages.',
        'You\'re doing that too fast.'
    ],
    fmttime: function(date, relative) {
        var days = Math.floor(now / (1000 * 60 * 60 * 24)) -
            Math.floor(date / (1000 * 60 * 60 * 24));
        if (relative) {
            var now = new Date();
            var seconds = (now.getTime() - date.getTime()) / 1000;
            if (seconds < 60) return Math.floor(seconds) + 's ago';
            var minutes = seconds / 60;
            if (minutes < 60) return Math.floor(minutes) + 'm ago';
            var hours = minutes / 60;
            if (hours < 24) return Math.floor(hours) + 'h ago';
            if (days < 32) return days + 'd ago';
            return fmttime(date, false);
        } else {
            return date.toLocaleTimeString() + (days ?
                    ' ' + date.toLocaleDateString() : '');
        }
    }
};
