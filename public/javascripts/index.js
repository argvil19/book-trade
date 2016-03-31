$(document).ready(function() {
    $.get('/getTrades', function(data) {
        if (data.trades.length) {
            $('#tradesBtn').html('Your trades (' + data.trades.length + ' awaiting for response)');
        }
    });
})