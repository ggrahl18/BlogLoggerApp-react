const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()

  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
})

describe('returned blogs', () => {

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

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
      url: 'www.google.com/grande'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(n => n.title)
    expect(titles).toContain(
      'Async/Await, Promises Explained!'
    )
  })

  test('blog without a title cannot be added', async () => {
    const newBlog = {
      author: 'Philacio Grande',
      url: 'www.google.com/grande'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('blog without an address cannot be added', async () => {
    const newBlog = {
      title: 'Async/Await, Promises Explained!',
      author: 'Philacio Grande'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('blog without an author cannot be added', async () => {
    const newBlog = {
      title: 'Async/Await, Promises Explained!',
      url: 'www.google.com/grande'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('delete functionality', () => {

  test('id was successfully deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', 'abc123')
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map((r) => r.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('likes / votes', () => {

  test('no likes property results to zero', async () => {
    const newBlog = {
      title: 'Async/Await, Promises Explained!',
      author: 'Philacio Grande',
      url: 'www.google.com/grande'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)

    const blogsAtEnd = await helper.blogsInDb()
    const newBlogLikes = blogsAtEnd[2].votes
    expect(newBlogLikes).toEqual(
      0
    )
  })

  test('likes was increased by one', async () => {
    const blogsInBeginning = await helper.initialBlogs
    const addOne = await blogsInBeginning[1].likes + 1

    expect(addOne).toEqual(6)
  })
})

describe('unique identification', () => {

  test('unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
  })
})

afterAll(() => {
  mongoose.connection.close()
})