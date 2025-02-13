import React, { useState } from "react";
import axios from "axios"; // Import axios
import "./form.css";

const UserForm = () => {
  const [formData, setFormData] = useState({
    hobbies: "",
    gender: "",
    education: "",
    pets: "",
    workout: "",
    drinking: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://soul-megal.onrender.com/form-data", formData);
      console.log("Form Data Submitted:", response.data);
      alert("Data successfully saved!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error saving data. Please try again.");
    }
  };

  return (
    <div className="home_container">
      <div className="stars"></div>
      <div className="floating-orbs"></div>

      <div className="form-container">
        <h2>Tell About Yourself</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <label htmlFor="hobbies" className="full-width">Describe your Hobbies?</label>
          <input type="text" id="hobbies" name="hobbies" value={formData.hobbies} onChange={handleChange} placeholder="Describe your hobbies here." className="full-width" />

          <label htmlFor="gender">What is your gender?</label>
          <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>

          <label htmlFor="education">Your Education?</label>
          <input type="text" id="education" name="education" value={formData.education} onChange={handleChange} placeholder="e.g. Bachelor's" />

          <label htmlFor="pets">Do you have pets?</label>
          <select id="pets" name="pets" value={formData.pets} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>

          <label htmlFor="workout">Do you Workout?</label>
          <select id="workout" name="workout" value={formData.workout} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>

          <label htmlFor="drinking">Do you drink or smoke?</label>
          <select id="drinking" name="drinking" value={formData.drinking} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>

          <button type="submit" className="full-width">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
