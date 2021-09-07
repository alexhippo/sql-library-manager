var express = require('express');
var router = express.Router();
var Book = require("../models").Book;
const { Op } = require("sequelize");

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

/* POST search books listing */
router.post('/', asyncHandler(async (req, res) => {
  console.log(req.body);
  const books = await Book.findAll({
    where: {
      [Op.or]: {
        title: {
          [Op.like]: `%${req.body.search}%`
        },
        author: {
          [Op.like]: `%${req.body.search}%`
        },
        genre: {
          [Op.like]: `%${req.body.search}%`
        },
        year: {
          [Op.like]: `%${req.body.search}%`
        },
      }
    }
  })
  res.render("search-results", { books, title: "Search Results" });
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
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('new-book', { book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }
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
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('update-book', { book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }
  }
}));

/* Delete individual book */
router.post("/:id/delete", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect('/');
  } else {
    const err = new Error(`Sorry! We couldn't find the book you were looking for.`);
    err.status = 404;
    console.log(`Error Status ${err.status}: ${err.message}`);
    next(err);
  }
}));

module.exports = router;
