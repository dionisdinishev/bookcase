import { useState, useRef, useEffect } from 'react'
import { FILTERS, buildQuery } from '../lib/queryBuilder'

export default function ChipSearch({ onSearch, loading, initialChips }) {
  const [chips, setChips] = useState(initialChips || [])
  const [activeFilter, setActiveFilter] = useState(null)
  const [input, setInput] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef(null)
  const editRef = useRef(null)

  useEffect(() => {
    if (editingIndex !== null) {
      editRef.current?.focus()
      editRef.current?.select()
    }
  }, [editingIndex])

  const selectFilter = (filter) => {
    if (activeFilter?.key === filter.key) {
      setActiveFilter(null)
    } else {
      setActiveFilter(filter)
    }
    setInput('')
    inputRef.current?.focus()
  }

  const makeChip = (value) => {
    if (!value.trim()) return null
    return activeFilter
      ? { label: activeFilter.label, value: value.trim(), queryKey: activeFilter.queryKey, color: activeFilter.color }
      : { label: 'Search', value: value.trim(), queryKey: '', color: 'chip-search' }
  }

  const addChipAndSearch = (value) => {
    const chip = makeChip(value)
    if (!chip) return
    const newChips = [...chips, chip]
    setChips(newChips)
    setInput('')
    setActiveFilter(null)
    inputRef.current?.focus()
    onSearch(buildQuery(newChips), newChips)
  }

  const removeChip = (index) => {
    setChips(prev => prev.filter((_, i) => i !== index))
    setEditingIndex(null)
    inputRef.current?.focus()
  }

  const startEdit = (index) => {
    setEditingIndex(index)
    setEditValue(chips[index].value)
  }

  const finishEdit = () => {
    if (editingIndex === null) return
    if (editValue.trim()) {
      const updated = chips.map((chip, i) =>
        i === editingIndex ? { ...chip, value: editValue.trim() } : chip
      )
      setChips(updated)
      if (updated.length > 0) onSearch(buildQuery(updated), updated)
    } else {
      removeChip(editingIndex)
    }
    setEditingIndex(null)
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      finishEdit()
    } else if (e.key === 'Escape') {
      setEditingIndex(null)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (input.trim()) {
        addChipAndSearch(input)
      } else if (chips.length > 0) {
        onSearch(buildQuery(chips), chips)
      }
    } else if (e.key === 'Backspace' && !input) {
      if (activeFilter) {
        setActiveFilter(null)
      } else if (chips.length > 0) {
        removeChip(chips.length - 1)
      }
    } else if (e.key === 'Escape') {
      setActiveFilter(null)
    }
  }

  const handleSubmit = () => {
    if (input.trim()) {
      addChipAndSearch(input)
    } else if (chips.length > 0) {
      onSearch(buildQuery(chips), chips)
    }
  }

  const placeholder = activeFilter
    ? `Enter ${activeFilter.label.toLowerCase()}...`
    : chips.length > 0
      ? 'Add more or hit Enter to search'
      : 'Search books...'

  return (
    <div className="chip-search-container">
      {/* Input row */}
      <div className="search-row">
        {activeFilter && (
          <span className={`chip-active-filter ${activeFilter.color}`}>
            {activeFilter.label}:
          </span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-main-input"
        />
        <button onClick={handleSubmit} className="btn-search" disabled={loading}>
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {/* Filter pills */}
      <div className="filter-buttons">
        <span className="filter-label">Filter:</span>
        {FILTERS.map(filter => (
          <button
            key={filter.key}
            className={`filter-btn ${filter.color} ${activeFilter?.key === filter.key ? 'active' : ''}`}
            onClick={() => selectFilter(filter)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Active chips */}
      {chips.length > 0 && (
        <div className="chips-row">
          {chips.map((chip, i) => (
            editingIndex === i ? (
              <span key={i} className={`chip ${chip.color} chip-editing`}>
                <span className="chip-label">{chip.label}</span>
                <input
                  ref={editRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onBlur={finishEdit}
                  className="chip-edit-input"
                />
              </span>
            ) : (
              <span
                key={i}
                className={`chip ${chip.color}`}
                onClick={() => startEdit(i)}
              >
                <span className="chip-label">{chip.label}</span>
                {chip.value}
                <button className="chip-remove" onClick={(e) => { e.stopPropagation(); removeChip(i) }}>×</button>
              </span>
            )
          ))}
          <button
            className="chips-clear"
            onClick={() => { setChips([]); inputRef.current?.focus() }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
