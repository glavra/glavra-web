actions.userinfo = function(data) {
    var nameHeader = document.createElement('h2');
    nameHeader.innerText = data.username;
    util.mainarea.appendChild(nameHeader);
};
