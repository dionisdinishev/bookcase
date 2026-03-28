import { useState, useEffect } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { smartSearch } from '../lib/books'
import { addBook } from '../lib/shelf'
import { useToast } from '../components/Toast'
import BookCard from '../components/BookCard'
import AddBookActions from '../components/AddBookActions'
import ChipSearch from '../components/ChipSearch'
import { buildQuery, chipsToParams, paramsToChips } from '../lib/queryBuilder'

export default function Search() {
  const { user } = useAuth()
  const toast = useToast()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [currentQuery, setCurrentQuery] = useState('')
  const [hasMore, setHasMore] = useState(false)

  // Restore chips from: 1) Home navigation state, 2) URL params, 3) empty
  const getInitialChips = () => {
    if (location.state?.chips) return location.state.chips
    const fromUrl = paramsToChips(searchParams)
    if (fromUrl.length) return fromUrl
    return []
  }

  const [initialChips] = useState(getInitialChips)

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
      setHasMore(data.items.length === 20)
    } catch {
      toast.error('Search failed — try again')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const chips = getInitialChips()
    if (chips.length) {
      const q = buildQuery(chips)
      setCurrentQuery(q)
      doSearch(q)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = async (query, chips) => {
    setPage(0)
    setResults([])
    setCurrentQuery(query)
    setSearchParams(chipsToParams(chips))
    doSearch(query)
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    doSearch(currentQuery, nextPage * 20)
  }

  return (
    <div className="search-page">
      <h1>Search Books</h1>

      <ChipSearch onSearch={handleSearch} loading={loading} initialChips={initialChips} />

      {results.length > 0 && (
        <p className="results-count">{results.length} results{hasMore ? '+' : ''}</p>
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

        {hasMore && (
          <button onClick={loadMore} className="btn-load-more" disabled={loading}>
            {loading ? 'Loading...' : 'Load more results'}
          </button>
        )}

        {!loading && results.length === 0 && currentQuery && (
          <p className="no-results">No books found. Try a different search.</p>
        )}
      </div>
    </div>
  )
}
