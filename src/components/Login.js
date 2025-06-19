import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const LoginContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const LeftSection = styled.div`
  flex: 6.5;
  background: url('/hyundai-background.jpg') center/cover no-repeat;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3));
  }
`;

const RightSection = styled.div`
  flex: 3.5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  background-color: #f5f5f5;
`;

const LoginBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.img`
  width: 150px;
  margin-top: 2rem;
  object-fit: contain;
`;

const Title = styled.h1`
  color: #002C5F;
  margin-bottom: 2rem;
  font-size: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #002C5F;
  }
`;

const Button = styled.button`
  padding: 0.8rem;
  background-color: #002C5F;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #001F4D;
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  margin-top: 1rem;
`;

const TopBanner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: #002C5F;
  color: white;
  padding: 1rem;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/master');
    } catch (error) {
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
  };

  return (
    <LoginContainer>
      <TopBanner>현대자동차 통합 재고 관리 데이터베이스</TopBanner>
      <LeftSection />
      <RightSection>
        <LoginBox>
          <Title>재고관리 시스템 로그인</Title>
          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit">로그인</Button>
          </Form>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Logo src="/hyundai-logo.png" alt="현대자동차 로고" />
        </LoginBox>
      </RightSection>
    </LoginContainer>
  );
};

export default Login; 