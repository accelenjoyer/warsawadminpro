"use client";
import React, {useEffect, useState} from 'react';
import "./Header.scss"
import {useRouter} from "next/navigation";
const Header = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const adminData = localStorage.getItem("admindata");
        setIsLoggedIn(!!adminData);
    }, []);

    const handleClick = () => {
        localStorage.removeItem("admindata");
        router.push("/register");
    };

    return (
        <div className="header-container">
            Admin-menu сайта "Название сайта"
            <button className="logout-btn" onClick={handleClick}>
                {isLoggedIn ? "Выйти" : "Войти"}
            </button>
        </div>
    );
};


export default Header;