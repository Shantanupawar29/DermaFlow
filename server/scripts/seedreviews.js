const mongoose = require('mongoose');
const Review = require('../models/Review'); // adjust path
require('dotenv').config({ path: '.env' });
mongoose.connect(process.env.MONGO_URI);

const dummyReviews = [
    { name: "Anaya", email: "a@ves.gmail.in", rating: 5, comment: "Amazing hydration, skin feels smooth!", isApproved: true },
    { name: "Saroj", email: "s@ves.gmail.in", rating: 2, comment: "Bad batch, my skin is stinging and has redness.", isApproved: true },
    { name: "Staffy", email: "staffy@gmail.ac.in", rating: 4, comment: "Effective serum, but slow to absorb.", isApproved: true },
    { name: "Ananya R.", email: "ananya@example.com", rating: 5, comment: "This retinol serum is amazing! My skin feels so smooth and it absorbs instantly. Highly recommend for aging skin.", isApproved: true },
  { name: "Ishaan K.", email: "ishaan@example.com", rating: 2, comment: "I had a bad experience. My face started stinging and developed a red rash after two uses. Not for sensitive skin.", isApproved: true },
  { name: "Priya M.", email: "priya@example.com", rating: 4, comment: "The Vitamin C drops are very effective for dullness, but the bottle is a bit small. Still, it gives a great glow.", isApproved: true },
  { name: "Rahul S.", email: "rahul@example.com", rating: 1, comment: "Terrible. It caused a burning sensation immediately. I think this batch has an issue. Do not buy!", isApproved: true },
  { name: "Sneha V.", email: "sneha@example.com", rating: 5, comment: "Best moisturizer ever. Very hydrating and not greasy at all. Perfect for my combination skin type.", isApproved: true },
  { name: "Vikram J.", email: "vikram@example.com", rating: 3, comment: "It is okay. Nothing special. It takes a long time to absorb into the skin.", isApproved: true }
];


Review.insertMany(dummyReviews).then(() => {
    console.log("Reviews Added! Atlas will now show the collection.");
    process.exit();
});