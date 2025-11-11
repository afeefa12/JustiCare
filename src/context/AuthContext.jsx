// import React, { createContext, useContext, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api/axios";

// const AuthContext = createContext();


// export const AuthProvider = ({ children }) => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true); 


//   useEffect(() => {
//     const storedUser = JSON.parse(localStorage.getItem("user"));
//     if (storedUser) setUser(storedUser);
//     setLoading(false); 
//   }, []);

//   // LOGIN
//   const login = async (email, password) => {
//     try {
//       const res = await api.post("/api/Auth/login", { email, password });

//       if (res.data.success) {
//         const loggedInUser = res.data.data; 
//         setUser(loggedInUser);
//         localStorage.setItem("user", JSON.stringify(loggedInUser));


//         if (loggedInUser.role === "Investor") navigate("/investor");
//         else if (loggedInUser.role === "Admin") navigate("/admin");
//       } else {
//         alert(res.data.message || "Login failed");
//       }
//     } catch (error) {
//       console.error(error);
//       alert("Login error");
//     }
//   };

//   // REGISTER
//   const register = async ({username, email, password, role}) => {
//     try {
//       console.log("from authcontext"+role);

//       const res = await api.post("/api/Auth/register", { username, email, password, role });

//       if (res.data.success) {
//         alert("Registration successful! Please login.");
//         navigate("/login");
//       } else {
//         alert(res.data.message || "Registration failed");
//       }
//     } catch (error) {
//       console.error(error);
//       alert("Registration error");
//     }
//   };

//   // LOGOUT
//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, register, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


// export const useAuth = () => useContext(AuthContext);




import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // LOGIN
  const login = async (email, password) => {
    try {
      const res = await api.post("/api/Auth/login", { email, password });

      // Backend returns: ApiResponse<UserResponseDto> with StatusCode, Message, Data
      if (res.data.statusCode === "200" && res.data.data) {
        const loggedInUser = res.data.data;
        setUser(loggedInUser);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        localStorage.setItem("token", loggedInUser.token);

        // return user for navigation usage
        return loggedInUser;
      } else {
        throw new Error(res.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Login failed. Please try again.";
      throw new Error(errorMessage);
    }
  };

  // REGISTER - User (Client)
  const register = async ({ username, email, password, role, ...lawyerFields }) => {
    try {
      let res;
      
      if (role === "Lawyer") {
        // Lawyer registration requires additional fields
        res = await api.post("/api/Auth/lawyer/register", {
          username,
          email,
          password,
          phoneNumber: lawyerFields.phoneNumber || "",
          address: lawyerFields.address || "",
          barRegistrationNumber: lawyerFields.barRegistrationNumber || "",
        });
      } else {
        // User (Client) registration
        res = await api.post("/api/Auth/register", {
          username,
          email,
          password,
        });
      }

      // Backend returns: ApiResponse<RegisterResponse> with StatusCode, Message, Data
      if (res.data.statusCode === "200") {
        // Return email for OTP verification
        return {
          email: res.data.data?.email || email,
          message: res.data.message,
        };
      } else {
        throw new Error(res.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Registration failed. Please try again.";
      throw new Error(errorMessage);
    }
  };

  // VERIFY OTP
  const verifyOtp = async (email, otp) => {
    try {
      const res = await api.post("/api/Auth/verify-otp", { email, otp });
      
      if (res.data.statusCode === "200") {
        return true;
      } else {
        throw new Error(res.data.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Invalid or expired OTP.";
      throw new Error(errorMessage);
    }
  };

  // RESEND OTP
  const resendOtp = async (email) => {
    try {
      // Note: Backend currently has [FromBody] string email which doesn't work well with JSON
      // Frontend sends as object - backend should be updated to use OtpRequestDto
      // See BACKEND_SUGGESTIONS.md for details
      const res = await api.post("/api/Auth/send-otp", { email: email });
      
      if (res.data.statusCode === "200") {
        return true;
      } else {
        throw new Error(res.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to resend OTP.";
      throw new Error(errorMessage);
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      verifyOtp, 
      resendOtp, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
