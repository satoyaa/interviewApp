import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import GoogleLoginButton from '../components/GoogleLoginButton';
import './Login.css';
import '../components/Usage';
import Usage from '../components/Usage';
import { useState } from 'react';

const Login = () => {
  const navigate = useNavigate();

  const handleTraditionalLogin = () => {
    // Currently only Google Login is supported, 
    // so we could either redirect to Google login or show a message.
    console.log("Traditional login clicked");
    setIsOpen(!false);
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="login-container">
      <Helmet>
        <title>ログイン | 面接対策アプリ</title>
        <meta name="description" content="面接対策アプリへのログインはこちら．AIを活用した実践的な練習を始めましょう！" />
      </Helmet>
      <header className="login-header">
        <h1 className="login-title">面接対策アプリ</h1>
        <p className="login-subtitle">「理解する」ではなく「話せる」対策を</p>
      </header>

      <main className="login-card">
        <div className="google-login-wrapper">
          <GoogleLoginButton navigate={navigate} />
        </div>

        <p>他のログイン方法は現在作成中</p>
        <div className="spacer"></div>
        

        <button className="usage-button" onClick={handleTraditionalLogin}>
          このアプリの使い方を確認する
        </button>

        <p className="signup-text">
          アカウントをお持ちでない方は
          <Link to="/signup" className="signup-link">新規登録</Link>
        </p>
      </main>

      <footer className="login-footer">
        <a href="/terms" className="footer-link">利用規約</a>
        <span className="footer-separator">|</span>
        <a href="/privacy" className="footer-link">プライバシーポリシー</a>
      </footer>
      <Usage isOpen={isOpen} setIsOpen={setIsOpen}></Usage>
    </div>
  );
}

export default Login;
