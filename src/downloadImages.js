const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const booksJson = require('./books.json');

const fetchAndSaveImages = async () => {
    try {
        const promises = booksJson.map(async (book) => {
            const response = await fetch(
                `https://openlibrary.org/api/books?bibkeys=ISBN:${book.isbn}&format=json&jscmd=data`
            );
            const data = await response.json();
            const bookData = data[`ISBN:${book.isbn}`];

            if (bookData && bookData.cover) {
                const imageUrl = bookData.cover.large;
                const imagePath = path.join(__dirname, '..', 'public', 'images', `${book.isbn}.jpg`);

                const imageResponse = await fetch(imageUrl);
                const buffer = await imageResponse.buffer();
                fs.writeFileSync(imagePath, buffer);

                console.log(`Image saved for ISBN ${book.isbn}`);
            }
        });

        await Promise.all(promises);

        console.log('All images fetched and saved successfully.');
    } catch (error) {
        console.error('Error fetching and saving images:', error);
    }
};

fetchAndSaveImages();
