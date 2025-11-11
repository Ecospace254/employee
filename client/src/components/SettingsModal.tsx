import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    // Use the centralized theme context - no local state needed!
    const { theme, toggleTheme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<"appearance" | "security" | "password">("appearance");
    const isDarkMode = theme === 'dark';

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
                        )}
                        {activeTab === "password" && (
                            <div>
                                <Label htmlFor="password" className="block text-sm font-medium dark:text-white">
                                    Password
                                </Label>
                                <input
                                    type="password"
                                    id="password"
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700"
                                />
                            </div>
                        )} */}
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}