const mongoose = require('mongoose')

if ( process.argv.length<3 ) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
`mongodb+srv://bossMan:${password}@cluster0-1mffo.mongodb.net/bloglogger-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  votes: Number
})

const Blog = mongoose.model('Blog', blogSchema)

// const blog = new Blog({
//   author: 'Andrew Skurka',
//   title: 'Andrew Skurka: Hard-won insights from out there',
//   url: 'https://andrewskurka.com/',
//   votes: 0
// })

// blog.save().then(response => {
//   console.log('blog saved!')
//   mongoose.connection.close()
// })

Blog.find({}).then(result => {
  result.forEach(blog => {
    console.log(blog)
  })
  mongoose.connection.close()
})