import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { store } from "./redux/store.js";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { VirtualTryOnProvider } from "./context/VirtualTryOnContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <VirtualTryOnProvider>
  <Provider store={store}>
    <App />
    <Toaster />
  </Provider>
  </VirtualTryOnProvider>
);