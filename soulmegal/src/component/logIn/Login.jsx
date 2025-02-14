// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios"; // Import Axios
// import "./login.css"; // Include the CSS for styling

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await axios.post("https://soul-megal.onrender.com/login", {
//         email,
//         password,
//       });

//       if (response.data.success) {
//         // Store JWT token in local storage
//         localStorage.setItem("token", response.data.token);
//         localStorage.setItem("user", JSON.stringify(response.data.user));

//         console.log("Login successful:", response.data);
        
//         // Redirect to home page
//         navigate("/video");
//       } else {
//         alert("Invalid credentials");
//       }
//     } catch (error) {
//       console.error("Login failed:", error.response?.data || error.message);
//       alert("Login failed. Please check your credentials and try again.");
//     }
//   };

//   return (
//     <div className="auth-wrapper">
//       <div className="auth-form">
//         <h2>Login</h2>
//         <form onSubmit={handleLogin}>
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           <button type="submit">Login</button>
//         </form>
//         <p>
//           Don't have an account? <span onClick={() => navigate("/signup")}>Sign Up</span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;



import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:10000/user/login", { email, password });
      
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        navigate("/video");
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      alert("Login failed. Please check your credentials and try again.");
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-form">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account? <span onClick={() => navigate("/signup")}>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
