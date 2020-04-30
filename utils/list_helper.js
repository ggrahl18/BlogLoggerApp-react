const dummy = (blog) => {
  let number = 1
  if (Array.isArray(blog)) {
    return number
  }
}

const totalLikes = (blogs) => {
  if (blogs.length === 1) {
    return(blogs[0].likes)
  } else {
    const likes = blogs.map((blog) => blog.likes)
    const reducer = (sum, item) => sum + item

    return likes.reduce(reducer, 0)
  }
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const sortedBlogs = [...blogs]
  sortedBlogs.sort((a, b) => a.likes < b.likes)
  const favorite = sortedBlogs[0]

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
}




module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}