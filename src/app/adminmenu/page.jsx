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
    const [currentArticle,setCurrentArticle] = useState(null)


    useEffect(() => {
        const adminData = localStorage.getItem("admindata");
        if (adminData) {
            setIsLoggedIn(true);
        }
    }, []);
    const ChangeForm = () => {
        setIsFormShown(!isFormShown);
    };
    const ChangeCurrentArticle = (artcl) => {
        setCurrentArticle(artcl)
        console.log(artcl)
    }

    const handleLoginSuccess = (userData) => {
        setIsLoggedIn(true);
        // Можно сохранить дополнительные данные пользователя в состоянии
    };
    useEffect(() => {
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
    }, []);

    useEffect(() => {
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
    }, [selectedCategory]);

    const handleCategorySelect = (categorySlug) => {
        setSelectedCategory(categorySlug);
    };







    return (
        <div className="adminmenu-container">
            <Header isLoggedIn={isLoggedIn}/>
            <Sidebar categories={categories} onCategorySelect={handleCategorySelect} swapForm={ChangeForm} currentArticle = {currentArticle} change = {setCurrentArticle}/>

                <ArticlesList articles={articles} setArticles={setArticles} change = {ChangeCurrentArticle} currentArticle = {currentArticle}/>
        </div>
    );
};

export default AdminMenu;