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
  font-size: 14px;
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

const LocationInfo = styled.div`
  background-color: #e3f2fd;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 4px solid #2196f3;
`;

const BranchInfo = styled.div`
  background-color: #f3e5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 4px solid #9c27b0;
`;

const SummaryInfo = styled.div`
  background-color: #e8f5e8;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 4px solid #4caf50;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #007bff;
  font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 4px solid #dc3545;
`;

const LocationButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 1rem;
  &:hover {
    background-color: #0056b3;
  }
`;

const DistanceBadge = styled.span`
  background-color: #17a2b8;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-left: 0.5rem;
`;

const SyncButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 1rem;
  &:hover {
    background-color: #218838;
  }
`;

const BluehandsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const BluehandsTableHeader = styled.th`
  background-color: #007bff;
  color: white;
  padding: 0.75rem;
  text-align: left;
  border-bottom: 2px solid #0056b3;
`;

const BluehandsTableCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #dee2e6;
`;

const BluehandsSection = styled.div`
  margin-top: 2rem;
`;

const BluehandsTitle = styled.h3`
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;
`;

function Guest() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [branchInfo, setBranchInfo] = useState(null);
  const [summaryInfo, setSummaryInfo] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [bluehandsData, setBluehandsData] = useState([]);
  const [isLoadingBluehands, setIsLoadingBluehands] = useState(false);

  useEffect(() => {
    initializeLocation();
    // 로그인 시 즉시 현재 위치 조회
    autoGetCurrentLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. IP 기반 위치 감지
      let location = await detectLocationByIP();
      
      // 2. 위치 감지 실패 시 기본값 설정
      if (!location) {
        location = {
          city: '서울특별시',
          region: '서울특별시',
          district: '강남구'
        };
      }

      setUserLocation(location);
      
      // 3. 위치 기반 재고 조회
      await fetchInventoryByLocation(location);
      
    } catch (error) {
      console.error('위치 초기화 오류:', error);
      setError('위치를 확인하는 중 오류가 발생했습니다.');
      // 기본 위치로 재고 조회
      await fetchInventoryByLocation({ city: '서울특별시' });
    } finally {
      setLoading(false);
    }
  };

  const autoGetCurrentLocation = async () => {
    try {
      console.log('자동 위치 조회 시작');
      const coords = await getCurrentLocation();
      
      // GPS 좌표를 주소로 변환
      const address = await getAddressFromCoordinates(coords.latitude, coords.longitude);
      console.log('변환된 주소:', address);
      
      const newLocation = {
        city: '서울특별시',
        region: '서울특별시',
        district: '강남구',
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: address // 변환된 주소 추가
      };
      
      setUserLocation(newLocation);
      console.log('자동 위치 설정 완료:', newLocation);
      
      // 위치 기반 재고 조회
      await fetchInventoryByLocation(newLocation);
      
      // 블루핸즈 데이터도 함께 조회
      await fetchBluehandsData(coords.latitude, coords.longitude);
      
    } catch (error) {
      console.error('자동 위치 조회 실패:', error);
      // 자동 조회 실패 시 기본 위치로 초기화
      initializeLocation();
    }
  };

  const detectLocationByIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        city: data.city || '서울특별시',
        region: data.region || '서울특별시',
        district: data.region_code || '강남구',
        country: data.country || 'KR',
        latitude: data.latitude,
        longitude: data.longitude
      };
    } catch (error) {
      console.error('IP 기반 위치 감지 실패:', error);
      return null;
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation이 지원되지 않습니다.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true);
      const coords = await getCurrentLocation();
      
      // GPS 좌표를 주소로 변환
      const address = await getAddressFromCoordinates(coords.latitude, coords.longitude);
      console.log('수동 위치 조회 - 변환된 주소:', address);
      
      const newLocation = {
        ...userLocation,
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: address
      };
      
      setUserLocation(newLocation);
      await fetchInventoryByLocation(newLocation);
      
      // 블루핸즈 데이터도 함께 조회
      await fetchBluehandsData(coords.latitude, coords.longitude);
      
    } catch (error) {
      console.error('현재 위치 감지 오류:', error);
      setError('현재 위치를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncBluehands = async () => {
    try {
      setSyncing(true);
      const response = await axios.post('http://localhost:5000/api/sync/bluehands');
      
      if (response.data.success) {
        alert(`동기화 완료! ${response.data.count}개의 지점이 동기화되었습니다.`);
        // 동기화 후 데이터 새로고침
        await fetchInventoryByLocation(userLocation);
      } else {
        setError('동기화에 실패했습니다.');
      }
    } catch (error) {
      console.error('동기화 오류:', error);
      setError('동기화 중 오류가 발생했습니다.');
    } finally {
      setSyncing(false);
    }
  };

  const fetchInventoryByLocation = async (location) => {
    try {
      const params = new URLSearchParams();
      if (location.district) params.append('district', location.district);
      if (location.city) params.append('city', location.city);
      if (location.region) params.append('region', location.region);
      if (location.latitude) params.append('latitude', location.latitude);
      if (location.longitude) params.append('longitude', location.longitude);

      const response = await axios.get(`http://localhost:5000/api/guest/inventory?${params}`);
      
      setInventory(response.data.data);
      setLocationInfo(response.data.location);
      setBranchInfo(response.data.branches);
      setSummaryInfo(response.data.summary);
      setLastSync(new Date().toLocaleString());
      
    } catch (error) {
      console.error('재고 조회 오류:', error);
      setError('재고 정보를 가져오는데 실패했습니다.');
    }
  };

  const fetchBluehandsData = async (latitude, longitude) => {
    setIsLoadingBluehands(true);
    try {
      console.log('블루핸즈 데이터 조회 시작:', { latitude, longitude });
      
      const response = await axios.get(`http://localhost:5000/api/inventory/bluehands`, {
        params: {
          latitude: latitude,
          longitude: longitude
        }
      });
      
      console.log('블루핸즈 API 응답:', response.data);
      
      if (response.data.success) {
        setBluehandsData(response.data.data);
        console.log('설정된 블루핸즈 데이터:', response.data.data);
        console.log('디버그 정보:', response.data.debug);
        
        if (response.data.count === 0) {
          console.log('반경 3KM 내 블루핸즈 지점이 없습니다.');
          console.log('현재 위치:', { latitude, longitude });
          console.log('데이터베이스 내 총 블루핸즈 지점 수:', response.data.debug?.totalBluehandsInDB);
        }
      }
    } catch (error) {
      console.error('블루핸즈 데이터 조회 오류:', error);
      console.error('오류 상세:', error.response?.data || error.message);
      setBluehandsData([]);
    } finally {
      setIsLoadingBluehands(false);
    }
  };

  const getClassificationText = (classification) => {
    switch (classification) {
      case 1:
        return '전문블루핸즈';
      case 2:
        return '종합블루핸즈';
      case 3:
        return '하이테크센터';
      default:
        return '기타';
    }
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      console.log('주소 변환 시작:', { latitude, longitude });
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&accept-language=ko&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error(`API 응답 오류: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('전체 주소 데이터:', data);
      
      if (!data.display_name) {
        return '주소를 찾을 수 없습니다.';
      }
      
      let koreanAddress = '';
      
      // 방법 1: address 객체에서 직접 추출
      if (data.address) {
        const addr = data.address;
        const state = addr.state || addr.province; // 시/도
        const district = addr.district || addr.suburb; // 구
        const neighbourhood = addr.neighbourhood || addr.quarter; // 동
        
        const components = [];
        if (state) components.push(state);
        if (district) components.push(district);
        if (neighbourhood) components.push(neighbourhood);
        
        if (components.length > 0) {
          koreanAddress = components.join(' ');
        }
      }
      
      // 방법 2: display_name에서 파싱
      if (!koreanAddress || koreanAddress.trim() === '') {
        const addressParts = data.display_name.split(', ');
        let foundCity = false;
        let foundDistrict = false;
        let foundNeighbourhood = false;
        const components = [];
        
        for (let i = 0; i < addressParts.length; i++) {
          const part = addressParts[i].trim();
          
          // 시/도 찾기
          if (!foundCity && (part.includes('서울') || part.includes('부산') || part.includes('대구') || 
              part.includes('인천') || part.includes('광주') || part.includes('대전') || 
              part.includes('울산') || part.includes('세종'))) {
            components.push(part);
            foundCity = true;
          }
          
          // 구 찾기
          if (foundCity && !foundDistrict && (part.includes('구') || part.includes('군'))) {
            components.push(part);
            foundDistrict = true;
          }
          
          // 동 찾기
          if (foundDistrict && !foundNeighbourhood && (part.includes('동') || part.includes('읍') || part.includes('면'))) {
            components.push(part);
            foundNeighbourhood = true;
            break;
          }
        }
        
        if (components.length > 0) {
          koreanAddress = components.join(' ');
        }
      }
      
      // 최종적으로 불필요한 요소 제거
      if (koreanAddress) {
        const parts = koreanAddress.split(' ');
        const filteredParts = parts.filter(part => 
          !part.includes('리') && !part.includes('가') && !part.includes('로') &&
          !part.includes('길') && !part.includes('번지') && !part.includes('대한민국')
        );
        koreanAddress = filteredParts.join(' ');
      }
      
      return koreanAddress || '주소를 찾을 수 없습니다.';
    } catch (error) {
      console.error('주소 변환 오류:', error);
      return '주소를 찾을 수 없습니다.';
    }
  };

  const formatLocationDisplay = (location) => {
    if (!location) return 'guest로 로그인 중입니다';
    
    // 변환된 주소가 있는 경우 우선 사용
    if (location.address && location.address !== '주소를 찾을 수 없습니다.') {
      return `${location.address}에서 접속 중`;
    }
    
    // GPS 좌표가 있는 경우 주소로 변환 중
    if (location.latitude && location.longitude) {
      return '위치 확인 중...';
    }
    
    // city와 district가 있는 경우
    if (location.city && location.district) {
      return `${location.city} ${location.district}에서 접속 중`;
    }
    
    // city만 있는 경우
    if (location.city) {
      return `${location.city}에서 접속 중`;
    }
    
    return 'guest로 로그인 중입니다';
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <GuestContainer>
      <Header>
        <img src={process.env.PUBLIC_URL + '/image1-removebg-preview.png'} alt="현대자동차그룹 로고" style={{ height: '60px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LoginStatus>
            {formatLocationDisplay(userLocation)}
          </LoginStatus>
          <LocationButton onClick={handleGetCurrentLocation}>
            현재 위치로 조회
          </LocationButton>
          <SyncButton onClick={handleSyncBluehands} disabled={syncing}>
            {syncing ? '동기화 중...' : '데이터 동기화'}
          </SyncButton>
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        </div>
      </Header>
      
      <Content>
        <h2>재고 현황</h2>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {loading ? (
          <LoadingSpinner>위치를 확인하고 재고를 불러오는 중...</LoadingSpinner>
        ) : (
          <>
            {locationInfo && (
              <LocationInfo>
                <strong>📍 현재 위치:</strong> {locationInfo.city} {locationInfo.district}
                {locationInfo.latitude && locationInfo.longitude && (
                  <span style={{ marginLeft: '1rem', color: '#666' }}>
                    (위도: {locationInfo.latitude}, 경도: {locationInfo.longitude})
                  </span>
                )}
              </LocationInfo>
            )}
            
            {branchInfo && branchInfo.length > 0 && (
              <BranchInfo>
                <strong>🏢 조회된 지점:</strong> {branchInfo.length}개
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  {branchInfo.map((branch, index) => (
                    <span key={branch.code} style={{ marginRight: '1rem' }}>
                      {branch.name}
                      {branch.distance && (
                        <DistanceBadge>{branch.distance}</DistanceBadge>
                      )}
                    </span>
                  ))}
                </div>
              </BranchInfo>
            )}
            
            {summaryInfo && (
              <SummaryInfo>
                <div>
                  <strong>📊 요약 정보:</strong>
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <span>지점 수: {summaryInfo.totalBranches}개</span>
                  <span>품목 수: {summaryInfo.totalItems}개</span>
                  <span>총 수량: {summaryInfo.totalQuantity}개</span>
                </div>
              </SummaryInfo>
            )}
            
            <InventoryTable>
              <thead>
                <tr>
                  <TableHeader>파트명</TableHeader>
                  <TableHeader>수량</TableHeader>
                  <TableHeader>지점위치</TableHeader>
                  <TableHeader>등록일자</TableHeader>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <TableCell>{item.part_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                  </tr>
                ))}
              </tbody>
            </InventoryTable>
            
            {inventory.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                해당 지역의 재고 정보가 없습니다.
              </div>
            )}
            
            {/* 블루핸즈 데이터 섹션 */}
            {locationInfo && (
              <BluehandsSection>
                <BluehandsTitle>
                  🏢 반경 3KM 내 블루핸즈 지점
                  {isLoadingBluehands && <span style={{ fontSize: '14px', color: '#007bff' }}>(조회 중...)</span>}
                </BluehandsTitle>
                
                {bluehandsData.length > 0 ? (
                  <BluehandsTable>
                    <thead>
                      <tr>
                        <BluehandsTableHeader>지점명</BluehandsTableHeader>
                        <BluehandsTableHeader>주소</BluehandsTableHeader>
                        <BluehandsTableHeader>전화번호</BluehandsTableHeader>
                        <BluehandsTableHeader>분류</BluehandsTableHeader>
                        <BluehandsTableHeader>거리</BluehandsTableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {bluehandsData.map((item) => (
                        <tr key={item.id}>
                          <BluehandsTableCell>{item.name}</BluehandsTableCell>
                          <BluehandsTableCell>{item.address}</BluehandsTableCell>
                          <BluehandsTableCell>{item.phone_number}</BluehandsTableCell>
                          <BluehandsTableCell>{getClassificationText(item.classification)}</BluehandsTableCell>
                          <BluehandsTableCell>{item.distance.toFixed(2)}km</BluehandsTableCell>
                        </tr>
                      ))}
                    </tbody>
                  </BluehandsTable>
                ) : (
                  !isLoadingBluehands && (
                    <NoDataMessage>
                      반경 3KM 내에 블루핸즈 지점이 없습니다.
                    </NoDataMessage>
                  )
                )}
              </BluehandsSection>
            )}
            
            {lastSync && (
              <LastSyncTime>
                마지막 업데이트: {lastSync}
              </LastSyncTime>
            )}
          </>
        )}
      </Content>
    </GuestContainer>
  );
}

export default Guest; 