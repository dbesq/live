const router = require('express').Router();
const async = require('async');
const Gig = require('../models/gig');
const Venue = require('../models/venue');
const User = require('../models/user');
const Promocode = require('../models/promocode');

const algoliasearch = require('algoliasearch');
var client = algoliasearch("7GDGRNWZ59", "9fd4b5f3e1727a7b6027b3f41c220fe1");
var indexGig = client.initIndex('GigSchema');
var indexVenue = client.initIndex('VenueSchema');

// Render Gigs and Venues on Homepage

router.get('/', (req, res, next) => {
    Gig.find({}, function(err, gigs) {
      Venue.find({}, function(err, venues){
        res.render('main/home', { gigs: gigs, venues: venues });
      });
    });    
});

// router.get('/', (req, res, next) => {
//   Venue.find({}, function(err, venues) {
//     res.render('main/home', { venues: venues });
//   })
//   console.log(venues);
// });

//Event Search and Render
router.route('/search')
  .get((req, res, next) => {
    if (req.query.q) {
      indexGig.search(req.query.q, function(err, content) {
        console.log(content);
        res.render('main/search_results', { content: content, search_result: req.query.q });
      });
    }
  })
  .post((req, res, next) => {
    res.redirect('/search/?q=' + req.body.search_input);
  });

router.get('/my-gigs', (req, res, next) => {
  Gig.find({ owner: req.user._id }, function(err, gigs) {
    res.render('main/my-gigs', { gigs: gigs });
  })
});

//Ad New Event
router.route('/add-new-gig')
  .get((req, res, next) => {
    res.render('main/add-new-gig');
  })
  .post((req, res, next) => {
    console.log('Posting');
    async.waterfall([
      function(callback) {
        console.log('Posting 2');
        var gig = new Gig();
        gig.owner = req.user._id;
        gig.title = req.body.gig_title;
        gig.category = req.body.gig_category;
        gig.about = req.body.gig_about;
        gig.price = req.body.gig_price;
        gig.save(function(err) {
          console.log('Posting 3');
          callback(err, gig);
        });
      },

      function(gig, callback) {
        console.log('Posting 4');
        User.update(
          {
            _id: req.user._id
          },{
            $push: { gigs: gig._id }
          }, function(err, count) {
            console.log('Posting 5');
            res.redirect('/my-gigs');
          }
        )
      }
    ]);
  });

//Venue Search and Render
router.route('/search')
  .get((req, res, next) => {
    if (req.query.q) {
      indexEvent.search(req.query.q, function(err, content) {
        console.log(content);
        res.render('main/search_results', { content: content, search_result: req.query.q });
      });
    }
  })
  .post((req, res, next) => {
    res.redirect('/search/?q=' + req.body.search_input);
  });

router.get('/my-venues', (req, res, next) => {
  Venue.find({ owner: req.user._id }, function(err, venues) {
    res.render('main/my-venues', { venues: venues });
  })
});

//Add New Venue
router.route('/add-new-venue')
  .get((req, res, next) => {
    res.render('main/add-new-venue');
  })
  .post((req, res, next) => {
    console.log('Posting Venue');
    async.waterfall([
      function(callback) {
        console.log('Posting 2');
        var venue = new Venue();
        venue.owner = req.user._id;
        venue.type = req.body.venue_type;
        venue.location = req.body.venue_location;
        venue.capacity = req.body.venue_capacity;
        venue.events = req.body.venue_events;
        venue.about = req.body.venue_about;
        venue.save(function(err) {
          console.log('Posting 3');
          callback(err, venue);
        });
      },

      function(venue, callback) {
        console.log('Posting 4');
        User.update(
          {
            _id: req.user._id
          },{
            $push: { venue: venue._id }
          }, function(err, count) {
            console.log('Posting 5');
            res.redirect('/my-venues');
          }
        )
      }
    ]);
  });


//Display When Click on Event or Venue
router.get('/service_detail/:id', (req, res, next) => {
  Gig.findOne({ _id: req.params.id })
    .populate('owner')
    .exec(function(err, gig) {
      res.render('main/service_detail', { gig: gig });
    });
});

router.get('/service_detail/:id', (req, res, next) => {
  Venue.findOne({ _id: req.params.id })
    .populate('owner')
    .exec(function(err, venue) {
      res.render('main/service_detail', { venue: venue });
    });
});

router.get('/venue_detail/:id', (req, res, next) => {
  Venue.findOne({ _id: req.params.id })
    .populate('owner')
    .exec(function(err, venue) {
      res.render('main/venue_detail', { venue: venue });
    });
});


//Promocode
router.get('/api/add-promocode', (req, res, next) => {
  var promocode = new Promocode();
  promocode.name = "testcoupon";
  promocode.discount = 0.4;
  promocode.save(function(err) {
    res.json("Successful");
  });
});

router.post('/promocode', (req, res, next) => {
  var promocode = req.body.promocode;
  var totalPrice = req.session.price;
  Promocode.findOne({ name: promocode }, function(err, foundCode) {
    if (foundCode) {
      var newPrice = foundCode.discount * totalPrice;
      newPrice = totalPrice - newPrice;
      req.session.price = newPrice;
      res.json(newPrice);
    } else {
      res.json(0);
    }
  });
});

module.exports = router;
