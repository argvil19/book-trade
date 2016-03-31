function getBooks() {
    $.get('/getbooks', function(data) {
        if (typeof data[0] === "string") {
            $('.row').empty();
            $('form').before($('<p/>').addClass('alert alert-danger').html('You have not added any book!'));
            return false;
        } else {
            $('.alert').remove();
            $('.row').empty();
            data.forEach(function(i) {
                var div = $('<div/>').addClass('col-xs-6 col-sm-3 padd');
                var img = $('<img/>').attr({
                    src:i.imageThumbnail,
                    alt:i.name,
                    height:192,
                    width:128
                }).css({'vertical-align':'text-top'});
                $('.row').append(div.append(img).append($('<i/>').addClass("glyphicon glyphicon-remove icon-pad delete")));
            });
            $('i').click(function(e) {
                var name = $(e.currentTarget.previousSibling).attr('alt');
                $.post('/deleteBook', {name:name}, function(data) {
                    getBooks();
                })
            });
        }
    });
}

$(document).ready(function() {
    $('form').submit(function(e) {
        $.get('https://www.googleapis.com/books/v1/volumes?q=' + $('#book').val(), function(data) {
            var toSend = {};
            if (data.totalItems) {
                if (!data.items[0].volumeInfo.imageLinks) {
                    data.items[0].volumeInfo.imageLinks = {};
                    data.items[0].volumeInfo.imageLinks.smallThumbnail = "https://fcc-din-apps-argvil19.c9users.io/images/no-preview.jpg"
                }
                toSend.name = data.items[0].volumeInfo.title;
                toSend.thumbnail = data.items[0].volumeInfo.imageLinks.smallThumbnail.replace('http://', 'https://');
            }
            $.post('/addbook', toSend, function(data) {
                getBooks();
            });
        });
        return false;
    });
    
    getBooks();
});