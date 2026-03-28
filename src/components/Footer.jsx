import { BookOpenIcon } from './Icons'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <span className="footer-brand"><BookOpenIcon width={14} height={14} /> Bookcase</span>
        <span className="footer-sep">·</span>
        <a href="https://crowdshipped.dev" className="footer-link" target="_blank" rel="noopener noreferrer">crowdshipped.dev</a>
        <span className="footer-sep">·</span>
        <a href="/privacy.html" className="footer-link">Privacy</a>
      </div>
    </footer>
  )
}
