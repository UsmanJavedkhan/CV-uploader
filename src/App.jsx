import { useState } from 'react'
import CVUploader from './components/CVUploader.jsx'

function App() {
 

  return (
    <>
     <h1 className='text-2xl lg:text-3xl text-center p-6 font-bold text-slate-500'>Upload Your CV and Let AI Do the Rest </h1>
 
<CVUploader />



    </>
  )
}

export default App
