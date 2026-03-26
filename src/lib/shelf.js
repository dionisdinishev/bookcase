import { supabase } from './supabase'

// Find or create a book in the shared books table
async function findOrCreateBook(bookData) {
  // Try to find by ISBN first, then by google_book_id
  if (bookData.isbn_13) {
    const { data: existing } = await supabase
      .from('books')
      .select('id')
      .eq('isbn_13', bookData.isbn_13)
      .single()
    if (existing) return existing.id
  }

  if (bookData.google_book_id) {
    const { data: existing } = await supabase
      .from('books')
      .select('id')
      .eq('google_book_id', bookData.google_book_id)
      .single()
    if (existing) return existing.id
  }

  // Insert new book
  const { data: book, error } = await supabase
    .from('books')
    .insert({
      isbn_13: bookData.isbn_13,
      isbn_10: bookData.isbn_10,
      title: bookData.title,
      page_count: bookData.page_count,
      thumbnail: bookData.thumbnail,
      description: bookData.description,
      published_date: bookData.published_date,
      language: bookData.language,
      google_book_id: bookData.google_book_id,
    })
    .select('id')
    .single()

  if (error) throw error

  // Insert authors
  if (bookData.authors?.length) {
    for (const name of bookData.authors) {
      const authorId = await findOrCreateAuthor(name)
      await supabase
        .from('book_authors')
        .upsert({ book_id: book.id, author_id: authorId })
    }
  }

  // Insert categories
  if (bookData.categories?.length) {
    for (const name of bookData.categories) {
      const categoryId = await findOrCreateCategory(name)
      await supabase
        .from('book_categories')
        .upsert({ book_id: book.id, category_id: categoryId })
    }
  }

  return book.id
}

async function findOrCreateAuthor(name) {
  const { data: existing } = await supabase
    .from('authors')
    .select('id')
    .eq('name', name)
    .single()

  if (existing) return existing.id

  const { data, error } = await supabase
    .from('authors')
    .insert({ name })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

async function findOrCreateCategory(name) {
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('name', name)
    .single()

  if (existing) return existing.id

  const { data, error } = await supabase
    .from('categories')
    .insert({ name })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function getUserBooks(userId) {
  const { data, error } = await supabase
    .from('user_books')
    .select(`
      *,
      book:books(
        *,
        book_authors(author:authors(*)),
        book_categories(category:categories(*))
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function addBook(userId, bookData, status = 'want_to_read') {
  const bookId = await findOrCreateBook(bookData)

  const { data, error } = await supabase
    .from('user_books')
    .upsert({
      user_id: userId,
      book_id: bookId,
      status,
      pages_read: 0,
    }, {
      onConflict: 'user_id,book_id',
    })
    .select()

  if (error) throw error
  return data
}

export async function updateBookStatus(id, status) {
  const updates = { status }

  if (status === 'reading' && !updates.started_at) {
    updates.started_at = new Date().toISOString()
  }

  if (status === 'read') {
    const { data: userBook } = await supabase
      .from('user_books')
      .select('book:books(page_count)')
      .eq('id', id)
      .single()
    if (userBook?.book?.page_count) {
      updates.pages_read = userBook.book.page_count
    }
    updates.finished_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('user_books')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data
}

export async function updatePagesRead(id, pagesRead) {
  const { data, error } = await supabase
    .from('user_books')
    .update({ pages_read: pagesRead })
    .eq('id', id)
    .select()

  if (error) throw error
  return data
}

export async function updateRating(id, rating) {
  const { data, error } = await supabase
    .from('user_books')
    .update({ rating })
    .eq('id', id)
    .select()

  if (error) throw error
  return data
}

export async function removeBook(id) {
  const { error } = await supabase
    .from('user_books')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getUserStats(userId) {
  const { data, error } = await supabase
    .from('user_books')
    .select(`
      *,
      book:books(
        *,
        book_authors(author:authors(*)),
        book_categories(category:categories(*))
      )
    `)
    .eq('user_id', userId)

  if (error) throw error

  const items = data || []
  const read = items.filter(b => b.status === 'read')
  const reading = items.filter(b => b.status === 'reading')
  const wantToRead = items.filter(b => b.status === 'want_to_read')

  const totalPagesRead = read.reduce((sum, b) => sum + (b.book?.page_count || 0), 0)
    + reading.reduce((sum, b) => sum + (b.pages_read || 0), 0)

  const avgPages = read.length > 0
    ? Math.round(totalPagesRead / read.length)
    : 0

  // Monthly reads
  const monthlyReads = {}
  read.forEach(b => {
    const date = b.finished_at || b.created_at
    const month = date?.slice(0, 7)
    if (month) monthlyReads[month] = (monthlyReads[month] || 0) + 1
  })

  // Top authors
  const authorCounts = {}
  items.forEach(b => {
    (b.book?.book_authors || []).forEach(ba => {
      const name = ba.author?.name
      if (name) authorCounts[name] = (authorCounts[name] || 0) + 1
    })
  })
  const topAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Top categories
  const categoryCounts = {}
  items.forEach(b => {
    (b.book?.book_categories || []).forEach(bc => {
      const name = bc.category?.name
      if (name) categoryCounts[name] = (categoryCounts[name] || 0) + 1
    })
  })
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Average rating
  const rated = items.filter(b => b.rating)
  const avgRating = rated.length > 0
    ? (rated.reduce((sum, b) => sum + b.rating, 0) / rated.length).toFixed(1)
    : null

  return {
    totalBooks: items.length,
    booksRead: read.length,
    booksReading: reading.length,
    booksWantToRead: wantToRead.length,
    totalPagesRead,
    avgPagesPerBook: avgPages,
    avgRating,
    monthlyReads,
    topAuthors,
    topCategories,
  }
}
