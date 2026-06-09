import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './GoogleLoginButton.css';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const GoogleLoginButton = ({navigate}) => {
  // Googleログイン成功時の処理
  const handleSuccess = async (credentialResponse) => {
    // credentialResponse.credential にGoogleのIDトークンが入っています
    const idToken = credentialResponse.credential;

    try {
      // FastAPIの検証エンドポイントへトークンを送信
      const response = await fetch('http://localhost:8000/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: idToken }),
      });

      if (!response.ok) {
        throw new Error('バックエンドでの認証に失敗しました．');
      }

      const data = await response.json();
      
      // FastAPIから返ってきた独自のJWTを保存
      localStorage.setItem('token', data.access_token);
      // アラートの代わりに，Top画面（"/"）へ遷移させる
      navigate('/'); 

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    // clientIdにはGoogle Cloud Consoleで取得した文字列を入れます
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="googleLoginContainer">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => {
            console.log('GoogleログインのUIでエラーが発生しました．');
          }}
        />
      </div>
    </GoogleOAuthProvider>
  );
}

export default GoogleLoginButton;