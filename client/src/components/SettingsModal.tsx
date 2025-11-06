import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
}

export default function SettingsModal ({isOpen, onClose}: SettingsModalProps) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check localStorage or system preference
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        // Apply theme to document
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col bg-blue-50 dark:bg-[#2c2c2c] rounded-md p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="dark:text-white">
                        Settings
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Theme Toggle Section */}
                    <div className="flex items-center justify-between space-x-4 p-4 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                        <div className="flex items-center space-x-3">
                            {isDarkMode ? (
                                <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            ) : (
                                <Sun className="w-5 h-5 text-yellow-600" />
                            )}
                            <div className="space-y-0.5">
                                <Label htmlFor="theme-toggle" className="text-sm font-medium dark:text-white cursor-pointer">
                                    Dark Mode
                                </Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="theme-toggle"
                            checked={isDarkMode}
                            onCheckedChange={setIsDarkMode}
                            aria-label="Toggle dark mode"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}