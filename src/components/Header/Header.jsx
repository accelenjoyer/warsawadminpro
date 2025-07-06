import React from 'react';
import "./Header.scss"
import {useRouter} from "next/navigation";
const Header = () => {
    const router = useRouter();
    const loggined = localStorage.getItem("admindata")
    const handleClick = () => {
        localStorage.removeItem("admindata");
        router.push("/register")
    }
    return (
        <div className="header-container">
            Admin-menu сайта "Название сайта"
            <button className="logout-btn" onClick={handleClick}>
                {loggined ? "Выйти" : "Войти"}
            </button>
        </div>
    );
};

export default Header;