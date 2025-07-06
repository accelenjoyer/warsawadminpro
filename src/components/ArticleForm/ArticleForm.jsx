"use client"
import React, {useEffect, useState} from 'react';
import "./ArticleForm.scss"


const ArticleForm = () => {
    const localData = localStorage.getItem("admindata");
    const ObjectData = JSON.parse(localData);
    const authorName = ObjectData?.name || 'Автор по умолчанию';

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        images: '', // теперь base64
        author: authorName,
        categories: [],
    });

    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/getcategories');
                if (!response.ok) throw new Error('Ошибка при получении категорий');
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Ошибка при получении категорий:', error);
                setError(error.message || 'Ошибка при получении категорий');
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const base64 = await toBase64(file);
        setFormData(prev => ({
            ...prev,
            images: base64,
        }));
    };

    const toBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleClick = (category) => {
        setFormData(prevState => {
            const currentCategories = prevState.categories || [];
            const isCategorySelected = currentCategories.includes(category._id);

            const newCategories = isCategorySelected
                ? currentCategories.filter(cat => cat !== category._id)
                : [...currentCategories, category._id];

            return {
                ...prevState,
                categories: newCategories,
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!formData.title || !formData.content || !formData.categories.length) {
            setError('Пожалуйста, заполните все обязательные поля (заголовок, контент, категории).');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/adminmenu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Неизвестная ошибка');
            }

            setMessage('Новость успешно зарегистрирована!');
            setFormData({
                title: '',
                content: '',
                images: '',
                author: authorName,
                categories: [],
            });
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            setError(error.message || 'Ошибка при отправке запроса на сервер');
            setMessage('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="article-form">
            {message && <p className={`article-form__message ${error ? 'article-form__message--error' : 'article-form__message--success'}`}>{message}</p>}
            {error && <p className="article-form__message article-form__message--error">{error}</p>}

            <div className="article-form__group">
                <label htmlFor="title" className="article-form__label">Заголовок:</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="article-form__input" maxLength={160}/>
            </div>

            <div className="article-form__group">
                <label htmlFor="content" className="article-form__label">Содержание:</label>
                <textarea id="content" name="content" value={formData.content} onChange={handleChange} required className="article-form__textarea" />
            </div>

            <div className="article-form__group">
                <label htmlFor="images" className="article-form__label">Изображение (выберите файл):</label>
                <input type="file" id="images" name="images" accept="image/*" onChange={handleImageChange} className="article-form__input" />
                {formData.images && (
                    <div className="article-form__preview">
                        <img src={formData.images} alt="Превью" className="article-form__preview-image" />
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, images: '' }))}
                            className="article-form__remove-image"
                            title="Удалить изображение"
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>

            <div className="article-form__group">
                <label htmlFor="author" className="article-form__label">Автор:</label>
                <input type="text" id="author" name="author" value={formData.author} disabled className="article-form__input" />
            </div>

            <div className="article-form__group">
                {categories.map(category => (
                    <button
                        key={category._id}
                        onClick={() => handleClick(category)}
                        type="button"
                        className={`article-form__category-button ${formData.categories.includes(category._id) ? 'article-form__category-button--active' : ''}`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            <button type="submit" className="article-form__button">Отправить</button>
        </form>
    );
};

export default ArticleForm;
