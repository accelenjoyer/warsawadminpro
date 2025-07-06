
"use client";
import React, {use, useState} from 'react';
import { useRouter } from 'next/navigation';
import "./RegisterForm.scss"
import LoginForm from "@/components/LoginForm/LoginForm";
const RegisterForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [Login,goLogin] = useState(false)
    const router = useRouter();

    const GoToLogin = () => {
        goLogin(true)
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({});
        console.log(formData)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const validationErrors = {};
        if (!formData.email) {
            validationErrors.email = 'Пожалуйста, введите email.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            validationErrors.email = 'Неверный формат email.';
        }
        if (!formData.password) {
            validationErrors.password = 'Пожалуйста, введите пароль.';
        }
        if (formData.password !== formData.confirmPassword) {
            validationErrors.confirmPassword = 'Пароли не совпадают.';
        }
        if (!formData.name) {
            validationErrors.name = 'Укажите Ваше имя';
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Регистрация успешна:', data);
                localStorage.setItem("admindata", JSON.stringify(formData));
                router.push('/adminmenu');
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            setErrors({ general: 'Ошибка при отправке запроса. Пожалуйста, попробуйте позже.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {Login ? <LoginForm /> :
        <form className="register-form" onSubmit={handleSubmit}>
            <h2>Регистрация</h2>
            {errors.general && <p className="error-message">{errors.general}</p>}
            <div>
                <label htmlFor="name">Имя:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                />
                {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                {errors.email && <p className="error-message">{errors.email}</p>}
            </div>
            <div>
                <label htmlFor="password">Пароль:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                {errors.password && <p className="error-message">{errors.password}</p>}
            </div>

            <div>
                <label htmlFor="confirmPassword">Подтвердите пароль:</label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
            <button type="button" disabled={isLoading} onClick={GoToLogin}>
                Войти
            </button>
        </form>}
        </div>
    );
};

export default RegisterForm;

