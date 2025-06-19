require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createNewMasterAccount() {
  try {
    const email = 'olyn@master.com';
    const password = '096000';
    
    console.log('새로운 마스터 계정 생성 중...');
    console.log('이메일:', email);
    console.log('비밀번호:', password);
    
    // Firebase Authentication으로 사용자 생성
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Firestore에 추가 정보 저장
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      id: 'olyn',
      role: 'master',
      createdAt: new Date().toISOString()
    });
    
    console.log('✅ 마스터 계정이 성공적으로 생성되었습니다!');
    console.log('사용자 UID:', userCredential.user.uid);
    console.log('\n=== 로그인 정보 ===');
    console.log('ID: olyn');
    console.log('비밀번호: 096000');
    console.log('이제 로그인할 수 있습니다.');
    
  } catch (error) {
    console.error('❌ 계정 생성 실패:', error.message);
    if (error.code === 'auth/email-already-in-use') {
      console.log('이미 존재하는 계정입니다. 비밀번호를 재설정해보세요.');
    }
  }
}

createNewMasterAccount(); 