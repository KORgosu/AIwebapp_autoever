import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const MasterContainer = styled.div`
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
  color: #007bff;
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

const CreateGuestButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
  &:hover {
    background-color: #0056b3;
  }
`;

const DatabaseStatus = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  background-color: ${props => props.status === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.status === 'success' ? '#155724' : '#721c24'};
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

const ActionButton = styled.button`
  padding: 0.25rem 0.5rem;
  margin: 0 0.25rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.type === 'edit' ? '#ffc107' : '#dc3545'};
  color: ${props => props.type === 'edit' ? '#000' : '#fff'};
  &:hover {
    background-color: ${props => props.type === 'edit' ? '#e0a800' : '#c82333'};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;
  &:hover {
    background-color: ${props => props.primary ? '#0056b3' : '#5a6268'};
  }
`;

const AddButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
  &:hover {
    background-color: #218838;
  }
`;

function Master() {
  const navigate = useNavigate();
  const [dbStatus, setDbStatus] = useState(null);
  const [dbError, setDbError] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    partNumber: '',
    partName: '',
    quantity: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testDatabaseConnection();
    fetchInventory();
  }, []);

  const testDatabaseConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/test');
      setDbStatus('success');
      setDbError(null);
    } catch (error) {
      setDbStatus('error');
      setDbError('데이터베이스 연결에 실패했습니다.');
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory');
      setInventory(response.data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleCreateGuest = () => {
    navigate('/create-guest');
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setFormData({
      partNumber: '',
      partName: '',
      quantity: '',
      location: ''
    });
    setShowModal(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setFormData({
      partNumber: item.part_number,
      partName: item.part_name,
      quantity: item.quantity,
      location: item.location
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`http://localhost:5000/api/inventory/${id}`);
        fetchInventory();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`http://localhost:5000/api/inventory/${editingItem.id}`, formData);
      } else {
        const response = await axios.post('http://localhost:5000/api/inventory', formData);
        if (response.data.message) {
          alert(response.data.message);
        }
      }
      setShowModal(false);
      fetchInventory();
    } catch (error) {
      console.error('Error saving item:', error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert('저장 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <MasterContainer>
      <Header>
        <Title>현대자동차 통합 재고관리 데이터베이스</Title>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LoginStatus>master로 로그인 중입니다</LoginStatus>
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        </div>
      </Header>
      <Content>
        <CreateGuestButton onClick={handleCreateGuest}>게스트 계정 생성</CreateGuestButton>
        {dbStatus && (
          <DatabaseStatus status={dbStatus}>
            {dbStatus === 'success' ? '데이터베이스 연결 성공' : dbError}
          </DatabaseStatus>
        )}
        <AddButton onClick={handleAddClick}>+ 새 재고 추가</AddButton>
        {loading ? (
          <p>데이터를 불러오는 중...</p>
        ) : (
          <InventoryTable>
            <thead>
              <tr>
                <TableHeader>파트번호</TableHeader>
                <TableHeader>파트명</TableHeader>
                <TableHeader>수량</TableHeader>
                <TableHeader>위치</TableHeader>
                <TableHeader>등록일자</TableHeader>
                <TableHeader>작업</TableHeader>
              </tr>
            </thead>
            <tbody>
              {inventory && inventory.length > 0 ? (
                inventory.map((item) => (
                  <tr key={item.id}>
                    <TableCell>{item.part_number}</TableCell>
                    <TableCell>{item.part_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <ActionButton type="edit" onClick={() => handleEditClick(item)}>수정</ActionButton>
                      <ActionButton type="delete" onClick={() => handleDeleteClick(item.id)}>삭제</ActionButton>
                    </TableCell>
                  </tr>
                ))
              ) : (
                <tr>
                  <TableCell colSpan="6" style={{ textAlign: 'center' }}>
                    재고 데이터가 없습니다.
                  </TableCell>
                </tr>
              )}
            </tbody>
          </InventoryTable>
        )}
      </Content>

      {showModal && (
        <Modal>
          <ModalContent>
            <h2>{editingItem ? '재고 수정' : '새 재고 추가'}</h2>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>파트번호</Label>
                <Input
                  type="text"
                  name="partNumber"
                  value={formData.partNumber}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>파트명</Label>
                <Input
                  type="text"
                  name="partName"
                  value={formData.partName}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>수량</Label>
                <Input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>위치</Label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <ModalButtons>
                <Button type="button" onClick={() => setShowModal(false)}>취소</Button>
                <Button type="submit" primary>저장</Button>
              </ModalButtons>
            </form>
          </ModalContent>
        </Modal>
      )}
    </MasterContainer>
  );
}

export default Master; 