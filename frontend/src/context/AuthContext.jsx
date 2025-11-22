// src/context/AuthContext.jsx
import { createContext, useReducer, useEffect } from "react";

export const AuthContext = createContext();

export const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_PRODUCTS":
      return { products: action.payload };
    case "LOGIN":
      return { user: action.payload };
    case "LOGOUT":
      return { user: null };
    case "UPDATED_USER":
      return {
        ...state,
        user: { 
          ...state.user, 
          ...action.payload,
          // Preserve isVerified if not provided in payload
          isVerified: action.payload.isVerified !== undefined ? action.payload.isVerified : state.user?.isVerified
        },
      };
    case "DELETE_ACCOUNT":
      return { user: null }; // remove user from state
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: JSON.parse(localStorage.getItem("user")),
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      dispatch({ type: "LOGIN", payload: user });
    }
  }, []);

  const deleteAccount = () => {
    localStorage.removeItem("user");
    dispatch({ type: "DELETE_ACCOUNT" });
  };

  return (
    <AuthContext.Provider value={{ ...state, dispatch, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};
