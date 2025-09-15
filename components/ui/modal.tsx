"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { X } from "lucide-react"

/**
 * Un modal simple hecho con Tailwind para evitar problemas de dependencias
 */
export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-lg border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold font-outfit">{title}</h3>
                        {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}
