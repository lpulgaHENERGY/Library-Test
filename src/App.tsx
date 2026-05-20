import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Account from './pages/Account'
import About from './pages/About'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/account" element={<Account />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Layout>
  )
}
