import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
`;

const Banner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  padding: 1rem 2rem;
  background-color: #002C5F;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const LoginForm = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 300px;
  margin-top: 2rem;
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
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  box-sizing: border-box;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
`;

const Login = () => {
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
    setLoading(true);

    try {
      // 마스터 계정 확인
      if (formData.id === 'olyn' && formData.password === '0960') {
        navigate('/master');
        return;
      }

      // Guest 계정 로그인
      const userCredential = await signInWithEmailAndPassword(
        auth,
        `${formData.id}@guest.com`,
        formData.password
      );

      // 사용자 역할 확인
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();

      if (userData.role === 'guest') {
        navigate('/guest');
      } else {
        setError('접근 권한이 없습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <Banner>현대자동차 통합 재고관리 데이터베이스</Banner>
      <LoginForm onSubmit={handleSubmit}>
        <h2>로그인</h2>
        <Input
          type="text"
          name="id"
          placeholder="아이디"
          value={formData.id}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <Input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </Button>
      </LoginForm>
    </LoginContainer>
  );
};

export default Login; 