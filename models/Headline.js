var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var HeadlineSchema = new Schema({
  // `title` is required and of type String
  headline: {
    type: String,
    required: true,
    // unique: true
  },
  url: {
    type: String,
    required: true
  },
  // `link` is required and of type String
  summary: {
    type: String,
    required: false
  },
  author: {
      type: String,
      required: false
  },
  image: {
    type: String
  },
  // `note` is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Article with an associated Note
  comment: [{
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }]
});

// This creates our model from the above schema, using mongoose's model method
var Headline = mongoose.model("Headline", HeadlineSchema);

// Export the Article model
module.exports = Headline;
