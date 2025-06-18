const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoClient = new MongoClient(process.env.MONGODB_URI);

class GetInventoryQuery {
  async execute() {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('hyundai_inventory');
      const collection = db.collection('inventory');
      
      const data = await collection.find({}).toArray();
      return data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  }
}

module.exports = new GetInventoryQuery(); 