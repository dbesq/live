const mongoose = require('mongoose');
const mongooseAlgolia = require('mongoose-algolia');
const Schema = mongoose.Schema;

const VenueSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User'},
  type: String,
  location: String,
  capacity: Number,
  zipCode: Number,
  events: String,
  about: String, 
  picture: { type: String, default: 'https://images.unsplash.com/photo-1562878971-f02ace4ffa8d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80'},
  created: { type: Date, default: Date.now }
});

VenueSchema.plugin(mongooseAlgolia,{
  appId: '7GDGRNWZ59',
  apiKey: '0cfa3a7b5bbef5e4c9e43e640aae948d',
  indexName: 'VenueSchema', //The name of the index in Algolia, you can also pass in a function
  selector: 'title _id owner category about price picture', //You can decide which field that are getting synced to Algolia (same as selector in mongoose)
  populate: {
    path: 'owner',
    select: 'name'
  },
  defaults: {
    author: 'unknown'
  },
  mappings: {
    title: function(value) {
      return `Title: ${value}`
    }
  },
  debug: true // Default: false -> If true operations are logged out in your console
});


let Model = mongoose.model('Venue', VenueSchema);

Model.SyncToAlgolia(); //Clears the Algolia index for this schema and synchronizes all documents to Algolia (based on the settings defined in your plugin settings)
Model.SetAlgoliaSettings({
  searchableAttributes: ['title','owner.name'] //Sets the settings for this schema, see [Algolia's Index settings parameters](https://www.algolia.com/doc/api-client/javascript/settings#set-settings) for more info.
});

module.exports = Model;
