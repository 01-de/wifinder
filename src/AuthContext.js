import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
            console.log("Token state updated:", token);
            fetchUser();  // ✅ Fetch user when token is updated
        } else {
            localStorage.removeItem("token");
            setUser(null);
        }
    }, [token]);

    // ✅ Function to fetch user info
    const fetchUser = async () => {
        if (!token) return;
        try {
            const response = await fetch("http://localhost:8080/api/auth/userinfo", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                console.log("User data:", userData);
            } else {
                console.error("Failed to fetch user data");
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ token, setToken, user, setUser, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};
