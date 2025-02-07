import { useState } from "react";
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import "./App.css";
import axios from 'axios';

const loginSchema = yup.object().shape({
  username: yup.string().required('Логин обязателен'),
  password: yup.string().required('Пароль обязателен').min(6, 'Минимум 6 символов'),
});

const registerSchema = yup.object().shape({
  username: yup.string().required('Логин обязателен'),
  password: yup.string().required('Пароль обязателен').min(6, 'Минимум 6 символов'),
  email: yup.string().email('Неверный формат почты').required('Почта обязательна'),
  code: yup.string().required('Код обязателен'),
});

const sendCodeToEmail = async (email) => {
  try {
    const response = await axios.post('http://localhost:5001/send-code', { email });
    return { success: true, message: response.data.message };
  } catch (error) {
    return { success: false, message: 'Ошибка отправки кода. Попробуйте снова.' + error };
  }
};


const AuthSwitcher = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [codeIn, setCodeIn] = useState("");
  const [notification, setNotification] = useState({ message: '', type: '' });
  const schema = isLogin ? loginSchema : registerSchema;

  const { register, handleSubmit, formState: { errors }} = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async () => {
    if (isLogin) {
      await handleLogIn();
      // window.location.href = "/chat";
    } else {
      await handleRegistrate();
    }
  };

  const handleSendCode = async () => {
    if (!email) {
      setNotification({ message: 'Пожалуйста, введите почту.', type: 'error' });
      return;
    }
  
    const result = await sendCodeToEmail(email);
    setNotification({ message: result.message, type: result.success ? 'success' : 'error' });
  };

  const handleRegistrate = async () => {
    try {
      const result = await axios.post('http://localhost:5001/verify-code', {
        username,
        password,
        email,
        code: codeIn,
      });
  
      setNotification({ message: result.data.message, type: result.data.success ? 'success' : 'error' });
    } catch (error) {
      setNotification({ message: 'Ошибка регистрации. Попробуйте снова.', type: 'error' });
    }
  };

  const handleLogIn = async () => {
    try {
      const result = await axios.post('http://localhost:5001/log-in', {
        username,
        password,
      });

      if (result.data.success) {
        setNotification({ message: result.data.message, type: 'success' });
        await fetchSessionInfo();
      } else {
        setNotification({ message: result.data.message, type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Ошибка входа. Попробуйте снова.', type: 'error' });
    }
};

const fetchSessionInfo = async () => {
    try {
      const response = await axios.get('http://localhost:5001/session-info', { withCredentials: true });
      console.log('Информация о сессии:', response.data);
    } catch (error) {
      console.error('Не удалось получить информацию о сессии:', error);
    }
};

  return (
    <div>
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <div>
          <label>Логин</label>
          <input {...register('username')} value={username} onChange={(e) => setUsername(e.target.value)}  />
          <p>{errors.username?.message}</p>
        </div>
        <div>
          <label>Пароль</label>
          <input type="password"  {...register('password')} value={password} onChange={(e) => setPassword(e.target.value)}/>
          <p>{errors.password?.message}</p>
        </div>
        {!isLogin && (
          <>
            <div>
              <label>Почта</label>
              <input 
                type="email" 
                {...register('email')} 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <p>{errors.email?.message}</p>
            </div>
            <button type="button" onClick={handleSendCode}>
              Отправить код на почту
            </button>

            <div>
              <label>Код</label>
              <input {...register('code')} value={codeIn} onChange={(e) => setCodeIn(e.target.value)}/>
              <p>{errors.code?.message}</p>
            </div>
          </>
        )}

        <button type="submit">{isLogin ? 'Войти' : 'Зарегистрироваться'}</button> <br></br>
        <button type="button" className="authSwitcher" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Переключиться на Регистрацию' : 'Переключиться на Вход'}
      </button>
      </form>
    </div>
  );
};

export default AuthSwitcher;
