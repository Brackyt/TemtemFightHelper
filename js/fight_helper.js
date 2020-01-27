$(document).ready(function() {
    $.getJSON('data/temtem.json', function(data) {
        alert(JSON.stringify(data));
    });
});
