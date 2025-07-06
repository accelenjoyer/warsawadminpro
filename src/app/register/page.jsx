"use client"
import React, {useEffect, useState} from 'react';
import RegisterForm from "@/components/RegisterForm/RegisterForm";
import "./register.scss"
import Header from "@/components/Header/Header";

const Page = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const adminData = localStorage.getItem("admindata");
        setIsLoggedIn(!!adminData);
    }, []);

    return (
        <div className="register-container">
            <Header isLoggedIn={isLoggedIn} />
            <RegisterForm />
        </div>
    );
};


export default Page;
