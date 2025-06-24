import { useState } from "react";
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from "react-feather";

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
    const response = await axios.post('https://rasa-tts-server.onrender.com/send-code', { email });
    return { success: true, message: response.data.message };
  } catch (error) {
    return { success: false, message: 'Ошибка отправки кода. Попробуйте снова.' + error };
  }
};

const AuthSwitcher = ({ theme, setTheme }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [codeIn, setCodeIn] = useState("");
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const schema = isLogin ? loginSchema : registerSchema;

  const { register, handleSubmit, formState: { errors }} = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async () => {
    if (isResetPassword) {
      await handlePasswordReset();
    } else if (isLogin) {
      await handleLogIn();
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

  const handleLogIn = async () => {
    setIsLoading(true);
    setNotification({ message: '', type: '' });
    try {
      const response = await axios.post('https://rasa-tts-server.onrender.com/log-in', {
        username,
        password,
      }, { 
        withCredentials: true,
        validateStatus: (status) => status < 500
      });

      if (response.status === 200) {
        setNotification({ message: response.data.message, type: 'success' });
        setTimeout(() => navigate('/chat'), 1000);
      } else {
        setNotification({ 
          message: response.data.message || 'Неверные учетные данные', 
          type: 'error' 
        });
      }
    } catch (error) {
      if (error.response) {
        setNotification({ 
          message: error.response.data.message || 'Ошибка входа', 
          type: 'error' 
        });
      } else if (error.request) {
        setNotification({ 
          message: 'Сервер не отвечает. Попробуйте позже.', 
          type: 'error' 
        });
      } else {
        setNotification({ 
          message: 'Ошибка при отправке запроса', 
          type: 'error' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    try {
      const result = await axios.post('https://rasa-tts-server.onrender.com/password-reset', { email });
      setNotification({ message: result.data.message, type: result.data.success ? 'success' : 'error' });
    } catch (error) {
      setNotification({ message: 'Ошибка сброса пароля. Попробуйте снова.', type: 'error' });
    }
  };
  
  const handleRegistrate = async () => {
    try {
      const result = await axios.post('https://rasa-tts-server.onrender.com/verify-code', {
        username,
        password,
        email,
        code: codeIn,
      });
      setNotification({ message: result.data.message, type: result.data.success ? 'success' : 'error' });
  
      if (result.data.success) {
        setIsLogin(true);
      }
    } catch (error) {
      setNotification({ message: 'Ошибка регистрации. Попробуйте снова.', type: 'error' });
    }
  };

  return (
    <div className={`min-h-screen min-w-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className={`bg-gray-800 fixed top-4 right-4 p-2 rounded-full shadow-lg transition-colors ${
          theme === 'light' ? 'bg-gray-800 text-white' : 'bg-gray-800 text-white'
        }`}
      >
        {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
      </button>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className={`w-full max-w-md p-8 rounded-lg shadow-2xl transition-all ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {notification.message && (
            <div className={`mb-4 px-4 py-2 rounded ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white text-center`}>
              {notification.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isResetPassword ? (
              <>
                <h2 className="text-2xl font-bold text-center">Сброс пароля</h2>
                <input
                  type="email"
                  {...register('email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Почта"
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'
                  }`}
                />
                <p className="text-red-500 text-sm">{errors.email?.message}</p>
                <button 
                  type="button" 
                  onClick={handlePasswordReset} 
                  className={`w-full py-2 rounded transition-colors ${
                    theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-800 text-white'
                  }`}
                >
                  Отправить запрос
                </button>
                <button
                  type="button"
                  onClick={() => setIsResetPassword(false)}
                  className={`w-full mt-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}
                >
                  Назад
                </button>
              </>
            ) : (
              <>
                <h2 className={`${
                    theme === 'dark' ? ' text-white' : ' text-black'
                  }  text-2xl font-bold text-center`}>{isLogin ? 'Вход' : 'Регистрация'}</h2>
                <input
                  {...register('username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Логин"
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'
                  }`}
                />
                <p className="text-red-500 text-sm">{errors.username?.message}</p>

                <input
                  type="password"
                  {...register('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Пароль"
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'
                  }`}
                />
                <p className="text-red-500 text-sm">{errors.password?.message}</p>

                {!isLogin && (
                  <>
                    <input
                      type="email"
                      {...register('email')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Почта"
                      className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'
                      }`}
                    />
                    <p className="text-red-500 text-sm">{errors.email?.message}</p>

                    <button
                      type="button"
                      onClick={handleSendCode}
                      className={`bg-gray-800 w-full py-2 rounded transition-colors ${
                        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-800 text-white'
                      }`}
                    >
                      Отправить код на почту
                    </button>

                    <input
                      {...register('code')}
                      value={codeIn}
                      onChange={(e) => setCodeIn(e.target.value)}
                      placeholder="Код"
                      className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'
                      }`}
                    />
                    <p className="text-red-500 text-sm">{errors.code?.message}</p>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2 rounded transition-colors ${
                    theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-800 text-white'
                  } text-white ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
                </button>

                <div className="flex flex-col items-center space-y-2">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className={`${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}
                  >
                    {isLogin ? 'Переключиться на Регистрацию' : 'Переключиться на Вход'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsResetPassword(true)}
                    className={`${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}
                  >
                    Сброс пароля
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthSwitcher;