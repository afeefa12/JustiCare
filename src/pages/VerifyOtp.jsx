import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function VerifyOtp() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/Auth/verify-otp", { email, otp });
      if (res.data.success) {
        alert("OTP verified! You can now log in.");
        navigate("/login");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert("Invalid or expired OTP.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Verify OTP</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="border p-2 w-full mb-2"/>
        <input type="text" value={otp} onChange={(e)=>setOtp(e.target.value)} placeholder="OTP" className="border p-2 w-full mb-2"/>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Verify</button>
      </form>
    </div>
  );
}
