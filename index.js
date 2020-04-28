const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())

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
    id: 2,
    author: 'Alan Dixon',
    title: 'ULTRALIGHT BACKPACKING & HIKING',
    url: 'https://www.adventurealan.com/',
    votes: 5 
  },
  {
    id: 3,
    author: 'Derek Hansen',
    title: 'The Ultimate Hang',
    url: 'https://theultimatehang.com/blog/',
    votes: 3 
  }
]

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/blogs', (req, res) => {
  res.json(blogs)
})

const generateId = () => {
  const maxId = blogs.length > 0
  ? Math.max(...blogs.map(n => n.id))
  : 0
  return maxId + 1
}

app.post('/api/blogs', (request, response) => {
  const body = request.body

  if(!body.title) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    votes: 0,
    id: generateId()
  }

  blogs = blogs.concat(blog)

  response.json(blog)
})

app.get('/api/blogs/:id', (request, response) => {
  const id = Number(request.params.id)
  const blog = blogs.find(blog => blog.id === id)
  
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/blogs/:id', (request, response) => {
  const id = Number(request.params.id)
  blogs = blogs.filter(blog => blog.id !== id)

  response.status(204).end()
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})