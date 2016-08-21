var sidebar = {

    collapse: function() {
        document.getElementById('sidebar').style.display = 'none';
        document.getElementById('expandSidebar').style.display = 'block';
    },

    expand: function() {
        document.getElementById('sidebar').style.display = 'block';
        document.getElementById('expandSidebar').style.display = 'none';
    }

};

onload.push(function() {
    if (window.innerWidth <= 800) sidebar.collapse();

    document.getElementById('collapseSidebar').addEventListener('click', function() {
        sidebar.collapse();
    });
    document.getElementById('expandSidebar').addEventListener('click', function() {
        sidebar.expand();
    });
});
