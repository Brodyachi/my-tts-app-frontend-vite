import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, Key, User, Mail } from "react-feather";
import "./App.css";

const ProfileModule = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [userData, setUserData] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/profile', { withCredentials: true });
      if (response.data.userId) {
        const userResponse = await axios.get(`/user/${response.data.userId}`, { withCredentials: true });
        setUserData(userResponse.data);
      }
    } catch (error) {
      console.error("Ошибка при получении данных пользователя:", error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ text: "Новые пароли не совпадают", type: "error" });
      return;
    }
  
    try {
      const response = await axios.post('/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      }, { withCredentials: true });
  
      setMessage({ text: response.data.message, type: "success" });
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
  
      if (response.data.logout) {
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1500);
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Ошибка при смене пароля",
        type: "error"
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleMenu = (e) => {
    window.location.href = e.target.value;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={`flex w-screen h-screen ${theme === "light" ? "bg-gray-50" : "bg-gray-900"} transition-all duration-300`}>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className={`${theme === "light" ? "bg-white" : "bg-gray-800"} w-64 p-4 shadow-lg h-full fixed z-10`}
          >
            <button
              onClick={() => setIsSidebarOpen(false)}
              className={`${theme === "light" ? "text-white" : "text-white"} p-2 hover:bg-gray-100 rounded-full duration-300`}
            >
              <X size={20} />
            </button>
            <div className="mt-4">
              <h2 className={`${theme === "light" ? "text-black" : "text-white"} text-lg font-semibold mb-4`}>Профиль</h2>
              <div className="space-y-4">
                <button
                  value="chat"
                  onClick={toggleMenu}
                  className={`${theme === "light" ? "text-white hover:bg-gray-100" : "text-white hover:bg-gray-700"} p-2 rounded-lg w-full text-left duration-300`}
                >
                  Чат
                </button>
                <button
                  value="profile"
                  onClick={toggleMenu}
                  className={`${theme === "light" ? "bg-blue-100 text-white" : "bg-blue-900 text-white"} p-2 rounded-lg w-full text-left duration-300`}
                >
                  Профиль
                </button>
                <button
                  value="edit"
                  onClick={toggleMenu}
                  className={`${theme === "light" ? "text-white hover:bg-gray-100" : "text-white hover:bg-gray-700"} p-2 rounded-lg w-full text-left duration-300`}
                >
                  Редактор запросов
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`${theme === "light" ? "bg-white" : "bg-gray-800"} p-4 shadow-md flex items-center justify-between transition-all`}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`${theme === "light" ? "text-white" : "text-white"} p-2 hover:bg-gray-100 rounded-full transition-all duration-300`}
          >
            <Menu size={24} />
          </button>
          <button
            onClick={toggleTheme}
            className={`${theme === "light" ? "text-white" : "text-white"} p-2 hover:bg-gray-100 rounded-full transition-all duration-300`}
          >
            {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
          </button>
        </div>

        <div className={`flex-1 p-6 overflow-auto transition-all ${theme === "light" ? "bg-gray-50" : "bg-gray-900"}`}>
          <div className="max-w-3xl mx-auto">
            <h2 className={`text-2xl font-bold mb-6 ${theme === "light" ? "text-gray-800" : "text-white"}`}>Профиль пользователя</h2>
            
            {userData && (
              <div className={`mb-8 p-6 rounded-lg ${theme === "light" ? "bg-white shadow" : "bg-gray-800"}`}>
                <div className="flex items-center mb-6">
                  <div className={`p-3 rounded-full mr-4 ${theme === "light" ? "bg-blue-100" : "bg-blue-900"}`}>
                    <User className={`${theme === "light" ? "text-blue-800" : "text-blue-300"}`} size={24} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-semibold ${theme === "light" ? "text-gray-800" : "text-white"}`}>{userData.login}</h3>
                    <p className={`${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>ID: {userData.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  <Mail className={`mr-3 ${theme === "light" ? "text-gray-600" : "text-gray-300"}`} size={18} />
                  <span className={`${theme === "light" ? "text-gray-800" : "text-white"}`}>{userData.email}</span>
                </div>
                
                <div className={`mt-6 pt-6 border-t ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}>
                  <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                    Зарегистрирован: {new Date(userData.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            
            <div className={`p-6 rounded-lg ${theme === "light" ? "bg-white shadow" : "bg-gray-800"}`}>
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-full mr-4 ${theme === "light" ? "bg-blue-100" : "bg-blue-900"}`}>
                  <Key className={`${theme === "light" ? "text-blue-800" : "text-blue-300"}`} size={24} />
                </div>
                <h3 className={`text-xl font-semibold ${theme === "light" ? "text-gray-800" : "text-white"}`}>Смена пароля</h3>
              </div>
              
              {message.text && (
                <div className={`mb-4 p-3 rounded ${message.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                  {message.text}
                </div>
              )}
              
              <form onSubmit={handlePasswordChange}>
                <div className="mb-4">
                  <label className={`block mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`} htmlFor="oldPassword">
                    Текущий пароль
                  </label>
                  <input
                    type="password"
                    id="oldPassword"
                    name="oldPassword"
                    value={passwordForm.oldPassword}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded border ${theme === "light" ? "bg-white border-gray-300" : "bg-gray-700 border-gray-600 text-white"}`}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className={`block mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`} htmlFor="newPassword">
                    Новый пароль
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded border ${theme === "light" ? "bg-white border-gray-300 text-black" : "bg-gray-700 border-gray-600 text-white"}`}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className={`block mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`} htmlFor="confirmPassword">
                    Подтвердите новый пароль
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded border ${theme === "light" ? "bg-white border-gray-300 text-black" : "bg-gray-700 border-gray-600 text-white"}`}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded font-medium ${theme === "light" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-700 text-white hover:bg-blue-800"} transition-colors`}
                >
                  Сменить пароль
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModule;