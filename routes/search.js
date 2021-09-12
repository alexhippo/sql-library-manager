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

/* GET search books listing */
router.get('/', asyncHandler(async (req, res) => {
  if (!req.query.q) {
    res.redirect('/');
  }
  const books = await Book.findAll({
    where: {
      [Op.or]: {
        title: {
          [Op.like]: `%${req.query.q}%`
        },
        author: {
          [Op.like]: `%${req.query.q}%`
        },
        genre: {
          [Op.like]: `%${req.query.q}%`
        },
        year: {
          [Op.like]: `%${req.query.q}%`
        },
      }
    }

  });
  if (books.length > 0) {
    res.render("search/search-results", { books, title: "Search results", searchTerm: req.query.q });
  } else {
    res.render("search/no-search-results", { title: "Search results", searchTerm: req.query.q });
  }
}));

module.exports = router;