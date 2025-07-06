"use client"
import React from 'react';
import RegisterForm from "@/components/RegisterForm/RegisterForm";
import "./register.scss"
import Header from "@/components/Header/Header";

const Page = () => {
    return (
        <div className="register-container">
            <Header/>
            <RegisterForm/>
        </div>
    );
};

export default Page;
