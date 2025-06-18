const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoClient = new MongoClient(process.env.MONGODB_URI);

class UpdateInventoryQuery {
  async execute(id, updateData) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('hyundai_inventory');
      const collection = db.collection('inventory');
      
      const result = await collection.updateOne(
        { _id: id },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        throw new Error('Inventory item not found');
      }
      
      return result;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  }
}

module.exports = new UpdateInventoryQuery(); 