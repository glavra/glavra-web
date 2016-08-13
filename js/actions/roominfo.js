actions.roominfo = function(data) {
    document.getElementById('roomname').textContent = data.name;
    document.getElementById('roomdesc').innerHTML = markdown.render(data.desc);
};
