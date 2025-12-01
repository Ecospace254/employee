import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useMutation } from "@tanstack/react-query";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    // Use the centralized theme context - no local state needed!
    const { theme, toggleTheme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<"appearance" | "security" | "password">("appearance");
    const isDarkMode = theme === 'dark';

    // Password change form state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    // Forgot password form state
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");

    // Change password mutation
    const changePasswordMutation = useMutation({
        mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to change password");
            }
            return res.json();
        },
        onSuccess: () => {
            setPasswordSuccess("Password changed successfully!");
            setPasswordError("");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        },
        onError: (error: Error) => {
            setPasswordError(error.message);
            setPasswordSuccess("");
        },
    });

    // Forgot password mutation
    const forgotPasswordMutation = useMutation({
        mutationFn: async (email: string) => {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to send reset email");
            }
            return res.json();
        },
        onSuccess: (data) => {
            setForgotPasswordMessage(data.message);
            setForgotEmail("");
        },
        onError: (error: Error) => {
            setForgotPasswordMessage(error.message);
        },
    });

    // Handle password change form submission
    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        // Validate password length
        if (newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters long");
            return;
        }

        // Submit change password request
        changePasswordMutation.mutate({ currentPassword, newPassword });
    };

    // Handle forgot password form submission
    const handleForgotPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setForgotPasswordMessage("");
        
        if (!forgotEmail) {
            setForgotPasswordMessage("Please enter your email address");
            return;
        }

        forgotPasswordMutation.mutate(forgotEmail);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col bg-blue-50 dark:bg-slate-900 rounded-md p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="dark:text-white">
                        <Settings className="inline w-5 h-5 mr-2 mb-1" />
                        Settings
                    </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-3">
                    <aside className="col-span-1 overflow-y-auto pr-4">
                        {/* Tab Navigation */}
                        <div className="flex flex-col">
                            <button
                                className={`p-2 text-left rounded-2xl ${activeTab === "appearance" ? "bg-blue-500 text-white" : "text-gray-700"}`}
                                onClick={() => setActiveTab("appearance")}
                            >
                                Appearance
                            </button>
                            <button
                                className={`p-2 text-left rounded-2xl ${activeTab === "security" ? "bg-blue-500 text-white" : "text-gray-700"}`}
                                onClick={() => setActiveTab("security")}
                            >
                                Security
                            </button>
                            <button
                                className={`p-2 text-left rounded-2xl ${activeTab === "password" ? "bg-blue-500 text-white" : "text-gray-700"}`}
                                onClick={() => setActiveTab("password")}
                            >
                                Password
                            </button>
                        </div>
                    </aside>
                    <div className="col-span-2">
                        {/* Tab Content */}
                        {activeTab === "appearance" && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="color-scheme" className="block text-sm font-medium dark:text-white mb-2">
                                        Color Scheme
                                    </Label>
                                    <Select value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark')}>
                                        <SelectTrigger className="w-full bg-white dark:bg-slate-800 dark:text-white dark:border-slate-600">
                                            <SelectValue placeholder="Select theme" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-800 dark:border-slate-700">
                                            <SelectItem value="light" className="dark:text-white dark:hover:bg-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <Sun className="w-4 h-4 text-yellow-600" />
                                                    <span>Light</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="dark" className="dark:text-white dark:hover:bg-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <Moon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    <span>Dark</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Choose your preferred color scheme for the interface
                                    </p>
                                </div>
                            </div>
                        )}
                        {/* {activeTab === "security" && (
                            <div>
                                <Label htmlFor="two-factor-auth" className="block text-sm font-medium dark:text-white">
                                    Two-Factor Authentication
                                </Label>
                                <Switch
                                    id="two-factor-auth"
                                    checked={false}
                                    onCheckedChange={() => {}}
                                    aria-label="Toggle two-factor authentication"
                                />
                            </div>
                        )} */}
                        {activeTab === "password" && (
                            <div className="space-y-4">
                                {!forgotPasswordMode ? (
                                    // CHANGE PASSWORD FORM
                                    <form onSubmit={handleChangePassword} className="space-y-4">
                                        <h3 className="text-lg font-semibold dark:text-white">Change Password</h3>
                                        
                                        {/* Current Password */}
                                        <div>
                                            <Label htmlFor="current-password" className="dark:text-gray-200">
                                                Current Password
                                            </Label>
                                            <Input
                                                id="current-password"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="mt-1 dark:bg-slate-800 dark:text-white dark:border-slate-600"
                                                required
                                            />
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <Label htmlFor="new-password" className="dark:text-gray-200">
                                                New Password
                                            </Label>
                                            <Input
                                                id="new-password"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="mt-1 dark:bg-slate-800 dark:text-white dark:border-slate-600"
                                                required
                                                minLength={8}
                                            />
                                        </div>

                                        {/* Confirm New Password */}
                                        <div>
                                            <Label htmlFor="confirm-password" className="dark:text-gray-200">
                                                Confirm New Password
                                            </Label>
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="mt-1 dark:bg-slate-800 dark:text-white dark:border-slate-600"
                                                required
                                                minLength={8}
                                            />
                                        </div>

                                        {/* Error/Success Messages */}
                                        {passwordError && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                                        )}
                                        {passwordSuccess && (
                                            <p className="text-sm text-green-600 dark:text-green-400">{passwordSuccess}</p>
                                        )}

                                        {/* Submit Button */}
                                        <Button 
                                            type="submit" 
                                            className="w-full"
                                            disabled={changePasswordMutation.isPending}
                                        >
                                            {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                                        </Button>

                                        {/* Forgot Password Link */}
                                        <button
                                            type="button"
                                            onClick={() => setForgotPasswordMode(true)}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Forgot your password?
                                        </button>
                                    </form>
                                ) : (
                                    // FORGOT PASSWORD FORM
                                    <form onSubmit={handleForgotPassword} className="space-y-4">
                                        <h3 className="text-lg font-semibold dark:text-white">Reset Password</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Enter your email address and we'll send you a link to reset your password.
                                        </p>

                                        {/* Email Input */}
                                        <div>
                                            <Label htmlFor="forgot-email" className="dark:text-gray-200">
                                                Email Address
                                            </Label>
                                            <Input
                                                id="forgot-email"
                                                type="email"
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                                className="mt-1 dark:bg-slate-800 dark:text-white dark:border-slate-600"
                                                required
                                            />
                                        </div>

                                        {/* Message */}
                                        {forgotPasswordMessage && (
                                            <p className="text-sm text-blue-600 dark:text-blue-400">{forgotPasswordMessage}</p>
                                        )}

                                        {/* Submit Button */}
                                        <Button 
                                            type="submit" 
                                            className="w-full"
                                            disabled={forgotPasswordMutation.isPending}
                                        >
                                            {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
                                        </Button>

                                        {/* Back to Change Password */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForgotPasswordMode(false);
                                                setForgotPasswordMessage("");
                                            }}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Back to Change Password
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}