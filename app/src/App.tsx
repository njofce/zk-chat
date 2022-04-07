import "./App.scss"
import { BrowserRouter } from "react-router-dom"
import AppWrapper from "./components/AppWrapper"

function App() {
  return (
    <BrowserRouter>
      <div className="App ">
        <div className="w-100 vh-100 container-fluid">
          <AppWrapper />
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
