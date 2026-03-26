import { supabase } from './supabase'

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes'
const USE_EDGE_FUNCTION = import.meta.env.VITE_USE_EDGE_FUNCTION === 'true'

async function fetchFromEdgeFunction(query, startIndex) {
  const { data, error } = await supabase.functions.invoke('search-books', {
    body: { query, startIndex, maxResults: 20 },
  })
  if (error) throw new Error(error.message || 'Search failed')
  return data
}

async function fetchDirectly(query, startIndex) {
  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY
  const params = new URLSearchParams({
    q: query,
    startIndex: startIndex.toString(),
    maxResults: '20',
    ...(apiKey && { key: apiKey }),
  })
  const res = await fetch(`${GOOGLE_BOOKS_API}?${params}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Search failed')
  return data
}

export async function smartSearch(query, startIndex = 0) {
  if (!query.trim()) return { items: [], totalItems: 0 }

  const data = USE_EDGE_FUNCTION
    ? await fetchFromEdgeFunction(query, startIndex)
    : await fetchDirectly(query, startIndex)

  return {
    items: (data.items || []).map(parseBook),
    totalItems: data.totalItems || 0,
  }
}

function parseBook(item) {
  const info = item.volumeInfo || {}
  const identifiers = info.industryIdentifiers || []
  const isbn13 = identifiers.find(i => i.type === 'ISBN_13')
  const isbn10 = identifiers.find(i => i.type === 'ISBN_10')

  return {
    google_book_id: item.id,
    title: info.title || 'Unknown Title',
    authors: info.authors || ['Unknown Author'],
    description: info.description || '',
    page_count: info.pageCount || 0,
    published_date: info.publishedDate || '',
    categories: info.categories || [],
    thumbnail: info.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
    isbn_13: isbn13?.identifier || null,
    isbn_10: isbn10?.identifier || null,
    language: info.language || '',
  }
}
