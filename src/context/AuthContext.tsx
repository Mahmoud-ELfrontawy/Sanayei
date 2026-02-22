import { AuthContext } from "./auth/auth.context";

// Re-export types directly from source to avoid unused import warnings
export type { User, AuthContextType, UserRole } from "./auth/auth.types";

// Re-export Context
export { AuthContext };

// Re-export hook
export { useAuth } from "../hooks/useAuth";