import "./App.css";
import {SignUpPage} from "./pages/SignUpPage.jsx";
import {LoginPage} from "./pages/LoginPage.jsx";
import {BrowserRouter, Routes, Route} from "react-router-dom";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignUpPage/>}/>
        <Route path="/signup" element={<SignUpPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
      </Routes>  
    </BrowserRouter>
  )
}

export default App