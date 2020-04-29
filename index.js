require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Blog = require('./models/blog')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)

let blogs = [
  {
    id: 1,
    author: 'Andrew Skurka',
    title: 'Andrew Skurka: Hard-won insights from out there',
    url: 'https://andrewskurka.com/',
    votes: 7
  },
  {
    id: 3,
    author: 'Derek Hansen',
    title: 'The Ultimate Hang',
    url: 'https://theultimatehang.com/blog/',
    votes: 0
  },
  {
    id: 2,
    author: 'Alan Dixon',
    title: 'ULTRALIGHT BACKPACKING & HIKING',
    url: 'https://www.adventurealan.com/',
    votes: 5
  },
  // FOR POSTMAN BELOW
  // {
  //   "author": "Derek Hansen",
  //   "title": "The Ultimate Hang",
  //   "url": "https://theultimatehang.com/blog/",
  //   "votes": 0
  // }
]

const generateId = () => {
  const maxId = blogs.length > 0
    ? Math.max(...blogs.map(n => n.id))
    : 0
  return maxId + 1
}

app.get('/api/blogs/:id', (request, response, next) => {
  Blog.findById(request.params.id)
    .then(blog => {
      if (blog) {
        response.json(blog.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.get('/api/blogs', (request, response) => {
  Blog.find({}).then(blogs => {
    response.json(blogs.map(blog => blog.toJSON()))
  })
})

app.post('/api/blogs', (request, response, next) => {
  const body = request.body

  if(!body.title === undefined) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const blog = new Blog( {
    title: body.title,
    author: body.author,
    url: body.url,
    votes: 0,
    id: generateId()
  })

  blog
    .save()
    .then(savedBlog => savedBlog.toJSON())
    .then(savedAndFormattedBlog => {
      response.json(savedAndFormattedBlog)
    })
    .catch(error => next(error))
})

app.put('/api/blogs/:id', (request, response, next) => {
  const body = request.body
  const blog = {
    votes: body.votes
  }

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then(updatePerson => {
      response.json(updatePerson.toJSON())
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})