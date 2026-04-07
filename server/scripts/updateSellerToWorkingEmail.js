require('dotenv').config();
const mongoose = require('mongoose');

async function updateSellerEmail() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const suppliers = db.collection('suppliers');
    
    // Update seller to the working email
    const result = await suppliers.updateOne(
      { email: 'anushka.5aas@gmail.com' },
      { $set: { email: 'anuu.sha2905@gmail.com' } }
    );
    
    console.log(`✅ Updated seller email to: anuu.sha2905@gmail.com`);
    console.log(`Modified: ${result.modifiedCount} document(s)`);
    
    // Verify
    const seller = await suppliers.findOne({ email: 'anuu.sha2905@gmail.com' });
    if (seller) {
      console.log('\n📧 Seller details:');
      console.log(`   Name: ${seller.name}`);
      console.log(`   Email: ${seller.email}`);
      console.log(`   Company: ${seller.company}`);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

updateSellerEmail();