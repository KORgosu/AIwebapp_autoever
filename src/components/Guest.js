import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const GuestContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
`;

const LoginStatus = styled.div`
  color: #28a745;
  font-weight: bold;
  margin-right: 1rem;
`;

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #c82333;
  }
`;

const Content = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const InventoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const TableHeader = styled.th`
  background-color: #f8f9fa;
  padding: 0.75rem;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
`;

const TableCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #dee2e6;
`;

const LastSyncTime = styled.div`
  margin-top: 1rem;
  color: #6c757d;
  font-size: 0.9rem;
`;

function Guest() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    fetchInventory();
    // 1분마다 데이터 새로고침
    const interval = setInterval(fetchInventory, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/guest/inventory');
      setInventory(response.data.data);
      setLastSync(new Date().toLocaleString());
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <GuestContainer>
      <Header>
        <Title>현대자동차 통합 재고관리 데이터베이스</Title>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LoginStatus>guest로 로그인 중입니다</LoginStatus>
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        </div>
      </Header>
      <Content>
        <h2>재고 현황</h2>
        <InventoryTable>
          <thead>
            <tr>
              <TableHeader>파트번호</TableHeader>
              <TableHeader>파트명</TableHeader>
              <TableHeader>수량</TableHeader>
              <TableHeader>위치</TableHeader>
              <TableHeader>등록일자</TableHeader>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item._id}>
                <TableCell>{item.part_number}</TableCell>
                <TableCell>{item.part_name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
              </tr>
            ))}
          </tbody>
        </InventoryTable>
        {lastSync && (
          <LastSyncTime>
            마지막 업데이트: {lastSync}
          </LastSyncTime>
        )}
      </Content>
    </GuestContainer>
  );
}

export default Guest; 