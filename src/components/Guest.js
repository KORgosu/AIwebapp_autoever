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

function Guest() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

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
    <GuestContainer>
      <Header>
        <img src={process.env.PUBLIC_URL + '/image1-removebg-preview.png'} alt="현대자동차그룹 로고" style={{ height: '60px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LoginStatus>guest로 로그인 중입니다</LoginStatus>
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        </div>
      </Header>
      <Content>
        <h2>재고 현황</h2>
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