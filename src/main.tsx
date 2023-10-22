import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "react-auth-kit";
import { BrowserRouter } from "react-router-dom";
import refreshApi from "./lib/refreshApi.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider
    authType="cookie"
    authName="_auth"
    cookieDomain={window.location.hostname}
    cookieSecure={window.location.protocol === "https:"}
    refresh={refreshApi}
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>,
);
