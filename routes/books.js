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
  console.log("This is where we submit the form to add new books");
}));

/* GET an individual book */
router.get("/:id", asyncHandler(async (req, res) => {
  console.log("This is where we retrieve and display a book by ID");
}));

/* POST an individual book */
router.post("/:id", asyncHandler(async (req, res) => {
  console.log("This is where we update a book's details by ID");
}));

/* POST an individual book */
router.post("/:id/delete", asyncHandler(async (req, res) => {
  console.log("This is where we delete a book by its ID");
}));

module.exports = router;
