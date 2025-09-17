import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import SearchPage from "./components/SearchPage";
import HomePage from "./components/CVUploader.jsx";

function App() {
 

  return (
    <>
     <h1 className='text-2xl lg:text-3xl text-center p-6 font-bold text-slate-500'>Upload Your CV and Let AI Do the Rest </h1>
 


   <Router>
      <nav className="p-4 bg-gray-100 flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </Router>

    </>
  )
}

export default App
