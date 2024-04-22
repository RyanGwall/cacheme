const mongoose = require('mongoose');
const cities = require('./cities');
const { items, descriptors } = require('./seedHelpers');
const Geocache = require('../models/geocache');

mongoose.connect('mongodb://localhost:27017/cache-me');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Geocache.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const value = Math.floor(Math.random() * 20) + 10;
        const cache = new Geocache({
            owner: '64f5a3b7dc36cf2af0823f37',  //YOUR USER ID
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(items)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime impedit, eum dicta eos nisi expedita voluptatem inventore soluta repellendus cupiditate. Dignissimos facere laboriosam minima ex illum voluptas, eius quasi earum.',
            value,
            images: [
                {
                    url: 'https://res.cloudinary.com/dhqyvrb9y/image/upload/v1694162650/CacheMe/hcmxnezkcnwwrdqc67fi.jpg',
                    filename: 'CacheMe/hcmxnezkcnwwrdqc67fi',
                },
                {
                    url: 'https://res.cloudinary.com/dhqyvrb9y/image/upload/v1694162652/CacheMe/s3v6jzrpeq6ktwm0bkjz.jpg',
                    filename: 'CacheMe/s3v6jzrpeq6ktwm0bkjz',
                }
            ],
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            }
        })
        await cache.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})