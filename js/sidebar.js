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
