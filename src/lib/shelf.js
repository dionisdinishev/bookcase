import { supabase } from './supabase'

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
  const { data, error } = await supabase.rpc('add_book_to_shelf', {
    p_user_id: userId,
    p_status: status,
    p_isbn_13: bookData.isbn_13 || null,
    p_isbn_10: bookData.isbn_10 || null,
    p_title: bookData.title,
    p_page_count: bookData.page_count || 0,
    p_thumbnail: bookData.thumbnail || null,
    p_description: bookData.description || null,
    p_published_date: bookData.published_date || null,
    p_language: bookData.language || null,
    p_google_book_id: bookData.google_book_id || null,
    p_authors: bookData.authors || [],
    p_categories: bookData.categories || [],
  })

  if (error) throw error
  return data
}

export async function updateBookStatus(id, status) {
  const updates = { status }

  if (status === 'reading') {
    updates.started_at = new Date().toISOString()
  }

  if (status === 'read') {
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
