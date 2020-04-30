const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 14,
    __v: 0
  },
  {
    _id: '5a422aaasd71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422aa71b54asda676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 3,
    __v: 0
  }
]

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const sortedBlogs = [...blogs]
  sortedBlogs.sort((a, b) => a.likes < b.likes)
  const favorite = sortedBlogs[0]

  return favorite
}

console.log(favoriteBlog(listWithOneBlog))