"use client"
import React, {useState} from 'react';
import "./CategoryForm.scss"
const CategoryForm = ({ onCategoryCreated, categories, changeCategories }) => {
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [activatedCategories, setActivatedCategories] = useState({})
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!categoryName) {
            setError('Пожалуйста, введите название категории.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/addcategory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: categoryName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при создании категории');
            }

            const newCategory = await response.json();
            console.log('Новая категория:', newCategory);
            setSuccess(true);
            setCategoryName(''); // Очищаем поле ввода
            if (onCategoryCreated) { // Вызываем функцию обновления списка
                onCategoryCreated();
            }
        } catch (error) {
            setError(error.message);
        }
    };
    const Activate = (categoryId) => {
        setActivatedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId], // Переключаем состояние для конкретной категории
        }));
    };

    return (
        <div className="category-form">
            {success && <p className={`category-form__message category-form__message--success`}>Категория успешно создана!</p>}
            {error && <p className={`category-form__message category-form__message--error`}>{error}</p>}

            <div className="category-form__scrollable-content">
                <h3 className="category-form__title">Существующие категории:</h3>
                <ul className="category-form__category-list">
                    {categories.map(category => (
                        <li
                            key={category._id}
                            className="category-form__category-item"
                            onClick={() => Activate(category._id)}
                        >
                            {activatedCategories[category._id] ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                    <path
                                        fillRule="evenodd"
                                        d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            ) : null}
                            {category.name}
                        </li>
                    ))}
                </ul>
            </div>

            <h3 className="category-form__title">Добавить новую категорию:</h3>
            <form onSubmit={handleSubmit}>
                <label htmlFor="categoryName" className="category-form__label">Название категории:</label>
                <input
                    type="text"
                    id="categoryName"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                    className="category-form__input"
                />
                <button type="submit" className="category-form__button">Создать категорию</button>
            </form>
        </div>
    );
};

export default CategoryForm;