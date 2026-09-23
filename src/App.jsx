import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MobileActionBar from './components/MobileActionBar'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Book from './pages/Book'
import Checkout from './pages/Checkout'
import Confirmation from './pages/Confirmation'
import NotFound from './pages/NotFound'

const HIDE_CHROME_ON = ['/book', '/checkout', '/confirmation']

export default function App() {
  const { pathname } = useLocation()
  const hideChrome = HIDE_CHROME_ON.some((p) => pathname.startsWith(p))

  return (
    <>
      <ScrollToTop />
      <Toaster
        position="top-center"
        toastOptions={{ className: 'toast-custom', duration: 3500 }}
      />

      {!hideChrome && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!hideChrome && <Footer />}
      {!hideChrome && <MobileActionBar />}
    </>
  )
}
