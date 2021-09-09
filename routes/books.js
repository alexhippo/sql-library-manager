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
  const pagination = await Book.findAndCountAll({
    limit: 10,
    offset: 0
  });
  const numberOfPages = Math.ceil(pagination.count / 10);
  const books = await Book.findAll();
  console.log(books.map(books => books.toJSON()));
  res.render("index", { books: pagination.rows, title: "Books", numberOfPages, currentPage: 1 });
}));

/* Pagination routes */
router.get('/page/:id', asyncHandler(async (req, res) => {
  const pageNumber = req.params.id - 1;
  const pagination = await Book.findAndCountAll({
    limit: 10,
    offset: pageNumber * 10
  });
  const numberOfPages = Math.ceil(pagination.count / 10);
  res.render("index", { books: pagination.rows, title: "Books", numberOfPages, currentPage: req.params.id });
}));

/* POST search books listing */
router.post('/', asyncHandler(async (req, res) => {
  if (!req.body.search) {
    res.redirect('/');
  }
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

  });
  if (books.length > 0) {
    res.render("search-results", { books, title: "Search results", searchTerm: req.body.search });
  } else {
    res.render("no-search-results", { title: "Search results", searchTerm: req.body.search });
  }
}));

/* GET books/new form */
router.get('/new', asyncHandler(async (req, res) => {
  res.render('books/new-book', { book: Book.build(), title: "New Book" })
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
      res.render('books/new-book', { book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }
  }
}));

/* GET an individual book */
router.get("/:id", asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('books/update-book', { book, title: book.title })
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
      res.render('books/update-book', { book, errors: error.errors, title: "New Book" })
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
