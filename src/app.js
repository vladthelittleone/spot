'use strict';

const express = require('express');
const passport = require('passport');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// Наши модули
const config = require('./config/index');
const mongoose = require('./utils/mongoose');
const JobManager = require('./managers/index');

const app = express();

// В коде удобней различать среды по ИМЕНИ.
const developmentFlag = app.get('env') !== 'production';

expressInitialization();
passportInitialization();
routesInitialization();
jobsInitialization();
errorHandlersInitialization();

module.exports = app;

function routesInitialization () {
  // инициализируем api
  require('./routes')(app);
}

function jobsInitialization () {
  JobManager.startJobs();
}

function expressInitialization () {
  // uncomment after placing your favicon in /public
  // app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(methodOverride());
  app.use(cookieParser());
  // Serve static files from the React app
  // app.use(express.static(path.join(__dirname, 'client/build')));

  app.use(session({
    secret:            config.get('session:secret'),
    key:               config.get('session:key'),
    resave:            config.get('session:resave'),
    saveUninitialized: config.get('session:saveUninitialized'),
    cookie:            config.get('session:cookie'),
    rolling:           config.get('session:rolling'),
    store:             new MongoStore({
      mongooseConnection: mongoose.connection,
      stringify:          false
    })
  }));
}

function passportInitialization () {
  const strategies = require('./authentication');
  passport.use(strategies.vk);
  // Пример подключения стратегии
  app.use(passport.initialize());
  app.use(passport.session());
}

function errorHandlersInitialization () {
  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers
  if (developmentFlag) {
    // development error handler
    // will print stacktrace
    app.use(function (err, req, res) {
      res.status(err.status || 500);
      res.send(err);
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.send(err.message);
  });
}
