$(document).ready(function() {
    $.get('/allbooks', function(data) {
        $('.row').empty();
        for (var x=0;x<data.length;x++) {
            for (var i=0;i<data[x].books.length;i++) {
                var div = $('<div/>').addClass('col-xs-6 col-sm-3 padd');
                var img = $('<img/>').attr({
                    src:data[x].books[i].imageThumbnail,
                    title:data[x].books[i].name,
                    alt:data[x].books[i].name,
                    height:192,
                    width:128,
                    'data-owner':data[x].email
                }).css({'vertical-align':'text-top'});
                if ($('#email-val').val() !== data[x].email) {
                    $('.row').append(div.append(img).append($('<i/>').addClass("glyphicon glyphicon-retweet icon-pad trade")));
                } else {
                    $('.row').append(div.append(img));
                }
            }
        }
        $('i').click(function(e) {
            var book = $(e.currentTarget.previousSibling).attr('alt');
            var to = $(e.currentTarget.previousSibling).attr('data-owner');
            $.post('/newTrade', {book:book, to:to}, function(data) {
                if (typeof data === 'string') { 
                    var p = $('<p/>').addClass('alert alert-danger').html('This trade is already waiting for a response');
                    $('form').before(p);
                }
            });
        });
    });
});