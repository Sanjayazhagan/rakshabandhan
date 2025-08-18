import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Inputbar from './components/Inputbar.jsx'

createRoot(document.getElementById('root')).render(
    <Inputbar/>,
)
