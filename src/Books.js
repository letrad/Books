import React, { useEffect, useState } from 'react';
import './Books.css';
import booksJson from './books.json';

const Books = () => {
    const [books, setBooks] = useState({});
    const [popup, setPopup] = useState({ show: false, data: {} });

    useEffect(() => {
        const fetchBooks = async () => {
            const fetchedBooks = await Promise.allSettled(
                booksJson.map((book) => {
                    return fetch(
                        `https://openlibrary.org/api/books?bibkeys=ISBN:${book.isbn}&format=json&jscmd=data`
                    )
                        .then(response => response.json())
                        .then(data => {
                            const bookData = data[`ISBN:${book.isbn}`];

                            if (bookData) {
                                return {
                                    title: bookData.title,
                                    author: bookData.authors[0].name,
                                    image: `${process.env.PUBLIC_URL}/images/${book.isbn}.jpg`,
                                    category: book.category,
                                    downloadLink: book.path,
                                    isbn: book.isbn
                                };
                            }
                        });
                })
            );

            const validResults = fetchedBooks
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);

            const groupedBooks = validResults.reduce((groups, book) => {
                const category = book.category;
                if (!groups[category]) {
                    groups[category] = [];
                }
                groups[category].push(book);
                return groups;
            }, {});

            setBooks(groupedBooks);
        };

        fetchBooks();
    }, []);

    const handleBookClick = (book) => {
        setPopup({ show: true, data: book });
    };

    const handleClosePopup = () => {
        setPopup({ show: false, data: {} });
    };

    return (
        <div className="container">
            <div className="header">
                <h1>Letrad's Books</h1>
                <p>Welcome to the collection of Letrad's masterpieces</p>
            </div>
            {Object.entries(books).map(([category, booksList]) => (
                <React.Fragment key={category}>
                    <h2 className="category-header">{category}</h2>
                    <div className="book-grid">
                        {Array.isArray(booksList) ? (
                            booksList.map((book, index) => (
                                <div className="book-card" key={index} onClick={() => handleBookClick(book)}>
                                    <img src={book.image} alt={`${book.title} Cover`} />
                                    <h2>{book.title}</h2>
                                    <p>{book.author}</p>
                                </div>
                            ))
                        ) : (
                            <p>No books found in this category</p>
                        )}
                    </div>
                </React.Fragment>
            ))}
            {popup.show && (
                <div className="popup">
                    <button className="popup-close" onClick={handleClosePopup}>X</button>
                    <div className="popup-content">
                        <h2>{popup.data.title}</h2>
                        <img src={popup.data.image} alt={`${popup.data.title} Cover`} />
                        <p>Author: {popup.data.author}</p>
                        <p>Category: {popup.data.category}</p>
                        <p>ISBN: {popup.data.isbn}</p>
                        <a href={popup.data.downloadLink} download>Download</a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Books;
