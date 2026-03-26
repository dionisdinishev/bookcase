import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { smartSearch } from '../lib/books'
import { addBook } from '../lib/shelf'
import { useToast } from '../components/Toast'
import BookCard from '../components/BookCard'
import AddBookActions from '../components/AddBookActions'

export default function Search() {
  const { user } = useAuth()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)

  const doSearch = async (q, startIndex = 0) => {
    if (!q.trim()) return

    setLoading(true)
    try {
      const data = await smartSearch(q, startIndex)

      if (startIndex === 0) {
        setResults(data.items)
      } else {
        setResults(prev => [...prev, ...data.items])
      }
      setTotalResults(data.totalItems)
    } catch (err) {
      toast.error('Search failed — try again')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      doSearch(q)
    }
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setPage(0)
    setResults([])
    setSearchParams({ q: query })
    doSearch(query)
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    doSearch(query, nextPage * 20)
  }

  return (
    <div className="search-page">
      <h1>Search Books</h1>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, ISBN, or genre..."
            className="search-input"
          />
          <button type="submit" className="btn-search" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {totalResults > 0 && (
        <p className="results-count">{totalResults.toLocaleString()} results found</p>
      )}

      <div className="search-results">
        {results.map(book => (
          <BookCard
            key={book.google_book_id}
            book={book}
            actions={
              <AddBookActions
                onAdd={(status) => addBook(user.id, book, status)}
              />
            }
          />
        ))}

        {results.length > 0 && results.length < totalResults && (
          <button onClick={loadMore} className="btn-load-more" disabled={loading}>
            {loading ? 'Loading...' : 'Load more results'}
          </button>
        )}

        {!loading && results.length === 0 && query && (
          <p className="no-results">No books found. Try a different search.</p>
        )}
      </div>
    </div>
  )
}
