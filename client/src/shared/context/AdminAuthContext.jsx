import { createContext, useContext, useEffect, useState } from "react";
import { adminAPI } from "../../services/api";

const AdminAuthContext = createContext(null);

const ADMIN_TOKEN_KEY = "shoplocal_admin_token";

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(() =>
    localStorage.getItem(ADMIN_TOKEN_KEY),
  );
  const [loading, setLoading] = useState(true);

  // Restore Admin Session on Mount
  useEffect(() => {
    const restoreAdmin = async () => {
      const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await adminAPI.me();
        const currentAdmin = response.data?.admin || response.data;

        if (currentAdmin && currentAdmin.email === "admin@gmail.com") {
          setAdmin(currentAdmin);
          setAdminToken(storedToken);
        } else {
          throw new Error("Unauthorized admin account.");
        }
      } catch (error) {
        console.error("Failed to restore Super Admin session:", error);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setAdmin(null);
        setAdminToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreAdmin();
  }, []);

  const loginAdmin = async ({ email, password }) => {
    try {
      const response = await adminAPI.login({ email, password });
      const receivedToken = response.data?.token;
      const loggedInAdmin = response.data?.admin;

      if (!receivedToken) {
        throw new Error("Super Admin authentication token was not received.");
      }

      if (loggedInAdmin?.email !== "admin@gmail.com") {
        throw new Error("Access denied. Only the authorized Super Admin can access this portal.");
      }

      localStorage.setItem(ADMIN_TOKEN_KEY, receivedToken);
      setAdminToken(receivedToken);
      setAdmin(loggedInAdmin);

      return {
        success: true,
        admin: loggedInAdmin,
        token: receivedToken,
        message: response.data?.message,
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Super Admin login failed.";
      throw new Error(message);
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdmin(null);
    setAdminToken(null);
  };

  const isAdminAuthenticated = Boolean(admin && adminToken && admin.email === "admin@gmail.com");

  const value = {
    admin,
    adminToken,
    isAdminAuthenticated,
    loading,
    loginAdmin,
    logoutAdmin,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used inside an AdminAuthProvider.");
  }
  return context;
}

export default AdminAuthContext;
