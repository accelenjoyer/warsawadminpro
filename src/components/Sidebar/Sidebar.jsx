"use client"
import React, {useEffect, useState} from 'react';
import Link from "next/link";
import "./Sidebar.scss"
import CategoryForm from "@/components/CategoryForm/CategoryForm";

const Sidebar = ({ categories, onCategorySelect, swapForm }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryForm, setShowCategoryForm] = useState(false); //  Состояние для отображения формы
    const [categoriesList, setCategoriesList] = useState(categories); // Состояние для списка категорий, получаем начальный список из props

    // Обновление списка категорий при изменении props
    useEffect(() => {
        setCategoriesList(categories);
    }, [categories]);

    const handleCategoryClick = (category) => {
        const newSelectedCategory = selectedCategory === category.name ? null : category.name;
        setSelectedCategory(newSelectedCategory);
        onCategorySelect(newSelectedCategory);
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const toggleCategoryForm = () => {
        setShowCategoryForm(!showCategoryForm);
    };

    const handleCategoryCreated = async () => {

        try {
            const response = await fetch('http://localhost:5000/api/getcategories');
            if (!response.ok) {
                throw new Error('Ошибка при получении категорий');
            }
            const data = await response.json();
            setCategoriesList(data); //  Обновляем список
        } catch (error) {
            console.error('Ошибка при обновлении списка категорий:', error);

        }
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                {isOpen ? '❮' : '❯'}
            </button>
            <nav>
                <ul>
                    {categoriesList.map((category) => (
                        <li key={category.name}>
                            <button
                                className={`category-button ${selectedCategory === category.name ? 'active' : ''}`}
                                onClick={() => handleCategoryClick(category)}
                            >
                                {category.name}
                            </button>
                        </li>
                    ))}
                </ul>
                <button onClick={swapForm} className="swap-button" style={{ marginBottom: "20px" }}>
                    Создать статью
                </button>
                <button onClick={toggleCategoryForm} className="swap-button">
                    Создать категорию
                </button>
                {showCategoryForm && (
                    <CategoryForm onCategoryCreated={handleCategoryCreated} categories = {categoriesList} changeCategories = {setCategoriesList} />  //  Передаем функцию для обновления списка
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;