// Node Dependencies
var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');

// Import the Comment and Article models
var Comment = require('../models/Comment.js');
var Article = require('../models/Article.js');

// Home Page
router.get('/', function(req, res) {
  // Always scrape data when going to home page
  res.redirect('/scrape');
});

/*
 * Route to show all the articles scraped
 */
router.get('/articles', function(req, res) {
  // Query for all article entries
  Article.find()
    // Sort by having newest article on top
    .sort({
      _id: -1
    })
    // Populate all of the comments associated with the articles.
    .populate('comments')

  // Then, render the handlebars template
  .exec(function(err, doc) {
    // log errors if any
    if (err) {
      console.log(err);
    } else {
      var hbsObject = {
        articles: doc
      }
      res.render('index', hbsObject);
    }
  });
});

/*
 * Handle the scraping of www.espn.com
 */
router.get('/scrape', function(req, res) {
  // Get the body of the html
  request('http://www.espn.com/', function(error, response, html) {
    // Load html into cheerio as $ selector
    var $ = cheerio.load(html);

    // Now, grab every everything with a class of "inner" with each "article" tag
    $('.contentItem__title--story').each(function(i, element) {

      // Create an empty result object
      var result = {};

      // Get the Article Title
      result.title = $(this).text().trim() + ""; //convert to string for error handling later
      // Get the Article Link
      result.link = 'http://www.espn.com' + $(this).parent('div').parent('a').attr('href').trim();
      // Get the Article Summary
      result.summary = $(this).next('p').text().trim() + ""; //convert to string for error handling later

      // Ensure there are no empty content
      if (result.title !== "" && result.summary !== "") {

        // Create a new entry for Article model
        var entry = new Article(result);

        // Save the entry to DB
        entry.save(function(err, res) {
          // log errors if any
          if (err) {
            console.log(err);
          }
          else {
            console.log(res);
          }
        });
      }
      // Log that content was empty
      else {
        console.log('Empty Content. Not Saved to DB.')
      }
    });
    // Redirect to the Articles Page after scraping
    res.redirect("/articles");
  });
});

/*
 * Route for saving comments per article
 */
router.post('/add/comment/:id', function(req, res) {
  // Get article id
  var articleId = req.params.id;
  // Get Author Name
  var commentAuthor = req.body.name;
  // Get Comment Content
  var commentContent = req.body.comment;

  // Store as object with same key-value pairs of the "Comment" model
  var result = {
    author: commentAuthor,
    content: commentContent
  };

  // Create a new comment entry with Comment model
  var entry = new Comment(result);

  // Save the entry to the DB
  entry.save(function(err, doc) {
    // log any errors if any
    if (err) {
      console.log(err);
    }
    else {
      // Push the new Comment to the list of comments in the article
      Article.findOneAndUpdate({
          '_id': articleId
        }, {
          $push: {
            'comments': doc._id
          }
        }, {
          new: true
        })
        // execute the above query
        .exec(function(err, doc) {
          // log any errors
          if (err) {
            console.log(err);
          } else {
            // Send Success Header
            res.sendStatus(200);
          }
        });
    }
  });
});

/*
 * Route for deleting comments per article
 */
router.post('/remove/comment/:id', function(req, res) {
  // Get comment id
  var commentId = req.params.id;

  // Find and Delete the Comment using the Id
  Comment.findByIdAndRemove(commentId, function(err, todo) {
    if (err) {
      console.log(err);
    } else {
      res.sendStatus(200);
    }
  });
});

// Export Router to Server.js
module.exports = router;