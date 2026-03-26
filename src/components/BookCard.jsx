export default function BookCard({ book, actions }) {
  // Support both flat (search results) and nested (shelf/db) data
  const isNested = !!book.book
  const bookData = isNested ? book.book : book
  const title = bookData.title
  const thumbnail = bookData.thumbnail
  const pageCount = bookData.page_count
  const isbn = bookData.isbn_13 || bookData.isbn_10 || bookData.isbn

  // Authors: nested from DB or flat array from search
  const authors = isNested
    ? (bookData.book_authors || []).map(ba => ba.author?.name).filter(Boolean)
    : (Array.isArray(bookData.authors) ? bookData.authors : [])

  // Categories: nested from DB or flat array from search
  const categories = isNested
    ? (bookData.book_categories || []).map(bc => bc.category?.name).filter(Boolean)
    : (Array.isArray(bookData.categories) ? bookData.categories : [])

  return (
    <div className="book-card">
      <div className="book-cover">
        {thumbnail ? (
          <img src={thumbnail} alt={title} />
        ) : (
          <div className="book-cover-placeholder">
            <span>{title?.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="book-info">
        <h3 className="book-title">{title}</h3>
        <p className="book-authors">{authors.join(', ') || 'Unknown Author'}</p>
        {pageCount > 0 && (
          <p className="book-pages">{pageCount} pages</p>
        )}
        {isbn && <p className="book-isbn">ISBN: {isbn}</p>}
        {categories.length > 0 && (
          <div className="book-categories">
            {categories.map(cat => (
              <span key={cat} className="category-tag">{cat}</span>
            ))}
          </div>
        )}
        {actions && <div className="book-actions">{actions}</div>}
      </div>
    </div>
  )
}
