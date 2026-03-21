import { useContext } from "react";
import { AuthContext } from "@/app/providers/AuthProvider";

/**
 * Consumes the AuthContext.
 * Throws if called outside of an <AuthProvider> tree.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error(
            "useAuth doit être utilisé à l'intérieur d'un <AuthProvider>.",
        );
    }
    return context;
}
