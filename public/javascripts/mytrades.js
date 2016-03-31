function handleTradeResponse(e) {
    var book = e.currentTarget.parentElement.firstChild.lastChild.innerHTML;
    var from = e.currentTarget.parentElement.firstChild.nextSibling.lastChild.innerHTML;
    var to = e.currentTarget.parentElement.firstChild.nextSibling.nextSibling.lastChild.innerHTML;
    var response = e.target.getAttribute('data-response');
    $.get('getTrades?', {
        book:book,
        from:from,
        to:to,
        tradeResponse:response
    }, function(data) {
        window.location.reload();
    });
}

$(document).ready(function() {
    $.get('/getTrades', function(data) {
        if (data.trades.length) {
            data.trades.forEach(function(i) {
                var div = $('<div/>').addClass('col-xs-12 col-sm-6 trade-item');
                var p = $('<p/>').html('<strong>Book Name:</strong> ' + '<span>' + i.book + '</span>');
                var p1 = $('<p/>').html('<strong>Trade requested by:</strong> ' + '<span>' + i.from + '</span>');
                var p2 = $('<p/>').html('<strong>To:</strong> ' + '<span>' + i.to + '</span>');
                if ($('#user-email').val() === i.from) {
                    var p3 = $('<p/>').html('This trade is awaiting for response');
                    div.append(p).append(p1).append(p2).append(p3);
                    return $('.row').append(div);
                }
                var buttonAccept = $('<button/>').addClass('btn btn-primary').html('Accept').attr('data-response', 'accept');
                var buttonRefuse = $('<button/>').addClass('btn btn-danger').html('Refuse').attr('data-response', 'reject');
                div.append(p).append(p1).append(p2).append(buttonAccept).append(buttonRefuse);
                
                $('.row').append(div);
            });
            $('button').click(handleTradeResponse);
        }
    });
})