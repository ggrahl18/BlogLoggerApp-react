const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const bcrypt = require('bcrypt')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

const getToken = async (username, password) => {
  const user = await api
    .post('/api/login')
    .send({ username, password })

  return user.body.token
}

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const user = await helper.createUser('gman', 'theman')

  for (const blog of helper.initialBlogs) {
    const newBlog = new Blog({ ...blog, user: user._id })
    await newBlog.save()
    user.blogs = user.blogs.concat(newBlog._id)
    await user.save()
  }
})

describe('returned blogs', () => {

  test('blogs are returned as json', async () => {
    const token = await getToken('gman', 'theman')

    await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const token = await getToken('gman', 'theman')

    const response = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(titles).toContain(
      'React patterns'
    )
  })
})

describe('adding blogs', () => {

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Async/Await, Promises Explained!',
      author: 'Philacio Grande',
      url: 'www.google.com/grande',
      votes: 1
    }

    const token = await getToken('gman', 'theman')

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb(token)
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(n => n.title)
    expect(titles).toContain(
      'Async/Await, Promises Explained!'
    )
  })

  test('no likes property results to zero', async () => {
    const newBlog = {
      title: 'Async/Await, Promises Explained!',
      author: 'Philacio Grande',
      url: 'www.google.com/grande',
    }

    const token = await getToken('gman', 'theman')

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    expect(response.body[helper.initialBlogs.length].votes).toBe(0)
  })

  test('blog without a title cannot be added', async () => {
    const newBlog = {
      author: 'Philacio Grande',
      url: 'www.google.com/grande'
    }

    const token = await getToken('gman', 'theman')

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('blog without an address cannot be added', async () => {
    const newBlog = {
      title: 'Async/Await, Promises Explained!',
      author: 'Philacio Grande'
    }

    const token = await getToken('gman', 'theman')

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)


    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('blog without an author cannot be added', async () => {
    const newBlog = {
      title: 'Async/Await, Promises Explained!',
      url: 'www.google.com/grande'
    }

    const token = await getToken('gman', 'theman')

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('delete functionality', () => {

  test('id was successfully deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    const token = await getToken('gman', 'theman')

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map((r) => r.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('likes / votes', () => {
  test('likes was increased by one', async () => {
    const blogsInBeginning = await helper.initialBlogs
    const addOne = await blogsInBeginning[1].votes + 1

    expect(addOne).toEqual(6)
  })
})

describe('unique identification', () => {

  test('unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
  })
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('theman', 10)
    const user = new User({ username: 'gman', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
})

afterAll(() => {
  mongoose.connection.close()
})