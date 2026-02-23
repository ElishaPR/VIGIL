import "./App.css";
import {useEffect} from "react";
import {messaging} from "./firebase";
import {onMessage} from "firebase/messaging";
import {SignUpPage} from "./pages/SignUpPage.jsx";
import {LoginPage} from "./pages/LoginPage.jsx";
import {AddReminderPage} from "./pages/AddReminderPage.jsx";
import {BrowserRouter, Routes, Route} from "react-router-dom";

function App() {
  useEffect(() => {
    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignUpPage/>}/>
        <Route path="/signup" element={<SignUpPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/addreminder" element={<AddReminderPage/>}/>
      </Routes>  
    </BrowserRouter>
  )
}

export default App