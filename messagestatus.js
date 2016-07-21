var messageStatus = {
    edit: null,
    reply: null,
    clear: function(type) {
        if (messageStatus[type]) {
            var elt = document.getElementsByClassName(type)[0];
            if (elt) elt.classList.remove(type);
            messageStatus[type] = null;
        }
    }
};
