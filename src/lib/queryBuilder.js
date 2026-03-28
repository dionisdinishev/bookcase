export const FILTERS = [
  { key: 'title', label: 'Title', queryKey: 'intitle', color: 'chip-title' },
  { key: 'author', label: 'Author', queryKey: 'inauthor', color: 'chip-author' },
  { key: 'genre', label: 'Genre', queryKey: 'subject', color: 'chip-genre' },
  { key: 'isbn', label: 'ISBN', queryKey: 'isbn', color: 'chip-isbn' },
]

export function buildQuery(chips) {
  return chips.map(chip => {
    if (chip.queryKey) return `${chip.queryKey}:${chip.value}`
    const digits = chip.value.replace(/[-\s]/g, '')
    if (/^\d{10}(\d{3})?$/.test(digits)) return `isbn:${digits}`
    return chip.value
  }).join('+')
}
