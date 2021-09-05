var express = require('express');
var router = express.Router();
var Book = require("../models").Book;

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* GET books listing */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  console.log(books.map(books => books.toJSON()));
  res.render("index", { books, title: "Books" });
}));

/* GET books/new form */
router.get('/new', asyncHandler(async (req, res) => {
  res.render('new-book', { title: "New Book" })
}));

/* POST books/new form */
router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/');
  } catch (error) {
    throw error; // @todo: Fix this up with validation later
  }
}));

/* GET an individual book */
router.get("/:id", asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('update-book', { book, title: book.title })
  } else {
    const err = new Error(`Sorry! We couldn't find the book you were looking for.`);
    err.status = 404;
    console.log(`Error Status ${err.status}: ${err.message}`);
    next(err);
  }
}));

/* POST an update to an individual book */
router.post("/:id", asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect('/');
    } else {
      const err = new Error(`Sorry! We couldn't find the book you were looking for.`);
      err.status = 404;
      console.log(`Error Status ${err.status}: ${err.message}`);
      next(err);
    }
  } catch (error) {
    throw error; // @todo: Fix this up with proper validation later
  }
}));

/* POST an individual book */
router.post("/:id/delete", asyncHandler(async (req, res) => {
  console.log("This is where we delete a book by its ID");
}));

module.exports = router;
