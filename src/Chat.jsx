import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

const ChatModule = () => {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    fetchSessionInfo();
  }, []);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5001/chat-history", { withCredentials: true });
        setMessages(response.data);
      } catch (error) {
        console.error("Ошибка загрузки истории чата:", error);
      }
    };
    fetchChatHistory();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get("http://localhost:5001/session-info", { withCredentials: true });
        if (!response.data.user) {
          window.location.href = "/auth";
        }
      } catch (error) {
        window.location.href = "/auth";
      }
    };
    checkSession();
  }, []);

  const fetchSessionInfo = async () => {
    try {
      const response = await axios.get("http://localhost:5001/session-info", { withCredentials: true });
      console.log("Информация о сессии:", response.data);
    } catch (error) {
      console.error("Не удалось получить информацию о сессии:", error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setNotification({ message: "Неподдерживаемый формат файла", type: "error" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setNotification({ message: "Файл слишком большой (максимум 10 МБ)", type: "error" });
      return;
    }
  
    const formData = new FormData();
    formData.append('document', file);
    setUploadedFile(file);
    setNotification({ message: "Файл загружен", type: "success" });
    try {
      const result = await axios.post("http://localhost:5001/upload-document", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
  
      const botReply = { text: result.data.request_url, sender: "bot" };
      setMessages((prev) => [...prev, botReply]);
      setNotification({ message: "Документ успешно обработан", type: "success" });
    } catch (error) {
      setNotification({ message: "Ошибка обработки документа", type: "error" });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() && !uploadedFile) {
      setNotification({ message: "Введите текст или загрузите файл.", type: "error" });
      return;
    }
  
    try {
      let textToSend = chatInput;
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('document', uploadedFile);
  
        const fileResponse = await axios.post("http://localhost:5001/upload-document", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        const botReply = { text: fileResponse.data.request_url, sender: "bot" };
        setMessages((prev) => [...prev, botReply]);
        setNotification({ message: "Документ успешно обработан", type: "success" });
        setUploadedFile(null);
        return;
      }
      if (chatInput.trim()) {
        const newMessage = { text: chatInput, sender: "user" };
        setMessages((prev) => [...prev, newMessage]);
        setChatInput("");
  
        const result = await axios.post(
          "http://localhost:5001/api-request",
          { text: chatInput },
          { withCredentials: true }
        );
  
        const botReply = { text: result.data.request_url, sender: "bot" };
        setMessages((prev) => [...prev, botReply]);
        setNotification({
          message: result.data.message,
          type: result.data.success ? "success" : "error",
        });
      }
    } catch (error) {
      setNotification({ message: "Ошибка запроса", type: "error" });
    }
  };
  

  return (
    <div className="flex w-screen h-screen bg-gray-100 overflow-hidden">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 text-black w-64 p-4 shadow-lg h-full"
          >
            <button className="w-full text-black p-2 mb-4 hover:bg-gray-700 rounded">
              Профиль
            </button>
            <div className="bg-gray-700 p-4 h-full shadow-inner rounded">
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-gray-800 text-black p-4 shadow-lg">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-black hover:bg-gray-700 p-2 rounded"
          >
            {isSidebarOpen ? "◀" : "▶"}
          </button>
        </div>
        <div className="flex-1 p-4 overflow-auto bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 ${
                msg.sender === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-black"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
              {msg.sender === "bot" ? (
                <>
                  <audio controls src={msg.text}></audio>
                </>
              ) : (
                msg.text
              )}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white p-4 border-t">
          <form onSubmit={onSubmit} className="flex">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1 p-2 border rounded-l"
            />
            <button
              type="submit"
              className="bg-blue-500 text-black p-2 rounded-r hover:bg-blue-600"
            >
              Отправить
            </button>
          </form>
          <input
            type="file"
            accept=".txt, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf"
            onChange={handleFileUpload}
            className="mt-2"
          />
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