"use client"
import React, {useEffect, useState} from 'react';
import Sidebar from "@/components/Sidebar/Sidebar";
import "./adminmenu.scss"
import ArticleForm from "@/components/ArticleForm/ArticleForm";
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
    const [isLoading, setIsLoading] = useState(true);





    return (
        <div className="adminmenu-container">
            <Header isLoggedIn={isLoggedIn}/>
            {isFormShown ? (
                <ArticleForm articles={articles}/>
            ) : (
                <ArticlesList articles={articles} setArticles={setArticles}/>
            )}
            <Sidebar categories={categories} onCategorySelect={handleCategorySelect} swapForm={ChangeForm}/>
        </div>
    );
};

export default AdminMenu;