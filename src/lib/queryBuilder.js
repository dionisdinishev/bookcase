export const FILTERS = [
  { key: 'title', label: 'Title', queryKey: 'intitle', color: 'chip-title' },
  { key: 'author', label: 'Author', queryKey: 'inauthor', color: 'chip-author' },
  { key: 'genre', label: 'Genre', queryKey: 'subject', color: 'chip-genre' },
  { key: 'isbn', label: 'ISBN', queryKey: 'isbn', color: 'chip-isbn' },
]

// Encode chips into URL search params: ?title=dune&author=herbert&q=general
export function chipsToParams(chips) {
  const params = new URLSearchParams()
  chips.forEach(chip => {
    const filter = FILTERS.find(f => f.queryKey === chip.queryKey)
    if (filter) {
      params.append(filter.key, chip.value)
    } else {
      params.append('q', chip.value)
    }
  })
  return params
}

// Decode URL search params back into chips
export function paramsToChips(searchParams) {
  const chips = []
  for (const filter of FILTERS) {
    const values = searchParams.getAll(filter.key)
    values.forEach(v => {
      if (v) chips.push({ label: filter.label, value: v, queryKey: filter.queryKey, color: filter.color })
    })
  }
  const general = searchParams.getAll('q')
  general.forEach(v => {
    if (v) chips.push({ label: 'Search', value: v, queryKey: '', color: 'chip-search' })
  })
  return chips
}

export function buildQuery(chips) {
  return chips.map(chip => {
    if (chip.queryKey) {
      // Short values don't work well with Google Books strict filters
      // Fall back to general search for values under 4 chars
      if (chip.value.length < 4 && chip.queryKey !== 'isbn') {
        return chip.value
      }
      return `${chip.queryKey}:${chip.value}`
    }
    const digits = chip.value.replace(/[-\s]/g, '')
    if (/^\d{10}(\d{3})?$/.test(digits)) return `isbn:${digits}`
    return chip.value
  }).join(' ')
}
