"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save } from "lucide-react"

interface CiclosFormProps {
    formData: {
        nombre: string
        fecha_siembra: string
        fecha_finalizacion: string
        lugar_id: string
        activo: boolean
        notas: string
    }
    setFormData: (data: any) => void
    isModalOpen: boolean
    setIsModalOpen: (open: boolean) => void
    editingCiclo: any
    submitting: boolean
    lugares: { id: number; nombre: string }[]
    handleSubmit: (e: React.FormEvent) => void
    t: any
    tCommon: any
}

export function CiclosForm({
    formData,
    setFormData,
    isModalOpen,
    setIsModalOpen,
    editingCiclo,
    submitting,
    lugares,
    handleSubmit,
    t,
    tCommon
}: CiclosFormProps) {
    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[500px] border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold font-outfit text-primary">
                        {editingCiclo ? t('editCycle') : t('newCycle')}
                    </DialogTitle>
                    <DialogDescription className="italic">
                        {t('description')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                    <div className="space-y-4">
                        {/* Nombre del Ciclo */}
                        <div className="space-y-2">
                            <Label htmlFor="nombre" className="font-semibold">{t('fields.name')}</Label>
                            <Input
                                id="nombre"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder={t('placeholders.name')}
                                className="bg-background/50 border-border/50"
                                required
                            />
                        </div>

                        {/* Centro/Lugar */}
                        <div className="space-y-2">
                            <Label htmlFor="lugar_id" className="font-semibold">{t('fields.place')}</Label>
                            <Select
                                value={formData.lugar_id}
                                onValueChange={(val) => setFormData({ ...formData, lugar_id: val })}
                                required
                            >
                                <SelectTrigger id="lugar_id" className="bg-background/50 border-border/50">
                                    <SelectValue placeholder={t('placeholders.place')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {lugares.map((lugar) => (
                                        <SelectItem key={lugar.id} value={lugar.id.toString()}>
                                            {lugar.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Fecha de Siembra */}
                            <div className="space-y-2">
                                <Label htmlFor="fecha_siembra" className="font-semibold">{t('fields.sowingDate')}</Label>
                                <Input
                                    id="fecha_siembra"
                                    type="date"
                                    value={formData.fecha_siembra}
                                    onChange={(e) => setFormData({ ...formData, fecha_siembra: e.target.value })}
                                    className="bg-background/50 border-border/50"
                                    required
                                />
                            </div>

                            {/* Fecha de Término */}
                            <div className="space-y-2">
                                <Label htmlFor="fecha_finalizacion" className="font-semibold">
                                    {t('fields.endDate')} <span className="text-xs font-normal text-muted-foreground italic">(Opcional)</span>
                                </Label>
                                <Input
                                    id="fecha_finalizacion"
                                    type="date"
                                    value={formData.fecha_finalizacion}
                                    onChange={(e) => setFormData({ ...formData, fecha_finalizacion: e.target.value })}
                                    className="bg-background/50 border-border/50"
                                />
                            </div>
                        </div>

                        {/* Estado Activo */}
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
                            <div className="space-y-0.5">
                                <Label htmlFor="activo" className="font-semibold">{t('fields.active')}</Label>
                                <p className="text-xs text-muted-foreground">
                                    {formData.activo
                                        ? "Este ciclo se establecerá como el actual para el centro."
                                        : "El ciclo se guardará como histórico/finalizado."}
                                </p>
                            </div>
                            <Switch
                                id="activo"
                                checked={formData.activo}
                                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                            />
                        </div>

                        {/* Notas */}
                        <div className="space-y-2">
                            <Label htmlFor="notas" className="font-semibold">{t('fields.notes')}</Label>
                            <Textarea
                                id="notas"
                                value={formData.notas}
                                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                placeholder={t('placeholders.notes')}
                                className="bg-background/50 border-border/50 resize-none"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-border/20">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            {tCommon('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 px-6"
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {editingCiclo ? tCommon('update') : tCommon('create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
