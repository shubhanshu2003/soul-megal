// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router";
// import Navbar from "./component/Navbar/Navbar";
// import Home from "./component/Home/Home";
// import Video from "./component/video/Video";
// import Login from "./component/logIn/Login";
// import Signup from "./component/SignUp/SignUp";
// import About from "./component/About/About";
// import UserForm from "./component/Form/Form";



// function App() {
//   return (
//     <Router>
//       <Navbar/>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/video" element={<Video />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/about" element={<About/>}/>
//         <Route path="/form" element={<UserForm/>}/>
//       </Routes>
//     </Router>
//   );
// }

// export default App;


import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./component/Navbar/Navbar";
import Home from "./component/Home/Home";
import Video from "./component/video/Video";
import Login from "./component/logIn/Login";
import Signup from "./component/SignUp/SignUp";
import About from "./component/About/About";
import UserForm from "./component/Form/Form";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video" element={<Video />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/form" element={<UserForm />} />
      </Routes>
    </Router>
  );
}

export default App;
