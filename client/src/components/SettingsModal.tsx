import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
}

export default function SettingsModal ({isOpen, onClose}: SettingsModalProps) {
    // Use the centralized theme context - no local state needed!
    const { theme, toggleTheme } = useTheme();
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
                            onCheckedChange={toggleTheme}
                            aria-label="Toggle dark mode"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}