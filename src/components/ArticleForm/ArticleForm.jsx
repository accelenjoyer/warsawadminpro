"use client"
import React, { useEffect, useState, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Table from '@editorjs/table';
import "./ArticleForm.scss";

import DOMPurify from 'dompurify';

const ArticleForm = () => {
    const editorInstance = useRef(null);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const localData = localStorage.getItem("admindata");
    const ObjectData = JSON.parse(localData);
    const authorName = ObjectData?.name || 'Автор по умолчанию';

    const [formData, setFormData] = useState({
        title: '',
        rawContent: { blocks: [] },
        images: null,
        author: authorName,
        categories: [],
    });

    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Инициализация Editor.js
    useEffect(() => {
        const initEditor = async () => {
            editorInstance.current = new EditorJS({
                holder: 'editorjs-container',
                tools: {
                    header: {
                        class: Header,
                        config: {
                            placeholder: 'Введите заголовок',
                            levels: [2, 3],
                            defaultLevel: 2
                        }
                    },
                    list: {
                        class: List,
                        inlineToolbar: true
                    },
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                uploadByFile: async (file) => {
                                    try {
                                        const base64 = await toBase64(file);
                                        return {
                                            success: 1,
                                            file: {
                                                url: base64
                                            }
                                        };
                                    } catch (error) {
                                        console.error('Ошибка загрузки изображения:', error);
                                        return { success: 0 };
                                    }
                                }
                            }
                        }
                    },
                    table: {
                        class: Table,
                        inlineToolbar: true
                    }
                },
                data: formData.rawContent,
                async onChange() {
                    try {
                        const content = await editorInstance.current.save();
                        setFormData(prev => ({
                            ...prev,
                            rawContent: content
                        }));
                    } catch (error) {
                        console.error('Ошибка сохранения контента:', error);
                    }
                }
            });
            setIsEditorReady(true);
        };

        if (!editorInstance.current) {
            initEditor();
        }

        return () => {
            if (editorInstance.current && editorInstance.current.destroy) {
                editorInstance.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/getcategories`);
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
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('Максимальный размер изображения - 5MB');
            return;
        }

        try {
            const base64 = await toBase64(file);
            setFormData(prev => ({
                ...prev,
                images: base64,
            }));
        } catch (error) {
            console.error('Ошибка обработки изображения:', error);
            setError('Ошибка при загрузке изображения');
        }
    };

    const toBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleCategoryToggle = (categoryId) => {
        setFormData(prev => {
            const isSelected = prev.categories.includes(categoryId);
            return {
                ...prev,
                categories: isSelected
                    ? prev.categories.filter(id => id !== categoryId)
                    : [...prev.categories, categoryId]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            // Валидация
            if (!formData.title.trim()) {
                throw new Error('Заголовок обязателен');
            }

            if (!formData.rawContent.blocks || formData.rawContent.blocks.length === 0) {
                throw new Error('Добавьте содержание статьи');
            }

            if (formData.categories.length === 0) {
                throw new Error('Выберите хотя бы одну категорию');
            }

            // Подготовка данных для отправки
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('rawContent', JSON.stringify(formData.rawContent));
            formDataToSend.append('author', formData.author);
            formDataToSend.append('categories', JSON.stringify(formData.categories));

            if (formData.images && typeof formData.images !== 'string') {
                formDataToSend.append('image', formData.images);
            }

            // Отправка данных
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/adminmenu`, {
                method: 'POST',
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка сервера');
            }

            // Сброс формы
            setFormData({
                title: '',
                rawContent: { blocks: [] },
                images: null,
                author: authorName,
                categories: [],
            });

            if (editorInstance.current) {
                editorInstance.current.clear();
            }

            setMessage('Статья успешно сохранена!');
        } catch (error) {
            console.error('Ошибка при сохранении статьи:', error);
            setError(DOMPurify.sanitize(error.message));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="article-form">
            {message && (
                <p className="article-form__message article-form__message--success">
                    {message}
                </p>
            )}
            {error && (
                <p className="article-form__message article-form__message--error">
                    {error}
                </p>
            )}

            <div className="article-form__group">
                <label htmlFor="title" className="article-form__label">
                    Заголовок:
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="article-form__input"
                    maxLength={160}
                />
            </div>

            <div className="article-form__group">
                <label className="article-form__label">
                    Содержание:
                </label>
                <div id="editorjs-container" className="article-form__editor" />
                {!isEditorReady && <div>Загрузка редактора...</div>}
            </div>

            <div className="article-form__group">
                <label htmlFor="images" className="article-form__label">
                    Изображение (выберите файл):
                </label>
                <input
                    type="file"
                    id="images"
                    name="images"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="article-form__input"
                />
                {formData.images && (
                    <div className="article-form__preview">
                        <img
                            src={formData.images}
                            alt="Превью"
                            className="article-form__preview-image"
                        />
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, images: null }))}
                            className="article-form__remove-image"
                            title="Удалить изображение"
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>

            <div className="article-form__group">
                <label htmlFor="author" className="article-form__label">
                    Автор:
                </label>
                <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    disabled
                    className="article-form__input"
                />
            </div>

            <div className="article-form__group">
                <p className="article-form__label">
                    Категории:
                </p>
                <div className="article-form__categories">
                    {categories.map(category => (
                        <button
                            key={category._id}
                            type="button"
                            onClick={() => handleCategoryToggle(category._id)}
                            className={`article-form__category-button ${
                                formData.categories.includes(category._id)
                                    ? 'article-form__category-button--active'
                                    : ''
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                className="article-form__button"
                disabled={!isEditorReady}
            >
                Отправить
            </button>
        </form>
    );
};

export default ArticleForm;
