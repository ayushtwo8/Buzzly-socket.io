import { useEffect, useState } from "react"
import axios from "axios";

export const useAuth = () => {
    const [authState, setAuthState] = useState({
        user: null,
        token: null,
        loading: true
    });

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect( () => {
        // check for stored token
        const storedToken = localStorage.getItem('buzzly_token');
        const storedUser = localStorage.getItem('buzzly_user');

        if(storedToken && storedUser){
            try{
                const user = JSON.parse(storedUser);
                setAuthState({
                    user,
                    token: storedToken,
                    loading: false
                });
            } catch(error){
                localStorage.removeItem('buzzly_token');
                localStorage.removeItem('buzzly_user');

                setAuthState({
                    user: null,
                    token: null,
                    loading: false
                });
            }
        } else {
            setAuthState(prev => ({ ...prev, loading: false}));
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${backendUrl}/api/v1/auth/login`, {email, password}, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = response.data;

            localStorage.setItem('buzzly_token', data.token);
            localStorage.setItem('buzzly_user', JSON.stringify(data.user))

            setAuthState({
                user: data.user,
                token: data.token,
                loading: false
            })

            return {
                success: true
            }
        } catch(error){
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Login failed'
            }
        }
    };

    const register = async (email, password, username) => {
        try{
            const response = await axios.post(`${backendUrl}/api/v1/auth/register`,{username, email, password} ,{
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const data = response.data;

            localStorage.setItem('buzzly_token', data.token)
            localStorage.setItem('buzzly_user', JSON.stringify(data.user));

            setAuthState({
                user: data.user,
                token: data.token,
                loading: false
            })

            return {
                success: true
            }
        } catch(error){
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Registration failed'
            };
        }
    }

    const logout = () => {
        localStorage.removeItem('buzzly_token');
        localStorage.removeItem('buzzly_user');
        setAuthState({
            user: null,
            token: null,
            loading: null
        })
    }

    return {
        user: authState.user,
        token: authState.token,
        loading: authState.loading,
        login,
        register,
        logout
    }
}