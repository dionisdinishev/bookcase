import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { smartSearch } from '../lib/books'
import { addBook } from '../lib/shelf'
import { useToast } from '../components/Toast'
import BookCard from '../components/BookCard'
import AddBookActions from '../components/AddBookActions'
import ChipSearch from '../components/ChipSearch'
import QuickStats from '../components/QuickStats'

const PREVIEW_LIMIT = 5

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [lastQuery, setLastQuery] = useState('')
  const [lastChips, setLastChips] = useState([])
  const [results, setResults] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (query, chips) => {
    setLoading(true)
    setSearched(true)
    setLastQuery(query)
    setLastChips(chips)
    try {
      const data = await smartSearch(query)
      setResults(data.items)
      setTotalResults(data.totalItems)
    } catch (err) {
      toast.error('Search failed — try again')
    } finally {
      setLoading(false)
    }
  }

  const goToFullSearch = () => {
    navigate(`/search?q=${encodeURIComponent(lastQuery)}`, { state: { chips: lastChips } })
  }

  const preview = results.slice(0, PREVIEW_LIMIT)
  const hasMore = results.length > PREVIEW_LIMIT

  return (
    <div className="home-layout">
      <div className="home-main">
        <h1>Find your next book</h1>

        <ChipSearch onSearch={handleSearch} loading={loading} />

        <div className="search-results">
          {preview.map(book => (
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
            <button onClick={goToFullSearch} className="btn-see-all">
              See all {totalResults.toLocaleString()} results →
            </button>
          )}

          {!loading && searched && results.length === 0 && (
            <p className="no-results">No books found. Try a different search.</p>
          )}
        </div>
      </div>

      <QuickStats />
    </div>
  )
}
