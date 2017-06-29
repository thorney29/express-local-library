var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');
var async = require('async');

// Display list of all BookInstances
exports.bookinstance_list = function(req, res, next) {

  BookInstance.find()
    .populate('book')
    .exec(function (err, list_bookinstances) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('bookinstance_list', { title: 'Book Status', bookinstance_list: list_bookinstances });
    });
    
};

// Display detail page for a specific BookInstance
exports.bookinstance_detail = function(req, res, next) {

  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('bookinstance_detail', { title: 'Book:', bookinstance: bookinstance });
    });
    
};

// Display BookInstance create form on GET
exports.bookinstance_create_get = function(req, res, next) {       

    Book.find({},'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('bookinstance_form', {title: 'Create Book Status', book_list:books});
    });
    
};

// Handle BookInstance create on POST 
exports.bookinstance_create_post = function(req, res, next) {

    req.checkBody('book', 'Book must be specified').notEmpty(); //We won't force Alphanumeric, because book titles might have spaces.
    req.checkBody('imprint', 'Imprint must be specified').notEmpty();
    req.checkBody('due_back', 'Invalid date').optional({ checkFalsy: true }).isDate();
    
    req.sanitize('book').escape();
    req.sanitize('imprint').escape();
    req.sanitize('status').escape();
    req.sanitize('book').trim();
    req.sanitize('imprint').trim();   
    req.sanitize('status').trim();
    req.sanitize('due_back').toDate();
    
    var bookinstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint, 
        status: req.body.status,
        due_back: req.body.due_back
    });

    var errors = req.validationErrors();
    if (errors) {
        
        Book.find({},'title')
        .exec(function (err, books) {
          if (err) { return next(err); }
          //Successful, so render
          res.render('bookinstance_form', { title: 'Create Book Status', book_list : books, selected_book : bookinstance.book._id , errors: errors, bookinstance:bookinstance });
        });
        return;
    } 
    else {
    // Data from form is valid
    
        bookinstance.save(function (err) {
            if (err) { return next(err); }
               //successful - redirect to new book-instance record.
               res.redirect(bookinstance.url);
            }); 
    }

};

// Display Book Instance delete form on GET
exports.bookinstance_delete_get = function(req, res, next) {       

    async.parallel({
        bookinstance: function(callback) {     
            BookInstance.findById(req.params.id).exec(callback);
        },
        bookinstances_books: function(callback) {
          Book.find({ 'bookinstance': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('bookinstance_delete', { title: 'Delete Book Status', bookinstance: results.bookinstance, bookinstance_books: results.bookinstances_books } );
    });
    
};

// Handle Genre delete on POST 
exports.bookinstance_delete_post = function(req, res, next) {

    req.checkBody('bookinstanceid', 'Book Status id must exist').notEmpty();  
    
    async.parallel({
        bookinstance: function(callback) {     
            BookInstance.findById(req.body.genreid).exec(callback);
        },
        bookinstances_books: function(callback) {
          Book.find({ 'bookinstance': req.body.bookinstanceid },'title summary').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
            //If success and -
            //Book Instance has no books. Delete object and redirect to the list of authors.
            BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookInstance(err) {
                if (err) { return next(err); }
                //Success - got to bookinstance list
                res.redirect('/catalog/bookinstances');
            });

        // }
    });

};

// Display BookInstance update form on GET
exports.bookinstance_update_get = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    //Get book, authors and genres for form
    async.parallel({
        bookinstance: function(callback) {
            BookInstance.findById(req.params.id).populate('book').exec(callback)
        },
        books: function(callback) {
            Book.find(callback)
        },

        }, function(err, results) {
            if (err) { return next(err); }

            res.render('bookinstance_form', { title: 'Update Book Status', book_list : results.books, selected_book : results.bookinstance.book._id, bookinstance:results.bookinstance });
        });
};

// Handle bookinstance update on POST
exports.bookinstance_update_post = function(req, res) {  
    req.checkBody('book', 'Book must be specified').notEmpty(); //We won't force Alphanumeric, because book titles might have spaces.
    req.checkBody('imprint', 'Imprint must be specified').notEmpty();
    req.checkBody('due_back', 'Invalid date').optional({ checkFalsy: true }).isDate();
    
    req.sanitize('book').escape();
    req.sanitize('imprint').escape();
    req.sanitize('status').escape();
    req.sanitize('book').trim();
    req.sanitize('imprint').trim();   
    req.sanitize('status').trim();
    req.sanitize('due_back').toDate();
    
    var bookinstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint, 
        status: req.body.status,
        due_back: req.body.due_back,
        _id: req.params.id

    });
   
    //Run the validators
    var errors = req.validationErrors();
  
    if (errors) {
        Book.find({},'title')
        .exec(function (err, books) {
          if (err) { return next(err); }
          //Successful, so render
          res.render('bookinstance_form', { title: 'Update Book Status', book_list : books, selected_book : bookinstance.book._id , errors: errors, bookinstance:bookinstance });
        });
        return;
      
    } 
    else {
        // Data from form is valid. Update the record.
        BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err,thebookinstance) {
        if (err) { return next(err); }
        //successful - redirect to author detail page.
        res.redirect(thebookinstance.url);
        });
            
    }
};




