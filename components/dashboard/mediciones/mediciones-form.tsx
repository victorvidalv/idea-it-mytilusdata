"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { Lugar, Unidad, TipoRegistro, OrigenDato } from "@/lib/types"
import { useTranslations } from "next-intl"

interface MedicionesFormProps {
    formData: {
        valor: string
        fecha_medicion: string
        lugar_id: string
        unidad_id: string
        tipo_id: string
        origen_id: string
        notas: string
    }
    lugares: Lugar[]
    unidades: Unidad[]
    tipos: TipoRegistro[]
    origenes: OrigenDato[]
    onChange: (formData: {
        valor: string
        fecha_medicion: string
        lugar_id: string
        unidad_id: string
        tipo_id: string
        origen_id: string
        notas: string
    }) => void
    onSubmit: (e: React.FormEvent) => void
    submitting: boolean
    isEditing: boolean
}

export function MedicionesForm({
    formData,
    lugares,
    unidades,
    tipos,
    origenes,
    onChange,
    onSubmit,
    submitting,
    isEditing
}: MedicionesFormProps) {
    const t = useTranslations('measurements')
    const tCommon = useTranslations('common')
    const tPlaces = useTranslations('places')
    const tUnits = useTranslations('units')
    const tRecordTypes = useTranslations('recordTypes')
    const tOrigins = useTranslations('origins')
    
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="m-fecha">{t('fields.date')}</Label>
                    <Input
                        id="m-fecha"
                        type="date"
                        required
                        value={formData.fecha_medicion}
                        onChange={(e) => onChange({ ...formData, fecha_medicion: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="m-valor">{t('fields.value')}</Label>
                    <Input
                        id="m-valor"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        required
                        value={formData.valor}
                        onChange={(e) => onChange({ ...formData, valor: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>{t('fields.place')}</Label>
                <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                    value={formData.lugar_id}
                    onChange={(e) => onChange({ ...formData, lugar_id: e.target.value })}
                >
                    <option value="">{tCommon('select')}...</option>
                    {lugares.map(l => <option key={l.id} value={l.id.toString()}>{l.nombre}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <Label>{t('fields.origin')}</Label>
                <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                    value={formData.origen_id}
                    onChange={(e) => onChange({ ...formData, origen_id: e.target.value })}
                >
                    <option value="">{tCommon('select')}...</option>
                    {origenes.map(o => <option key={o.id} value={o.id.toString()}>{o.nombre}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>{t('fields.unit')}</Label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        required
                        value={formData.unidad_id}
                        onChange={(e) => onChange({ ...formData, unidad_id: e.target.value })}
                    >
                        <option value="">Unit...</option>
                        {unidades.map(u => <option key={u.id} value={u.id.toString()}>{u.sigla}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label>{t('fields.recordType')}</Label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        required
                        value={formData.tipo_id}
                        onChange={(e) => onChange({ ...formData, tipo_id: e.target.value })}
                    >
                        <option value="">Type...</option>
                        {tipos.map(t => <option key={t.id} value={t.id.toString()}>{t.codigo}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="m-notas">{t('fields.notes')}</Label>
                <textarea
                    id="m-notas"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={t('placeholders.notes')}
                    value={formData.notas}
                    onChange={(e) => onChange({ ...formData, notas: e.target.value })}
                />
            </div>

            <Button type="submit" className="w-full h-12 mt-4" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isEditing ? tCommon('update') : tCommon('create')} Now
            </Button>
        </form>
    )
}
