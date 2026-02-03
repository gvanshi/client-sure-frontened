"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDeviceInfo } from "@/utils/deviceUtils";
import { LogOut, Smartphone, Monitor, Globe } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api") + "/auth";

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [view, setView] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deviceConflict, setDeviceConflict] = useState<any>(null); // Store conflict data

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Reset state when modal closes or view changes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setView("login");
        setError("");
        setSuccessMessage("");
        setEmail("");
        setPassword("");
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    setError("");
    setSuccessMessage("");
    setDeviceConflict(null);
  }, [view]);

  const handleLogoutDevice = async (sessionId: string) => {
    try {
      setIsLoading(true);
      setError(""); // Clear any previous errors

      console.log("Logging out device:", { sessionId });

      const response = await fetch(`${API_BASE}/logout-device`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to logout device");
      }

      console.log("Device logged out successfully:", data);

      // After successful logout, retry login automatically
      setDeviceConflict(null);
      handleLogin(new Event("submit") as any, true); // Retry login
    } catch (err: any) {
      console.error("Logout device error:", err);
      setError(err.message || "Failed to logout device. Please try again.");
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent, isRetry = false) => {
    if (!isRetry) e.preventDefault();
    setIsLoading(true);
    setError("");

    const deviceInfo = getDeviceInfo();

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          ...deviceInfo,
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        setDeviceConflict(data);
        setIsLoading(false);
        return;
      }

      // Handle deactivated account error
      if (
        response.status === 403 &&
        data.error?.toLowerCase().includes("deactivated")
      ) {
        throw new Error(
          "Your account has been deactivated. Please contact support at Snoowballmedia@gmail.com to resolve this issue.",
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Detect admin vs user and store tokens accordingly
      const isAdmin = data.role === "admin";

      if (isAdmin) {
        // Admin login: Store only adminToken, clear user data
        localStorage.setItem("adminToken", data.token);
        localStorage.removeItem("userToken");
        localStorage.removeItem("user");
        localStorage.removeItem("userData");
        console.log("✅ Admin token stored");

        onClose();
        router.push("/admin/dashboard");
      } else {
        // User login: Store only userToken and user data, clear admin token
        const token = data.userToken || data.token;
        if (token) {
          localStorage.setItem("userToken", token);
          console.log("✅ User token stored");
        } else {
          throw new Error("No authentication token received");
        }

        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("userData", JSON.stringify(data.user));
        }

        localStorage.removeItem("adminToken");

        onClose();
        router.push("/user/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_BASE}/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSuccessMessage("Password reset link sent to your email.");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            {/* Modal Content */}
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">
                  {view === "login" ? "Welcome Back" : "Reset Password"}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {view === "login" && !deviceConflict ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <form className="space-y-4" onSubmit={handleLogin}>
                        {error && (
                          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg">
                            {error}
                          </div>
                        )}
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1C9988] focus:border-transparent outline-none transition-all"
                            placeholder="you@example.com"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label
                              htmlFor="password"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Password
                            </label>
                            <button
                              type="button"
                              onClick={() => setView("forgot")}
                              className="text-xs text-[#1C9988] font-medium hover:underline"
                            >
                              Forgot Password?
                            </button>
                          </div>
                          <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1C9988] focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-[#1C9988] text-white font-bold py-3 rounded-lg hover:bg-[#158f7f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? "Logging in..." : "Log In"}
                        </button>
                      </form>
                    </motion.div>
                  ) : view === "login" && deviceConflict ? (
                    <motion.div
                      key="conflict"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Monitor className="w-8 h-8 text-orange-600" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">
                          Device Limit Reached
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          You are active on too many devices. <br />
                          Please log out of one to continue.
                        </p>
                      </div>

                      <div className="space-y-3 mb-6">
                        {deviceConflict.devices.map((device: any) => (
                          <div
                            key={device.sessionId}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-white p-2 rounded-lg shadow-sm">
                                {device.platform === "web" ? (
                                  <Globe className="w-5 h-5 text-blue-500" />
                                ) : (
                                  <Smartphone className="w-5 h-5 text-green-500" />
                                )}
                              </div>
                              <div className="text-left">
                                <div className="font-semibold text-gray-900">
                                  {device.deviceName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Active:{" "}
                                  {new Date(
                                    device.lastActiveAt,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                handleLogoutDevice(device.sessionId)
                              }
                              disabled={isLoading}
                              className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              Logout
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setDeviceConflict(null)}
                        className="w-full text-gray-500 text-sm font-medium hover:text-gray-800 transition-colors"
                      >
                        Cancel Login
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="forgot"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-sm text-gray-500 mb-6">
                        Enter your email address and we'll send you a link to
                        reset your password.
                      </p>
                      <form className="space-y-4" onSubmit={handleForgot}>
                        {error && (
                          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg">
                            {error}
                          </div>
                        )}
                        {successMessage && (
                          <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg">
                            {successMessage}
                          </div>
                        )}
                        <div>
                          <label
                            htmlFor="reset-email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="reset-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1C9988] focus:border-transparent outline-none transition-all"
                            placeholder="you@example.com"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-[#1C9988] text-white font-bold py-3 rounded-lg hover:bg-[#158f7f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? "Sending..." : "Send Reset Link"}
                        </button>
                      </form>
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => setView("login")}
                          className="text-sm text-gray-500 hover:text-gray-900 font-medium flex items-center justify-center gap-1 mx-auto"
                        >
                          ← Back to Login
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
