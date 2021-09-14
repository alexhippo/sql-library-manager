var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const Sequelize = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'library.db'
});

var indexRouter = require('./routes/index');
var booksRouter = require('./routes/books');
var searchRouter = require('./routes/search');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/books', booksRouter);
app.use('/search', searchRouter);

// async IIFE
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database successful!');
    await sequelize.sync({ force: true })
  } catch (error) {
    console.error('Error connecting to the database: ', error);
  }
})();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error();
  err.message = `Sorry! We couldn't find the page you were looking for.`;
  err.status = 404;
  next(err);
});

// global error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  if (err.status === 404) {
    res.status(404).render('errors/page-not-found', err);
  } else {
    err.message = "Sorry! There was an unexpected error on the server.";
    err.status = err.status || 500;
    res.status(err.status || 500).render('errors/error', err);
  };
});

module.exports = app;
