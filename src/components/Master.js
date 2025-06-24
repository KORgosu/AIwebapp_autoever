import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

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
  font-size: 12px;
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

const TextLink = styled.span`
  color: #007bff;
  cursor: pointer;
  font-weight: 500;
  margin-left: 1rem;
  font-size: 12px;
  &:hover {
    text-decoration: underline;
    color: #0056b3;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  width: 200px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const SearchButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #0056b3;
  }
`;

const TableControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const LocationContainer = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #dee2e6;
`;

const LocationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const LocationTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
`;

const LocationButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 0.5rem;
  &:hover {
    background-color: ${props => props.primary ? '#0056b3' : '#5a6268'};
  }
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const LocationInfo = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 0.5rem;
`;

const LocationError = styled.div`
  color: #dc3545;
  font-size: 14px;
  margin-top: 0.5rem;
`;

const LocationLoading = styled.div`
  color: #007bff;
  font-size: 14px;
  margin-top: 0.5rem;
`;

function Master() {
  const navigate = useNavigate();
  const [dbStatus, setDbStatus] = useState(null);
  const [dbError, setDbError] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    part_number: '',
    part_name: '',
    quantity: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  useEffect(() => {
    testDatabaseConnection();
    fetchInventory();
    initializeMasterAccount();
  }, []);

  // 검색어가 변경될 때마다 필터링 실행
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInventory(inventory);
    } else {
      const filtered = inventory.filter(item => 
        item.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.part_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInventory(filtered);
    }
  }, [searchTerm, inventory]);

  const initializeMasterAccount = async () => {
    try {
      // 기존 마스터 계정이 있는지 확인
      const masterEmail = 'olyn@master.com';
      const userDoc = await getDoc(doc(db, 'users', 'master-account'));
      
      if (!userDoc.exists()) {
        // 마스터 계정이 없으면 생성 (비밀번호를 6자 이상으로 변경)
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            masterEmail,
            '096000'  // 6자 이상으로 변경
          );
          
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            id: 'olyn',
            role: 'master',
            createdAt: new Date().toISOString()
          });
          
          console.log('초기 마스터 계정이 생성되었습니다.');
        } catch (error) {
          if (error.code === 'auth/email-already-in-use') {
            console.log('마스터 계정이 이미 존재합니다.');
          } else {
            console.error('마스터 계정 생성 오류:', error);
          }
        }
      }
    } catch (error) {
      console.error('마스터 계정 초기화 오류:', error);
    }
  };

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
      part_number: '',
      part_name: '',
      quantity: '',
      location: ''
    });
    setShowModal(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setFormData({
      part_number: item.part_number,
      part_name: item.part_name,
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
    if (!formData.part_number || !formData.part_name || !formData.quantity || !formData.location) {
      alert('모든 항목을 입력해 주세요.');
      return;
    }
    const payload = {
      part_number: formData.part_number,
      part_name: formData.part_name,
      quantity: Number(formData.quantity),
      location: formData.location
    };
    console.log('payload:', payload); // 디버깅용
    try {
      if (editingItem) {
        await axios.put(`http://localhost:5000/api/inventory/${editingItem.id}`, payload);
      } else {
        const response = await axios.post('http://localhost:5000/api/inventory', payload);
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

  const handleSearch = () => {
    // 검색은 이미 useEffect에서 자동으로 처리됨
    console.log('검색어:', searchTerm);
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&accept-language=ko&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.display_name) {
        console.log('전체 주소 데이터:', data); // 디버깅용
        
        // 한국 주소 형식으로 파싱
        const addressParts = data.display_name.split(', ');
        let koreanAddress = '';
        
        // 더 구체적인 주소 정보 추출
        if (data.address) {
          const addr = data.address;
          const components = [];
          
          // 시/도
          if (addr.state) components.push(addr.state);
          if (addr.city) components.push(addr.city);
          if (addr.county) components.push(addr.county);
          if (addr.district) components.push(addr.district);
          if (addr.suburb) components.push(addr.suburb);
          if (addr.neighbourhood) components.push(addr.neighbourhood);
          
          if (components.length > 0) {
            koreanAddress = components.join(' ');
          }
        }
        
        // 위 방법으로 주소를 찾지 못한 경우 display_name에서 파싱
        if (!koreanAddress) {
          for (let i = addressParts.length - 1; i >= 0; i--) {
            const part = addressParts[i];
            if (part.includes('대한민국')) {
              // 대한민국 다음부터의 주소 부분을 가져오기
              if (i > 0) {
                koreanAddress = addressParts.slice(0, i).join(', ');
              }
              break;
            }
          }
        }
        
        // 여전히 주소를 찾지 못한 경우 전체 주소 사용
        if (!koreanAddress || koreanAddress.trim() === '') {
          koreanAddress = data.display_name.replace('대한민국', '').trim();
          if (koreanAddress.startsWith(',')) {
            koreanAddress = koreanAddress.substring(1).trim();
          }
        }
        
        setCurrentAddress(koreanAddress || '주소를 찾을 수 없습니다.');
      } else {
        setCurrentAddress('주소를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('주소 변환 오류:', error);
      setCurrentAddress('주소 변환 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    setCurrentAddress(null);
    
    if (!navigator.geolocation) {
      setLocationError('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setIsLoadingLocation(false);
        console.log('현재 위치:', { latitude, longitude });
        
        // 위치를 가져온 후 주소도 함께 가져오기
        getAddressFromCoordinates(latitude, longitude);
      },
      (error) => {
        let errorMessage = '위치를 가져올 수 없습니다.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 정보 접근이 거부되었습니다.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
            break;
          default:
            errorMessage = '알 수 없는 오류가 발생했습니다.';
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const clearLocation = () => {
    setCurrentLocation(null);
    setLocationError(null);
    setCurrentAddress(null);
  };

  return (
    <MasterContainer>
      <Header>
        <img src={process.env.PUBLIC_URL + '/image1-removebg-preview.png'} alt="현대자동차그룹 로고" style={{ height: '60px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LoginStatus>master로 로그인 중입니다</LoginStatus>
          <TextLink onClick={handleCreateGuest}>게스트 계정 생성</TextLink>
          <TextLink onClick={handleLogout}>로그아웃</TextLink>
        </div>
      </Header>
      <Content>
        {dbStatus && (
          <DatabaseStatus status={dbStatus}>
            {dbStatus === 'success' ? '데이터베이스 연결 성공' : dbError}
          </DatabaseStatus>
        )}
        <LocationContainer>
          <LocationHeader>
            <LocationTitle>📍 현재 위치</LocationTitle>
            <div>
              <LocationButton 
                primary 
                onClick={getCurrentLocation}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? '위치 확인 중...' : '위치 확인'}
              </LocationButton>
              {currentLocation && (
                <LocationButton onClick={clearLocation}>
                  초기화
                </LocationButton>
              )}
            </div>
          </LocationHeader>
          {isLoadingLocation && (
            <LocationLoading>GPS 위치를 확인하고 있습니다...</LocationLoading>
          )}
          {locationError && (
            <LocationError>{locationError}</LocationError>
          )}
          {currentLocation && !isLoadingLocation && (
            <LocationInfo>
              위도: {currentLocation.latitude.toFixed(6)}<br />
              경도: {currentLocation.longitude.toFixed(6)}
              {isLoadingAddress && (
                <div style={{ marginTop: '0.5rem', color: '#007bff' }}>
                  주소를 확인하고 있습니다...
                </div>
              )}
              {currentAddress && !isLoadingAddress && (
                <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: '#28a745' }}>
                  📍 {currentAddress}
                </div>
              )}
            </LocationInfo>
          )}
        </LocationContainer>
        <TableControls>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="부품번호 또는 부품명을 입력하세요"
              value={searchTerm}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
            />
            <SearchButton onClick={handleSearch}>검색</SearchButton>
          </SearchContainer>
          <AddButton onClick={handleAddClick}>+ 새 재고 추가</AddButton>
        </TableControls>
        {loading ? (
          <p>데이터를 불러오는 중...</p>
        ) : (
          <InventoryTable>
            <thead>
              <tr>
                <TableHeader>부품번호</TableHeader>
                <TableHeader>부품명</TableHeader>
                <TableHeader>수량</TableHeader>
                <TableHeader>위치</TableHeader>
                <TableHeader>등록일자</TableHeader>
                <TableHeader>작업</TableHeader>
              </tr>
            </thead>
            <tbody>
              {filteredInventory && filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
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
                    {searchTerm.trim() !== '' ? '검색 결과가 없습니다.' : '재고 데이터가 없습니다.'}
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
                <Label>부품번호</Label>
                <Input
                  type="text"
                  name="part_number"
                  value={formData.part_number}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>부품명</Label>
                <Input
                  type="text"
                  name="part_name"
                  value={formData.part_name}
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