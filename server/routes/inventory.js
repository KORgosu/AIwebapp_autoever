const express = require('express');
const router = express.Router();
const createInventoryCommand = require('../commands/inventory/createInventory');
const getInventoryQuery = require('../queries/inventory/getInventory');
const updateInventoryQuery = require('../queries/inventory/updateInventory');
const deleteInventoryQuery = require('../queries/inventory/deleteInventory');

// 재고 조회
router.get('/', async (req, res) => {
  try {
    const inventory = await getInventoryQuery.execute();
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: '재고 조회 중 오류가 발생했습니다.' });
  }
});

// 재고 생성
router.post('/', async (req, res) => {
  try {
    const result = await createInventoryCommand.execute(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating inventory:', error);
    res.status(500).json({ error: '재고 생성 중 오류가 발생했습니다.' });
  }
});

// 재고 업데이트
router.put('/:id', async (req, res) => {
  try {
    const result = await updateInventoryQuery.execute(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ error: '재고 업데이트 중 오류가 발생했습니다.' });
  }
});

// 재고 삭제
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteInventoryQuery.execute(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting inventory:', error);
    res.status(500).json({ error: '재고 삭제 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 