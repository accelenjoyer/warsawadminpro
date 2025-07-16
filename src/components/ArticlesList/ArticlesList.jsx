"use client"
import React from 'react';
import "./ArticlesList.scss"
import DOMPurify from 'dompurify';




const ArticlesList = ({ articles, setArticles }) => {
    const handleDeleteArticle = async (articleId) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/adminmenu/${articleId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении статьи');
            }

            // Обновляем состояние, удаляя статью из списка
            setArticles(prevArticles =>
                prevArticles.filter(article => article._id !== articleId)
            );

            // Опционально: показываем уведомление об успехе
            alert('Статья успешно удалена!  Кек!');

        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось удалить статью');
        }
    };

    // Форматирование даты с проверкой
    const formatDate = (dateString) => {
        if (!dateString) return 'Дата не указана';
        try {
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            return new Date(dateString).toLocaleDateString('ru-RU', options);
        } catch {
            return dateString; // возвращаем как есть, если не удалось распарсить
        }
    };

    // Санитизация HTML контента
    const sanitizeContent = (html) => {
        if (!html) return '';
        console.log(html)
        return DOMPurify.sanitize(html);


    };

    return (
        <div className="news-list">
            <h2>Список новостей</h2>
            {articles?.length > 0 ? (
                <ul className="news-list__list">
                    {articles.map(article => (
                        <li key={article._id} className="news-list__item">
                            <div className="btn-container">
                                <button
                                    className="dlt-btn"
                                    onClick={() => handleDeleteArticle(article._id)}
                                >

                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M3 6H5H21"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M10 11V17"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M14 11V17"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                                <button className="edit-btn">

                                </button>
                            </div>

                            <h3 className="news-list__title">{article.title || 'Без названия'}</h3>
                            <div className="news-list__meta">
                                <span className="news-list__author">АВТОР: {article.author || 'Неизвестен'}</span>
                                <span className="news-list__date">{formatDate(article.date)}</span>
                            </div>

                            {/* Основное содержимое */}
                            <div
                                className="news-list__content"
                                dangerouslySetInnerHTML={{ __html: sanitizeContent(article.content) }}
                            />

                            {/* Основное изображение */}
                            {article.images && (
                                <div className="news-list__image-container">
                                    <img
                                        src={article.images.startsWith('http') ? article.images : `${process.env.NEXT_PUBLIC_API_URL || ''}${article.images}`}
                                        alt="Иллюстрация к статье"
                                        className="news-list__main-image"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Категории с проверкой */}
                            {article.categories?.length > 0 && (
                                <ul className="news-list__categories">
                                    {article.categories.map(category => (
                                        <li key={category._id || category} className="news-list__category">
                                            {typeof category === 'object' ? category.name : category}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="news-list__empty">Нет новостей</p>
            )}
        </div>
    );
};
export default ArticlesList;