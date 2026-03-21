import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./router";
import { AuthProvider } from "./providers/AuthProvider";

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRouter />
            </AuthProvider>
        </BrowserRouter>
    );
}
