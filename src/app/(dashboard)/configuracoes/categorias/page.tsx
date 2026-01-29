"use client"

import { useState } from "react"
import { Plus, Tag, Trash2, Edit2, Crown, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  useCustomCategories,
  useCreateCustomCategory,
  useUpdateCustomCategory,
  useDeleteCustomCategory,
  useCanCreateCustomCategory,
  type CustomCategory
} from "@/lib/hooks/use-custom-categories"
import { categoryLabels } from "@/lib/utils/categories"
import Link from "next/link"

const ICON_OPTIONS = [
  { value: "tag", label: "Tag" },
  { value: "home", label: "Casa" },
  { value: "car", label: "Carro" },
  { value: "heart", label: "Saúde" },
  { value: "book", label: "Educação" },
  { value: "gift", label: "Presente" },
  { value: "coffee", label: "Café" },
  { value: "shopping-bag", label: "Compras" },
  { value: "plane", label: "Viagem" },
  { value: "smartphone", label: "Tecnologia" },
  { value: "dumbbell", label: "Fitness" },
  { value: "music", label: "Entretenimento" },
]

const COLOR_OPTIONS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6", "#6b7280", "#1f2937",
]

export default function CategoriesPage() {
  const { data: customCategories, isLoading } = useCustomCategories()
  const { canCreate, isLoading: isCheckingPlan } = useCanCreateCustomCategory()
  const createCategory = useCreateCustomCategory()
  const updateCategory = useUpdateCustomCategory()
  const deleteCategory = useDeleteCustomCategory()

  const [isOpen, setIsOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    icon: "tag",
    color: "#6366f1",
    is_fixed: false,
  })

  const resetForm = () => {
    setFormData({ name: "", icon: "tag", color: "#6366f1", is_fixed: false })
    setEditingCategory(null)
  }

  const handleOpenSheet = (category?: CustomCategory) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        icon: category.icon || "tag",
        color: category.color || "#6366f1",
        is_fixed: category.is_fixed || false,
      })
    } else {
      resetForm()
    }
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório")
      return
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          ...formData,
        })
        toast.success("Categoria atualizada")
      } else {
        await createCategory.mutateAsync(formData)
        toast.success("Categoria criada")
      }
      setIsOpen(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar categoria")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return

    try {
      await deleteCategory.mutateAsync(id)
      toast.success("Categoria excluída")
    } catch (error) {
      toast.error("Erro ao excluir categoria")
    }
  }

  if (isLoading || isCheckingPlan) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Categorias</h1>
        </div>

        {canCreate && (
          <Sheet open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <SheetTrigger asChild>
              <Button size="sm" onClick={() => handleOpenSheet()}>
                <Plus className="h-4 w-4 mr-1" />
                Nova
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editingCategory ? "Editar" : "Nova"} Categoria</SheetTitle>
                <SheetDescription>
                  {editingCategory ? "Atualize os dados da categoria" : "Crie uma categoria personalizada"}
                </SheetDescription>
              </SheetHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Academia"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full transition-all ${
                          formData.color === color ? "ring-2 ring-offset-2 ring-primary" : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_fixed">Despesa fixa</Label>
                    <p className="text-xs text-muted-foreground">
                      Marque se for uma despesa recorrente
                    </p>
                  </div>
                  <Switch
                    id="is_fixed"
                    checked={formData.is_fixed}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_fixed: checked })}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createCategory.isPending || updateCategory.isPending}
                  >
                    {(createCategory.isPending || updateCategory.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingCategory ? "Salvar" : "Criar"}
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {!canCreate && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Crown className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Recurso exclusivo Pro</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie categorias personalizadas com o plano Pro
            </p>
            <Link href="/pricing">
              <Button>
                <Crown className="h-4 w-4 mr-2" />
                Fazer upgrade
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Default Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categorias padrão</CardTitle>
          <CardDescription>
            Categorias disponíveis para todos os usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Badge key={key} variant="secondary">
                {label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Categories */}
      {canCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Suas categorias
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                <Crown className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            </CardTitle>
            <CardDescription>
              Categorias personalizadas criadas por você
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customCategories && customCategories.length > 0 ? (
              <div className="space-y-2">
                {customCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color || "#6366f1" }}
                      />
                      <span className="font-medium">{category.name}</span>
                      {category.is_fixed && (
                        <Badge variant="outline" className="text-xs">Fixa</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenSheet(category)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
                        disabled={deleteCategory.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma categoria personalizada criada ainda
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
