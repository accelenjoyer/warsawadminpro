"use client"
import React, {useEffect, useState} from 'react';
import Sidebar from "@/components/Sidebar/Sidebar";
import "./adminmenu.scss"

import ArticlesList from "@/components/ArticlesList/ArticlesList";
import Header from "@/components/Header/Header";
import {useRouter} from "next/navigation";

const AdminMenu = () => {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isFormShown, setIsFormShown] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentArticle,setCurrentArticle] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [authError, setAuthError] = useState('');

    // Код доступа
    const ADMIN_ACCESS_CODE = "RoMan1337228";

    useEffect(() => {
        // Проверяем есть ли уже авторизация в localStorage
        const isAuthenticated = localStorage.getItem("adminAuthenticated");
        if (isAuthenticated === "true") {
            setIsAdmin(true);
            setIsLoggedIn(true);
        } else {
            // Если не авторизован, показываем модалку
            setShowAuthModal(true);
        }
    }, []);

    const handleAuthSubmit = (e) => {
        e.preventDefault();
        if (accessCode === "RoMan22813371") {
            setIsAdmin(true);
            setIsLoggedIn(true);
            setShowAuthModal(false);
            setAuthError('');
            // Сохраняем в localStorage чтобы не вводить код при перезагрузке
            localStorage.setItem("adminAuthenticated", "true");
        } else {
            setAuthError('Неверный код доступа!');
        }
    };

    const handleLogout = () => {
        setIsAdmin(false);
        setIsLoggedIn(false);
        setShowAuthModal(true);
        localStorage.removeItem("adminAuthenticated");
    };

    const ChangeForm = () => {
        if (!isAdmin) return;
        setIsFormShown(!isFormShown);
    };

    const ChangeCurrentArticle = (artcl) => {
        if (!isAdmin) return;
        setCurrentArticle(artcl);
        console.log(artcl);
    }

    const handleLoginSuccess = (userData) => {
        setIsLoggedIn(true);
    };

    useEffect(() => {
        if (!isAdmin) return;

        const fetchCategories = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/getcategories`);
                if (!response.ok) {
                    throw new Error('Ошибка при получении категорий');
                }
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Ошибка при получении категорий:', error);
            }
        };

        fetchCategories();
    }, [isAdmin]);

    useEffect(() => {
        if (!isAdmin) return;

        const fetchArticles = async () => {
            try {
                let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/adminmenu`;
                if (selectedCategory) {
                    url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/articles/category/${selectedCategory}`;
                }
                const response = await fetch(url);
                const data = await response.json();
                setArticles(data);
            } catch (error) {
                console.error('Ошибка при получении новостей:', error);
            }
        };

        fetchArticles();
    }, [selectedCategory, isAdmin]);

    const handleCategorySelect = (categorySlug) => {
        if (!isAdmin) return;
        setSelectedCategory(categorySlug);
    };

    // Если показываем модалку авторизации
    if (showAuthModal) {
        return (
            <div className="auth-modal-overlay">
                <div className="auth-modal">
                    <h2>Доступ к админ-панели</h2>
                    <p>Введите код доступа:</p>
                    <form onSubmit={handleAuthSubmit}>
                        <input
                            type="password"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            placeholder="Введите код доступа"
                            className="auth-input"
                        />
                        {authError && <p className="auth-error">{authError}</p>}
                        <button type="submit" className="auth-submit">
                            Войти
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Если не админ, но модалка не показана (защита на случай бага)
    if (!isAdmin) {
        return (
            <div className="auth-modal-overlay">
                <div className="auth-modal">
                    <h2>Доступ запрещен</h2>
                    <p>У вас нет прав для просмотра этой страницы</p>
                    <button onClick={() => setShowAuthModal(true)} className="auth-submit">
                        Войти
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="adminmenu-container">
            <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} isAdmin={isAdmin}/>
            <Sidebar 
                categories={categories} 
                onCategorySelect={handleCategorySelect} 
                swapForm={ChangeForm} 
                currentArticle={currentArticle} 
                change={setCurrentArticle}
                isAdmin={isAdmin}
            />
            <ArticlesList 
                articles={articles} 
                setArticles={setArticles} 
                change={ChangeCurrentArticle} 
                currentArticle={currentArticle}
                isAdmin={isAdmin}
            />
        </div>
    );
};

export default AdminMenu;