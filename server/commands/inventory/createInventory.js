const mariadb = require('mariadb');
const eventPublisher = require('../../events/publishers/inventoryEventPublisher');
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 5
});

class CreateInventoryCommand {
  async execute(data) {
    // 데이터 유효성 검사 추가 (snake_case)
    if (!data.part_number || !data.part_name || data.quantity === undefined || data.quantity === null) {
      throw new Error('필수값이 누락되었습니다.');
    }
    const quantity = Number(data.quantity);
    if (isNaN(quantity)) {
      throw new Error('수량은 숫자여야 합니다.');
    }
    let conn;
    try {
      conn = await pool.getConnection();
      
      // 트랜잭션 시작
      await conn.beginTransaction();

      // 재고 데이터 삽입
      const result = await conn.query(
        'INSERT INTO inventory (part_number, part_name, quantity, location) VALUES (?, ?, ?, ?)',
        [data.part_number, data.part_name, quantity, data.location]
      );

      // 새로 추가된 데이터 조회
      const [newItem] = await conn.query(
        'SELECT * FROM inventory WHERE id = ?',
        [result.insertId]
      );

      // 이벤트 발행
      await eventPublisher.publishInventoryCreated(newItem);

      // 트랜잭션 커밋
      await conn.commit();

      return newItem;
    } catch (error) {
      // 오류 발생 시 롤백
      if (conn) await conn.rollback();
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }
}

module.exports = new CreateInventoryCommand(); 