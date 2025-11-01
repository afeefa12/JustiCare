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
    if (storedUser) setUser(storedUser);
    setLoading(false);
  }, []);

  // LOGIN
  const login = async (email, password) => {
    try {
      const res = await api.post("/api/Auth/login", { email, password });

      if (res.data.success) {
        const loggedInUser = res.data.data;
        setUser(loggedInUser);
        localStorage.setItem("user", JSON.stringify(loggedInUser));

        // return user for navigation usage
        return loggedInUser;
      } else {
        alert(res.data.message || "Login failed");
        return null;
      }
    } catch (error) {
      console.error(error);
      alert("Login error");
      return null;
    }
  };

  // REGISTER
  const register = async ({ username, email, password, role }) => {




    try {

      if (role == "Lawyer") {
        let res = await api.post("/api/Auth/register", {
          username,
          email,
          password,
          
        });
        console.log("from register response" + res);
      }
      else if (role == "Client") {
        let res = await api.post("/api/Auth/register", {
          username,
          email,
          password,
          
        });
        console.log("from register response" + res);
      }
      console.log("from authcontext " + role);



      if (res.data.success) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        alert(res.data.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      alert("Registration error");
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
