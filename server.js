// *****************************************************************************
// Server.js - This file is the initial starting point for the Node/Express server.
//
// ******************************************************************************
// *** Dependencies
// =============================================================
var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require('express-handlebars');
var mongoose = require("mongoose");

// Sets up the Express App
// =============================================================
var app = express();
// var sessionStore = new session.MemoryStore;
var PORT = process.env.PORT || 3000;

// Requiring our models for syncing
var db = require("./models");

var axios = require("axios");
var cheerio = require("cheerio");

// Sets up the Express app to handle data parsing

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

//For Handlebars
app.set('views', './views')
app.engine('hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main'
}));
app.set('view engine', '.hbs');
 

// Static directory
app.use(express.static("public"));

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Routes
// =============================================================

app.get("/", function(req, res) {
    // First, we grab the body of the html with request
    axios.get("https://pitchfork.com/news/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);

      var hero = $(".news-hero .article-details");
      var second = $(".second-tier .latest-module");
      var third = $(".third-tier .latest-module");
    
      var newArr = [hero, second, third];
        //console.log($(this));
      // Now, we grab every h2 within an article tag, and do the following:

      newArr.forEach(function(element) {
        element.each(function (i, element) {
          var result = {};

          result.headline = $(this).find(".title").text();
          result.url = $(this).find("a").attr("href");
          result.summary = $(this).find(".abstract p").text();
          result.author = $(this).find(".authors .display-name").text().slice(4)
          result.image = $(this).find("img").attr("src")

          db.Headline.create(result)
          .then(function(dbHeadline) {
            // View the added result in the console
            console.log(dbHeadline);
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            console.log(err);
            //return res.json(err);
          });
        });
      })
    })
    .then(function () {
      db.Headline.find({})
        .then(function(dbHeadlines) {
          // If we were able to successfully find Articles, send them back to the client
          console.log(dbHeadlines);
          res.render("index", {"headlines": dbHeadlines});
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
    });
  });

  app.post("/headlines/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry

    console.log(req.body);
    
    db.Comment.create(req.body)
      .then(function(dbComment) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Headline.findOneAndUpdate({ _id: req.params.id }, { note: dbComment._id }, { new: true });
      })
      .then(function(dbHeadline) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbHeadline);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
