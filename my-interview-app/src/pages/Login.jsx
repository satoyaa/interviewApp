import { useNavigate } from 'react-router-dom';

import GoogleLoginButton from '../components/GoogleLoginButton';

const Login = () => {
  const navigate = useNavigate(); // 画面遷移用のフックを取得

  const handleSuccess = async (credentialResponse) => {
    // ...前回のFastAPIへのトークン送信処理...

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      
      
      
    }
  };

  return (
    <>
    <GoogleLoginButton navigate={navigate}></GoogleLoginButton>
    </>
  );
}

export default Login;