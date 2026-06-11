import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SearchProvider } from './contexto/SearchContext'
import { AdminViewProvider } from './contexto/AdminViewContext'
import { ToastProvider } from './contexto/ToastContext'
import Principal from './Pages/Principal/Principal'
import DetalleProductoPage from './Pages/DetalleProducto/DetalleProductoPage'
import Login from './Pages/Login/Login'
import Admin from './Pages/Admin/Admin'
import NotFound from './Pages/NotFound/NotFound'
import Header from './componentes/Header/Header'
import Footer from './componentes/Footer/Footer'
import Toast from './componentes/Toast/Toast'
import ScrollToTop from './componentes/ScrollToTop/ScrollToTop'
import ProtectedRoute from './componentes/ProtectedRoute/ProtectedRoute'

function App() {
  return (
    <Router>
      <SearchProvider>
        <ToastProvider>
          <AdminViewProvider>
            <ScrollToTop />
            <Toast />
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Principal />} />
                  <Route path="/login" element={<Login />} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute>
                        <Admin />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/:id" element={<DetalleProductoPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </AdminViewProvider>
        </ToastProvider>
      </SearchProvider>
    </Router>
  )
}

export default App