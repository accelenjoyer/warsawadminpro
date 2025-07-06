"use client"
import React, {useState} from 'react';
import "./LoginForm.scss"
import {useRouter} from "next/navigation";
const LoginForm = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [name,setName] = useState("")
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!login || !password) {
            setError('Пожалуйста, заполните все поля.');
            return;
        }



        setError('');
        setLoading(true);


        try {
            const response = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: login, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при входе.');
            }

            const data = await response.json();
            console.log('Успешный логин:', data);


            localStorage.setItem("admindata", JSON.stringify(data));

            router.push("/adminmenu");

        } catch (err) {
            setError(err.message || 'Ошибка при входе.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Вход</h2>
                <div>
                    <label htmlFor="login">Логин:</label>
                    <input
                        type="text"
                        id="login"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <div>
                    <label htmlFor="password">Пароль:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Вход...' : 'Войти'}
                </button>
            </form>
        </div>
    );
};

export default LoginForm;