import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const CreateGuestContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
`;

const CreateGuestForm = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.8rem;
  margin-top: 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: #218838;
  }
`;

const BackButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
  
  &:hover {
    background-color: #5a6268;
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
`;

const CreateGuest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.id || !formData.password) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // Firebase Authentication으로 사용자 생성
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        `${formData.id}@guest.com`, // 이메일 형식으로 변환
        formData.password
      );

      // Firestore에 추가 정보 저장
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        id: formData.id,
        role: 'guest',
        createdAt: new Date().toISOString()
      });

      alert('Guest 계정이 성공적으로 생성되었습니다.');
      navigate('/master');
    } catch (error) {
      console.error('Error creating guest account:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CreateGuestContainer>
      <BackButton onClick={() => navigate('/master')}>뒤로 가기</BackButton>
      <CreateGuestForm onSubmit={handleSubmit}>
        <h2>Guest 계정 생성</h2>
        <Input
          type="text"
          name="id"
          placeholder="Guest ID"
          value={formData.id}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit" disabled={loading}>
          {loading ? '계정 생성 중...' : '계정 생성'}
        </Button>
      </CreateGuestForm>
    </CreateGuestContainer>
  );
};

export default CreateGuest; 