"use client"
import React, { useState, useEffect, useCallback } from 'react';
import "./ArticlesList.scss"
import DOMPurify from 'dompurify';

const ArticlesList = ({ articles, setArticles, change, currentArticle, isAdmin }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20); // Уменьшил для производительности
    const [loading, setLoading] = useState(false);

    // Если не админ - не показываем ничего
    if (!isAdmin) {
        return (
            <div className="news-list">
                <h2>Нет доступа</h2>
                <p>У вас нет прав для просмотра этого раздела</p>
            </div>
        );
    }

    // Пагинация - показываем только часть статей
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentArticles = articles?.slice(indexOfFirstItem, indexOfLastItem) || [];
    const totalPages = Math.ceil((articles?.length || 0) / itemsPerPage);

    // Функция для загрузки следующей страницы
    const loadNextPage = () => {
        if (currentPage < totalPages && !loading) {
            setLoading(true);
            setTimeout(() => {
                setCurrentPage(prev => prev + 1);
                setLoading(false);
            }, 100);
        }
    };

    // Infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop 
                !== document.documentElement.offsetHeight || loading) {
                return;
            }
            loadNextPage();
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, currentPage, totalPages]);

    const handleDeleteArticle = async (articleId) => {
        if (!isAdmin) return;
        
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

            setArticles(prevArticles =>
                prevArticles.filter(article => article._id !== articleId)
            );

            alert('Статья успешно удалена!');

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
            return dateString;
        }
    };

    // Оптимизированная функция клика
    const handleArticleClick = useCallback((article) => {
        if (!isAdmin) return;
        if (currentArticle !== article) {
            change(article);
        } else {
            change(null);
        }
    }, [currentArticle, change, isAdmin]);

    return (
        <div className="news-list">
            <div className="news-list__header">
                <h2>Список новостей ({articles?.length || 0})</h2>
                <div className="news-list__controls">
                    <select 
                        value={itemsPerPage} 
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="page-size-select"
                    >
                        <option value={10}>10 на странице</option>
                        <option value={20}>20 на странице</option>
                        <option value={50}>50 на странице</option>
                        <option value={100}>100 на странице</option>
                    </select>
                    
                    <div className="pagination">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            Назад
                        </button>
                        <span className="pagination-info">
                            Страница {currentPage} из {totalPages}
                        </span>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            Вперед
                        </button>
                    </div>
                </div>
            </div>

            {currentArticles.length > 0 ? (
                <>
                    <ul className="news-list__list">
                        {currentArticles.map(article => (
                            <li
                                key={article._id}
                                className={`news-list__item${currentArticle && currentArticle._id === article._id ? ' news-list__item--current' : ''}`}
                                onClick={() => handleArticleClick(article)}
                            >
                                <div className="btn-container">
                                    <button
                                        className="dlt-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Вы уверены что хотите удалить эту статью?')) {
                                                handleDeleteArticle(article._id);
                                            }
                                        }}
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
                                </div>

                                <h3 className="news-list__title">{article.title || 'Без названия'}</h3>
                                <div className="news-list__meta">
                                    <span className="news-list__author">АВТОР: {article.author || 'Неизвестен'}</span>
                                    <span className="news-list__date">{formatDate(article.date)}</span>
                                </div>

                                {/* Основное изображение - ленивая загрузка */}
                                {article.images && (
                                    <div className="news-list__image-container">
                                        <img
                                            src={article.images.startsWith('http') ? article.images : `${process.env.NEXT_PUBLIC_API_URL || ''}${article.images}`}
                                            alt="Иллюстрация к статье"
                                            className="news-list__main-image"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Контент показываем только для текущей статьи */}
                                {currentArticle && currentArticle._id === article._id && (
                                    <div 
                                        className="news-list__content-preview"
                                        dangerouslySetInnerHTML={{ 
                                            __html: DOMPurify.sanitize(article.content?.substring(0, 200) + '...') 
                                        }} 
                                    />
                                )}

                                {/* Категории */}
                                {article.categories?.length > 0 && (
                                    <ul className="news-list__categories">
                                        {article.categories.slice(0, 3).map((category, index) => (
                                            <li key={index} className="news-list__category">
                                                {typeof category === 'object' ? category.name : category}
                                            </li>
                                        ))}
                                        {article.categories.length > 3 && (
                                            <li className="news-list__category-more">
                                                +{article.categories.length - 3}
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Индикатор загрузки */}
                    {loading && (
                        <div className="loading-indicator">
                            Загрузка...
                        </div>
                    )}

                    {/* Кнопка загрузки еще для мобильных */}
                    {currentPage < totalPages && (
                        <button 
                            onClick={loadNextPage}
                            className="load-more-btn"
                            disabled={loading}
                        >
                            {loading ? 'Загрузка...' : 'Загрузить еще'}
                        </button>
                    )}
                </>
            ) : (
                <p className="news-list__empty">Нет новостей</p>
            )}
        </div>
    );
};

export default React.memo(ArticlesList);