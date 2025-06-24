import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, Upload, Send } from "react-feather";
import "./App.css";
import { useNavigate } from "react-router-dom";

const ChatModule = ({ theme, setTheme }) => {
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    const container = chatContainerRef.current;
    container.scrollTop = container.scrollHeight;
  };

  const [ttsSettings, setTtsSettings] = useState({
    voice: "oksana",
    emotion: "neutral",
    speed: 1.0,
    format: "oggopus",
  });

  useEffect(() => {
    fetchSessionInfo();
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSessionInfo = async () => {
    try {
      const response = await axios.get("https://rasa-tts-server.onrender.com/session-info", {
        withCredentials: true,
      });
      console.log("Информация о сессии:", response.data);
    } catch (error) {
      console.error("Не удалось получить информацию о сессии:", error);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get("https://rasa-tts-server.onrender.com/chat-history", {
        withCredentials: true,
      });
      setMessages(response.data);
      console.log(messages);
    } catch (error) {
      console.error("Ошибка загрузки истории чата:", error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = null;
    const allowedTypes = [
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setNotification({ message: "Неподдерживаемый формат файла", type: "error" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setNotification({ message: "Файл слишком большой (максимум 10 МБ)", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("document", file);
    formData.append("ttsSettings", JSON.stringify(ttsSettings));
    setUploadedFile(file);
    setNotification({ message: "Файл загружен", type: "success" });

    try {
      setIsLoading(true);
      const userMessage = { text: "Файл", sender: "user" };
      setMessages((prev) => [...prev, userMessage]);

      const loadingMessage = { text: "loading", sender: "bot", isLoading: true };
      setMessages((prev) => [...prev, loadingMessage]);

      const result = await axios.post(
        "https://rasa-tts-server.onrender.com/upload-document",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setMessages(prev => prev.filter(msg => !msg.isLoading));
      const botReply = { text: result.data.request_url, sender: "bot" };
      setMessages((prev) => [...prev, botReply]);
      setNotification({ message: "Документ успешно обработан", type: "success" });
    } catch (error) {
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      setNotification({ message: "Ошибка обработки документа", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) {
      setNotification({ message: "Введите текст или загрузите файл.", type: "error" });
      return;
    }
    try {
      if (chatInput.trim()) {
        const newMessage = { text: chatInput, sender: "user" };
        setMessages((prev) => [...prev, newMessage]);
        setChatInput("");

        setIsLoading(true);

        const loadingMessage = { text: "loading", sender: "bot", isLoading: true };
        setMessages((prev) => [...prev, loadingMessage]);

        const result = await axios.post(
          "https://rasa-tts-server.onrender.com/api-request",
          { text: chatInput, ttsSettings },
          { withCredentials: true }
        );

        setMessages(prev => prev.filter(msg => !msg.isLoading));
        const botReply = { text: result.data.request_url, sender: "bot" };
        setMessages((prev) => [...prev, botReply]);
        setNotification({
          message: result.data.message,
          type: result.data.success ? "success" : "error",
        });
      }
    } catch (error) {
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      setNotification({ message: "Ошибка запроса", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTtsSettingChange = (setting, value) => {
    setTtsSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleMenu = (e) => {
    navigate(`/${e.target.value}`, { replace: true });
  };

  return (
    <div className={`flex w-screen h-screen ${theme === "light" ? "bg-gray-50 text-gray-900" : "bg-gray-900 text-gray-100"} transition-all duration-300`}>
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
              className={`${theme === "light" ? "text-gray-800 hover:bg-gray-100" : "text-gray-200 hover:bg-gray-700"} p-2 rounded-full transition-colors`}
            >
              <X size={20} />
            </button>
            <div className="mt-4">
              <h2 className={`${theme === "light" ? "text-gray-800" : "text-white"} text-lg font-semibold mb-4`}>Чат</h2>
              <div className="space-y-4">
                <button
                  value="chat"
                  onClick={toggleMenu}
                  className={`${theme === "light" ? "text-gray-800 hover:bg-gray-100" : "text-gray-200 hover:bg-gray-700"} p-2 rounded-lg w-full text-left transition-colors`}
                >
                  Чат
                </button>
                <button
                  value="profile"
                  onClick={toggleMenu}
                  className={`${theme === "light" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-blue-900 text-blue-100 hover:bg-blue-800"} p-2 rounded-lg w-full text-left transition-colors`}
                >
                  Профиль
                </button>
              </div>
              <div className="space-y-4 mt-4">
                <div>
                  <label className={`${theme === "light" ? "text-gray-700" : "text-gray-300"} text-sm`}>Голос</label>
                  <select
                    className={`w-full ${theme === "light" ? "bg-gray-100 text-gray-800 border-gray-200" : "bg-gray-700 text-gray-200 border-gray-600"} p-2 rounded mt-1 border`}
                    value={ttsSettings.voice}
                    onChange={(e) => handleTtsSettingChange("voice", e.target.value)}
                  >
                    <option value="oksana">Оксана</option>
                    <option value="jane">Джейн</option>
                    <option value="ermil">Ермил</option>
                    <option value="zahar">Захар</option>
                  </select>
                </div>

                <div>
                  <label className={`${theme === "light" ? "text-gray-700" : "text-gray-300"} text-sm`}>Скорость</label>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={ttsSettings.speed}
                    onChange={(e) => handleTtsSettingChange("speed", parseFloat(e.target.value))}
                    className={`w-full ${theme === "light" ? "bg-gray-100 accent-blue-500" : "bg-gray-700 accent-blue-400"}`}
                  />
                  <span className={`${theme === "light" ? "text-gray-800" : "text-gray-300"} text-sm`}>{ttsSettings.speed}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`${theme === "light" ? "bg-white border-gray-200" : "bg-gray-800 border-gray-700"} p-4 border-b flex items-center justify-between`}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`${theme === "light" ? "text-gray-800 hover:bg-gray-100" : "text-gray-200 hover:bg-gray-700"} p-2 rounded-full transition-colors`}
          >
            <Menu size={24} />
          </button>
          <button
            onClick={toggleTheme}
            className={`${theme === "light" ? "text-gray-800 hover:bg-gray-100" : "text-gray-200 hover:bg-gray-700"} p-2 rounded-full transition-colors`}
          >
            {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
          </button>
        </div>

        <div
          className={`flex-1 p-4 overflow-auto ${theme === "light" ? "bg-gray-50" : "bg-gray-900"}`}
          onClick={() => setIsSidebarOpen(false)}
          ref={chatContainerRef}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 ${msg.sender === "user" ? "text-right" : "text-left"}`}
            >
              <div
                className={`inline-block p-3 rounded-lg max-w-xs md:max-w-md lg:max-w-lg ${
                  msg.sender === "user"
                    ? `${theme === "light" ? "bg-blue-500 text-white" : "bg-blue-600 text-white"}`
                    : `${theme === "light" ? "bg-gray-200 text-gray-800" : "bg-gray-700 text-gray-200"}`
                }`}
              >
                {msg.sender === "bot" ? (
                  <>
                    {msg.isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${theme === "light" ? "border-gray-600" : "border-gray-300"}`}></div>
                        <span className="ml-2">Обработка...</span>
                      </div>
                    ) : (
                      <audio controls src={msg.text} className="w-full"></audio>
                    )}
                  </>
                ) : (
                  msg.file ? `Файл: ${msg.text}` : msg.text
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={`${theme === "light" ? "bg-white border-gray-200" : "bg-gray-800 border-gray-700"} p-4 border-t`}>
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Введите сообщение..."
              className={`flex-1 p-2 ${theme === "light" ? "bg-gray-100 text-gray-800 border-gray-200" : "bg-gray-700 text-gray-200 border-gray-600"} rounded-lg border focus:outline-none focus:ring-2 ${theme === "light" ? "focus:ring-blue-300" : "focus:ring-blue-500"}`}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`${theme === "light" ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"} p-2 rounded-lg transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Send size={20} />
            </button>
          </form>
          <label className={`${theme === "light" ? "text-gray-800" : "text-gray-200"} mt-2 flex items-center gap-2 cursor-pointer`}>
            <Upload size={20} />
            <input
              type="file"
              accept=".txt, .docx, .pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            Загрузить файл
          </label>
          {notification.message && (
            <div
              className={`mt-2 text-sm ${
                notification.type === "success" ? "text-green-500" : "text-red-500"
              }`}
            >
              {notification.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatModule;