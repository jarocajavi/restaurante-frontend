function Footer() {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-800 px-6 py-3 flex items-center justify-center gap-4"
      style={{ background: '#1c0e04' }}
    >
      <span className="text-stone-500 text-sm">Javier Rodríguez Castillo</span>
      <span className="text-stone-700">·</span>
      
        <a href="mailto:jarocajavi@gmail.com"
        className="text-amber-600 hover:text-amber-400 text-sm transition-colors"
      >
        jarocajavi@gmail.com
      </a>
    </footer>
  )
}

export default Footer