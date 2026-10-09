import { createContext, useContext, useEffect, useState } from "react";

import {
  loginUser,
  signupUser,
  getCurrentUser,
  logoutUser,
  loginSeller,
  signupSeller,
  getCurrentSeller,
  logoutSeller,
} from "../../services/authService";

const AuthContext = createContext(null);

const USER_TOKEN_KEY = "shoplocal_token";
const SELLER_TOKEN_KEY = "shoplocal_seller_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [seller, setSeller] = useState(null);

  const [token, setToken] = useState(() =>
    localStorage.getItem(USER_TOKEN_KEY),
  );

  const [sellerToken, setSellerToken] = useState(() =>
    localStorage.getItem(SELLER_TOKEN_KEY),
  );

  const [loading, setLoading] = useState(true);

  /*
   RESTORE AUTHENTICATION
  */

  useEffect(() => {
    const restoreAuthentication = async () => {
      const storedUserToken = localStorage.getItem(USER_TOKEN_KEY);
      const storedSellerToken = localStorage.getItem(SELLER_TOKEN_KEY);

      try {
        /* RESTORE CUSTOMER */

        if (storedUserToken) {
          try {
            const response = await getCurrentUser();

            const currentUser =
              response?.user ||
              response?.data?.user ||
              response?.data ||
              response;

            setUser(currentUser);
            setToken(storedUserToken);
          } catch (error) {
            console.error("Failed to restore customer authentication:", error);

            localStorage.removeItem(USER_TOKEN_KEY);

            setUser(null);
            setToken(null);
          }
        }

        /*
         RESTORE SELLER
        */

        if (storedSellerToken) {
          try {
            const response = await getCurrentSeller();

            const currentSeller =
              response?.seller ||
              response?.data?.seller ||
              response?.data ||
              response;

            setSeller(currentSeller);
            setSellerToken(storedSellerToken);
          } catch (error) {
            console.error("Failed to restore seller authentication:", error);

            localStorage.removeItem(SELLER_TOKEN_KEY);

            setSeller(null);
            setSellerToken(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    restoreAuthentication();
  }, []);

  /*
   CUSTOMER LOGIN
  */

  const login = async ({ email, password }) => {
    try {
      const response = await loginUser({
        email,
        password,
      });

      const receivedToken = response?.token;

      const loggedInUser =
        response?.user || response?.data?.user || response?.data;

      if (!receivedToken) {
        throw new Error("Authentication token was not received.");
      }

      localStorage.setItem(USER_TOKEN_KEY, receivedToken);

      setToken(receivedToken);
      setUser(loggedInUser || null);

      return {
        success: true,
        user: loggedInUser || null,
        token: receivedToken,
        message: response?.message,
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Login failed. Please try again.";

      throw new Error(message);
    }
  };

  /*
  CUSTOMER SIGNUP
  */

  const signup = async (userData) => {
    try {
      const response = await signupUser(userData);

      const receivedToken = response?.token;

      const registeredUser =
        response?.user || response?.data?.user || response?.data;

      if (receivedToken) {
        localStorage.setItem(USER_TOKEN_KEY, receivedToken);

        setToken(receivedToken);
        setUser(registeredUser || null);
      }

      return {
        success: true,
        user: registeredUser || null,
        token: receivedToken || null,
        message: response?.message,
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Registration failed. Please try again.";

      throw new Error(message);
    }
  };

  /*
  CUSTOMER LOGOUT
  */

  const logout = async () => {
    try {
      if (localStorage.getItem(USER_TOKEN_KEY)) {
        await logoutUser();
      }
    } catch (error) {
      console.error("Customer logout request failed:", error);
    } finally {
      localStorage.removeItem(USER_TOKEN_KEY);

      setUser(null);
      setToken(null);
    }
  };

  /*
  SELLER LOGIN
  */

  const loginSellerAccount = async ({ email, password }) => {
    try {
      const response = await loginSeller({
        email,
        password,
      });

      const receivedToken = response?.token;

      const loggedInSeller =
        response?.seller || response?.data?.seller || response?.data;

      if (!receivedToken) {
        throw new Error("Seller authentication token was not received.");
      }

      localStorage.setItem(SELLER_TOKEN_KEY, receivedToken);

      setSellerToken(receivedToken);
      setSeller(loggedInSeller || null);

      return {
        success: true,
        seller: loggedInSeller || null,
        token: receivedToken,
        message: response?.message,
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Seller login failed. Please try again.";

      throw new Error(message);
    }
  };

  /*
   SELLER SIGNUP
  */

  const signupSellerAccount = async (sellerData) => {
    try {
      const response = await signupSeller(sellerData);

      const receivedToken = response?.token;

      const registeredSeller =
        response?.seller || response?.data?.seller || response?.data;

      if (receivedToken) {
        localStorage.setItem(SELLER_TOKEN_KEY, receivedToken);

        setSellerToken(receivedToken);
        setSeller(registeredSeller || null);
      }

      return {
        success: true,
        seller: registeredSeller || null,
        token: receivedToken || null,
        message: response?.message,
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Seller registration failed. Please try again.";

      throw new Error(message);
    }
  };

  /*
   SELLER LOGOUT
  */

  const logoutSellerAccount = async () => {
    try {
      if (localStorage.getItem(SELLER_TOKEN_KEY)) {
        await logoutSeller();
      }
    } catch (error) {
      console.error("Seller logout request failed:", error);
    } finally {
      localStorage.removeItem(SELLER_TOKEN_KEY);

      setSeller(null);
      setSellerToken(null);
    }
  };

  /*
   AUTH STATE
  */

  const isAuthenticated = Boolean(user && token);

  const isSellerAuthenticated = Boolean(seller && sellerToken);

  /*
   ROLE HELPERS
  */

  const isCustomer = user?.role === "customer";

  const isSeller = seller?.type === "seller";

  /*
   CONTEXT VALUE
  */

  const value = {
    /*
     * Customer
     */
    user,
    token,

    isAuthenticated,
    isCustomer,

    login,
    signup,
    logout,

    /*
     * Seller
     */
    seller,
    sellerToken,

    isSellerAuthenticated,
    isSeller,

    loginSeller: loginSellerAccount,
    signupSeller: signupSellerAccount,
    logoutSeller: logoutSellerAccount,

    /*
     * General
     */
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/*
 useAuth
*/

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}

export default AuthContext;
