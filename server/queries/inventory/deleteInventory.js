const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoClient = new MongoClient(process.env.MONGODB_URI);

class DeleteInventoryQuery {
  async execute(id) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('hyundai_inventory');
      const collection = db.collection('inventory');
      
      const result = await collection.deleteOne({ _id: id });
      
      if (result.deletedCount === 0) {
        throw new Error('Inventory item not found');
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting inventory:', error);
      throw error;
    }
  }
}

module.exports = new DeleteInventoryQuery(); 