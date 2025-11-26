import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { LanguageProvider } from "./utils/LanguageContext"

const CONTAINER_ID = "root"
let container = document.getElementById(CONTAINER_ID)
if (!container) {
  container = document.createElement("div")
  container.id = CONTAINER_ID
  document.body.appendChild(container)
}

ReactDOM.createRoot(container as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
)
