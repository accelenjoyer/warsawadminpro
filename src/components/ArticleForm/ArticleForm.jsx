"use client"
import React, { useEffect, useState, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Table from '@editorjs/table';
import "./ArticleForm.scss";

import DOMPurify from 'dompurify';



const ArticleForm = ({currentArticle}) => {
    console.log(22)
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
        console.log(22)
        const initEditor = async () => {
            const container = document.getElementById('editorjs-container');
            if (!container) {
                // Ждём пока DOM элемент появится
                setTimeout(initEditor, 100);
                return;
            }
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
    useEffect(() => {
        if (currentArticle && isEditorReady && editorInstance.current) {
            setFormData({
                title: currentArticle.title || '',
                rawContent: currentArticle.rawContent || { blocks: [] },
                images: currentArticle.images || null,
                author: currentArticle.author || authorName,
                categories: currentArticle.categories
                    ? currentArticle.categories.map(cat => typeof cat === 'string' ? cat : cat._id)
                    : [],
            });

            editorInstance.current.isReady
                .then(() => {
                    if (currentArticle.rawContent) {
                        editorInstance.current.render(currentArticle.rawContent);
                    }
                })
                .catch((err) => console.error('Editor render error:', err));
        }
    }, [currentArticle, isEditorReady]);


    const handleImageChange = async (e) => {
        console.log("start")
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('Максимальный размер изображения - 5MB');
            return;
        }

        console.log('Selected image file:', file);
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
            const newCategories = prev.categories.includes(categoryId)
                ? prev.categories.filter(id => id !== categoryId)
                : [...new Set([...prev.categories, categoryId])];

            return {
                ...prev,
                categories: newCategories,
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            if (!formData.title.trim()) {
                throw new Error('Заголовок обязателен');
            }

            if (!formData.rawContent.blocks || formData.rawContent.blocks.length === 0) {
                throw new Error('Добавьте содержание статьи');
            }

            if (formData.categories.length === 0) {
                throw new Error('Выберите хотя бы одну категорию');
            }

            if (!formData.images) {
                throw new Error('Выберите изображение');
            }

            const formDataToSend = {
                title: formData.title,
                rawContent: formData.rawContent,
                author: formData.author,
                categories: formData.categories,
                images: formData.images,
            };

            const isEditMode = !!currentArticle?._id;
            const method = isEditMode ? 'PUT' : 'POST';
            const url = isEditMode
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/adminmenu/${currentArticle._id}`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/adminmenu`;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formDataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка сервера');
            }

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

            setMessage(isEditMode ? 'Статья успешно обновлена!' : 'Статья успешно создана!');
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
