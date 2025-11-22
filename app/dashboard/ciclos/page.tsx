"use client"

import { Button } from "@/components/ui/button"
import { Plus, History } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCiclos } from "./hooks/use-ciclos"
import { CiclosTable } from "./components/ciclos-table"
import { CiclosForm } from "./components/ciclos-form"
import { toast } from "sonner"

export default function CiclosPage() {
    const t = useTranslations('cycles')
    const tCommon = useTranslations('common')
    const tMessages = useTranslations('messages')

    const {
        ciclos,
        loading,
        lugares,
        filters,
        setFilters,
        isModalOpen,
        setIsModalOpen,
        submitting,
        editingCiclo,
        formData,
        setFormData,
        openEditModal,
        openCreateModal,
        handleSubmit,
        handleDelete
    } = useCiclos()

    const onDelete = async (id: number) => {
        if (confirm(tMessages('confirm.delete'))) {
            await handleDelete(id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
                        <History className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight font-outfit text-primary">{t('title')}</h2>
                        <p className="text-muted-foreground italic text-sm">{t('description')}</p>
                    </div>
                </div>
                <Button
                    onClick={openCreateModal}
                    className="gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 rounded-xl h-11"
                >
                    <Plus className="w-5 h-5" /> {t('newCycle')}
                </Button>
            </div>

            <CiclosTable
                ciclos={ciclos}
                loading={loading}
                lugares={lugares}
                filters={filters}
                setFilters={setFilters}
                onEdit={openEditModal}
                onDelete={onDelete}
                t={t}
                tCommon={tCommon}
            />

            <CiclosForm
                formData={formData}
                setFormData={setFormData}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                editingCiclo={editingCiclo}
                submitting={submitting}
                lugares={lugares}
                handleSubmit={handleSubmit}
                t={t}
                tCommon={tCommon}
            />
        </div>
    )
}
