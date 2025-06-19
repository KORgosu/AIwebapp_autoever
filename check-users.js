require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function checkUsers() {
  try {
    console.log('Firebase에 등록된 사용자 확인 중...');
    
    // Firestore에서 사용자 정보 확인
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log('\n=== Firestore 사용자 목록 ===');
    usersSnapshot.forEach((doc) => {
      console.log('사용자 ID:', doc.id);
      console.log('사용자 데이터:', doc.data());
      console.log('---');
    });
    
    // 테스트 로그인 시도
    console.log('\n=== 로그인 테스트 ===');
    const testEmails = [
      'olyn@master.com',
      'olyn@guest.com',
      'olyn0960@guest.com'
    ];
    
    for (const email of testEmails) {
      try {
        console.log(`\n${email}로 로그인 시도 중...`);
        await signInWithEmailAndPassword(auth, email, '096000');
        console.log(`✅ ${email} 로그인 성공!`);
        break;
      } catch (error) {
        console.log(`❌ ${email} 로그인 실패:`, error.code);
      }
    }
    
  } catch (error) {
    console.error('오류:', error);
  }
}

checkUsers(); 