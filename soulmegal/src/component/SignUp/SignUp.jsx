// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios"; // Import Axios
// import "./signUp.css"; // Include the CSS for styling


// const Signup = () => {
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const navigate = useNavigate();

//   const handleSignup = async (e) => {
//     e.preventDefault();
  
//     if (password !== confirmPassword) {
//       alert("Passwords do not match!");
//       return;
//     }
  
//     const formData = { name, phone, email, password };
  
//     try {
//       const response = await axios.post("https://localhost:10000/signup", formData);
//       console.log("Signup successful:", response.data);
  
//       alert(response.data.message); // Show success message
//       navigate("/form"); // Redirect to form page after successful signup
//     } catch (error) {
//       console.error("Signup failed:", error);
//     }
//   };
  
  

//   return (
//     <div className="auth-wrapper">
//       <div className="auth-form">
//         <h2>Sign Up</h2>
//         <form onSubmit={handleSignup}>
//           <input
//             type="text"
//             placeholder="Full Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//           />
//           <input
//             type="text"
//             placeholder="Phone Number"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//             required
//           />
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
//           <input
//             type="password"
//             placeholder="Confirm Password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             required
//           />
//           <button type="submit">Sign Up</button>
//         </form>
//         <p>
//           Already have an account? <span onClick={() => navigate("/form")}>Login</span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Signup;



import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./signUp.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
  
    // Password matching validation
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    const formData = { name, phone, email, password };
  
    try {
      // Send POST request to backend for signup
      const response = await axios.post("http://localhost:10000/user/signup", formData);
  
      // Log the response for success confirmation
      console.log("Signup successful:", response.data);

      // Redirect to the form page after successful signup
      navigate("/form");
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Signup failed. Please try again.");
    }
  };
  

  return (
    <div className="auth-wrapper">
      <div className="auth-form">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Sign Up</button>
        </form>
        <p>
          Already have an account? <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
