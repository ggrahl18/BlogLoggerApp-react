const mongoose = require('mongoose')

mongoose.set('useFindAndModify', false)

const blogSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [ true, 'A Domain is required' ],
    work: [mongoose.SchemaTypes.Url, 'A Domain is required' ],
    profile: [mongoose.SchemaTypes.Url, 'A Domain is required'] ,
  },
  title: {
    type: String,
    minLength: 2,
    required: [ true, 'A title is required' ]
  },
  author: {
    type: String,
    minLength: 3,
    required: [ true, 'An author is required' ]
  },
  votes: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)