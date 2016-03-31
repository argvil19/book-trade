var User = require('../models/user');
var async = require('async');

module.exports = function (app, passport) {
    
    app.get('/', function(req, res) {
        var toSend = {};
        if (req.isAuthenticated()) {
            toSend.user = req.user;
        }
        return res.render('index', toSend);
    });
    
    app.get('/signup', function(req, res) {
        if (req.isAuthenticated()) {
            return res.redirect('/');
        }
        return res.render('signup', {signupMessage:req.flash('signupMessage')});
    });
    
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect:'/',
        failureRedirect:'/signup',
        failureFlash:true
    }));
    
    app.get('/signin', function(req, res) {
        if (req.isAuthenticated()) {
            return res.redirect('/');
        }
        return res.render('signin', {loginMessage:req.flash('loginMessage')});
    });
    
    app.post('/signin', passport.authenticate('local-login', {
        successRedirect:'/',
        failureRedirect:'/signin',
        failureFlash:true
    }));
    
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    
    
    app.get('/profile', isLoggedIn, function(req, res) {
        var toSend = {};
        toSend.update = req.flash('profileUpdate')[0];
        return User.findOne({email:req.user.email}, function(err, data) {
            if (err)
                return err;
            if (data.name)
                toSend.name = data.name;
            if (data.city)
                toSend.city = data.city;
            if (data.state)
                toSend.state = data.state;
            return res.render('profile', toSend);
        })
    })
    
    
    app.post('/profile', isLoggedIn, function(req, res) {
        var user = req.user.email;
        var toSend = {};
        if (req.body.city)
            toSend.city = req.body.city;
        if (req.body.state) 
            toSend.state = req.body.state;
        if (req.body.name) 
            toSend.name = req.body.name;
        User.update({email:user}, toSend, function(err, data) {
            if (err)
                return err;
            req.flash('profileUpdate', 'Your profile has been successfully updated');
            return res.redirect('/profile');
        });
    });
    
    app.get('/mybooks', isLoggedIn, function(req, res) {
        return res.render('mybooks');
    });
    
    app.get('/getbooks', isLoggedIn, function(req, res) {
        User.findOne({email:req.user.email}, {name:0, _id:0, city:0, state:0, email:0, password:0, __v:0}, function(err, data) {
            if (err)
                return err;
            if (!data.books.length) {
                return res.send(['You have not added any books yet!']);
            } else {
                return res.send(data.books);
            }
        });
    });
    
    app.post('/addbook', isLoggedIn, function(req, res) {
        var name = req.body.name;
        var img = req.body.thumbnail;
        User.update({email:req.user.email}, {$push:{
            books:{
                name:name,
                imageThumbnail:img
            }
        }}, function(err, data) {
            if (err) {
                return err;
            }
            res.send('done');
        });
    });
    
    app.post('/deleteBook', isLoggedIn, function(req, res) {
        var name = req.body.name;
        User.update({email:req.user.email}, {$pull:{books:{
            name:name
        }}}, function(err) {
            if (err) {
                return err;
            }
            return res.redirect('/getbooks');
        });
    });
    
    app.get('/books', isLoggedIn, function(req, res) {
        return res.render('books', {email:req.user.email});
    });
    
    app.get('/allbooks', isLoggedIn, function(req, res) {
        User.find({}, {books:1, email:1, _id:0}, {multi:true}, function(err, data) {
            if (err) {
                throw err;
            }
            if (data.length) {
                return res.send(data);
            }
        });
    });
    
    app.post('/newTrade', isLoggedIn, function(req, res) {
        var from = req.user.email;
        var to = req.body.to;
        var book = req.body.book;
        User.find({email:from, trades:{
            $elemMatch:{
                book:book,
                from:from,
                to:to
            }
        }}, function(err, data) {
            if (err) {
                throw err;
            }
            if (data.length) {
                return res.send('NOPE');
            } else {
                User.update({email:from}, {$push:{trades:{from:from, to:to, book:book}}}, function(err, data) {
                    if (err) {
                        throw err;
                    }
                    User.update({email:to}, {$push:{trades:{from:from, to:to, book:book}}}, function(err, data) {
                        if (err) {
                            throw err;
                        }
                        return res.redirect('/allbooks');
                    });
                });
            }
        });
    });
    
    app.get('/trades', isLoggedIn, function(req, res) {
        var toSend = {
            user:req.user.email
        }
        return res.render('trades', toSend);
    })
    
    app.get('/getTrades?', isLoggedIn, function(req, res) {
        var tradeResponse = req.query.tradeResponse || 'default';
        var to = req.query.to || "";
        var from = req.query.from || "";
        var book = req.query.book || "";
        switch(tradeResponse) {
            case 'accept':
                User.update({trades:{
                    $elemMatch:{
                        to:to,
                        from:from,
                        book:book
                    }
                }}, {$pull:{
                    trades:{
                        to:to,
                        from:from,
                        book:book
                    }
                }}, {multi:true}, function(err, data) {
                    if (err) {
                        throw err;
                    }
                    User.find({email:to}, {_id:0, books:1}, function(err, data) {
                        if (err) {
                            throw err;
                        }
                        for (var i=0;i<data[0].books.length;i++) {
                            if (data[0].books[i].name === book) {
                                return User.update({email:from}, {$push:{
                                    books:{
                                        name: data[0].books[i].name,
                                        imageThumbnail: data[0].books[i].imageThumbnail
                                    }
                                }}, function(err, data) {
                                    if (err) {
                                        throw err;
                                    }
                                    console.log(data);
                                    User.update({email:to}, {$pull:{
                                        books:{
                                            name:book
                                        }
                                    }}, function(err, data) {
                                        if (err) {
                                            throw err;
                                        }
                                        console.log(data);
                                        return res.send('success');
                                    });
                                });
                            }
                        }
                    });
                });
                break;
            case 'reject':
                User.update({trades:{
                    $elemMatch:{
                        to:to,
                        from:from,
                        book:book
                    }
                }}, {$pull:{
                    trades:{
                        to:to,
                        from:from,
                        book:book
                    }
                }}, {multi:true}, function(err, data) {
                    if (err) {
                        throw err;
                    }
                    return res.send('success');
                });
                break;
            default:
                User.findOne({email:req.user.email}, {_id:0, trades:1}, function(err, data) {
                    if (err) {
                        throw err;
                    }
                    return res.send(data);
                });
        }
    });
    
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
       return next();
    } else
    res.redirect('/');
}