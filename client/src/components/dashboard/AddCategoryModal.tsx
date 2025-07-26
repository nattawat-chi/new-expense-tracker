// import { useState } from "react";
// import { useAuth } from "@clerk/nextjs";
// import {
//   Button,
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   Input,
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui";
// import { createCategory } from "@/lib/api";

// export function AddCategoryModal({
//   onAdded,
//   categories,
//   catLoading,
//   refetchCategories,
// }: {
//   onAdded?: () => void;
//   categories: any[];
//   catLoading: boolean;
//   refetchCategories: () => void;
// }) {
//   const [open, setOpen] = useState(false);
//   const [form, setForm] = useState({ name: "", type: "EXPENSE" });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const { getToken } = useAuth();

//   const handleChange = (e: any) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button
//           variant="secondary"
//           className="flex items-center gap-2 w-full md:w-auto cursor-pointer"
//         >
//           + เพิ่มหมวดหมู่
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-md w-full">
//         <DialogHeader>
//           <DialogTitle>เพิ่มหมวดหมู่ใหม่</DialogTitle>
//         </DialogHeader>
//         <form
//           onSubmit={async (e) => {
//             e.preventDefault();
//             setLoading(true);
//             setError(null);
//             try {
//               const accessToken = await getToken();
//               if (!accessToken) {
//                 setError("No access token");
//                 setLoading(false);
//                 return;
//               }
//               await createCategory(form, accessToken);
//               setOpen(false);
//               setForm({ name: "", type: "EXPENSE" });
//               onAdded?.();
//             } catch (err: any) {
//               setError(err?.message || "Error");
//             } finally {
//               setLoading(false);
//             }
//           }}
//           className="space-y-4"
//         >
//           <Input
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             placeholder="ชื่อหมวดหมู่"
//             required
//           />
//           <Select
//             name="type"
//             value={form.type}
//             onValueChange={(value: string) =>
//               setForm((f) => ({ ...f, type: value }))
//             }
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="เลือกประเภท" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="EXPENSE">รายจ่าย</SelectItem>
//               <SelectItem value="INCOME">รายรับ</SelectItem>
//             </SelectContent>
//           </Select>
//           {error && <div className="text-red-500 text-sm">{error}</div>}
//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading ? "กำลังบันทึก..." : "บันทึก"}
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

interface CategoryForm {
  name: string;
  type: "INCOME" | "EXPENSE";
}
export interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  user_id: string;
}

interface CategoryManagementModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (form: CategoryForm) => Promise<void>;
  onEditCategory: (id: string, form: CategoryForm) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  open,
  onClose,
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const [activeTab, setActiveTab] = React.useState<"INCOME" | "EXPENSE">(
    "EXPENSE"
  );
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(
    null
  );
  const [form, setForm] = React.useState<CategoryForm>({
    name: "",
    type: "EXPENSE",
  });
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const filteredCategories = categories.filter((cat) => cat.type === activeTab);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await onEditCategory(editingCategory.id, form);
        setEditingCategory(null);
      } else {
        await onAddCategory(form);
      }
      setForm({ name: "", type: activeTab });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setForm({ name: category.name, type: category.type });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setForm({ name: "", type: activeTab });
  };

  const handleDeleteClick = (categoryId: string) => {
    setDeleteId(categoryId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await onDeleteCategory(deleteId);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === "EXPENSE" ? "default" : "outline"}
              onClick={() => setActiveTab("EXPENSE")}
              className="flex-1"
            >
              Expense
            </Button>
            <Button
              variant={activeTab === "INCOME" ? "default" : "outline"}
              onClick={() => setActiveTab("INCOME")}
              className="flex-1"
            >
              Income
            </Button>
          </div>

          {/* Add Category Form */}
          {showAddForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 p-4 border rounded-lg"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Category Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Category Name"
                    required
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value: "INCOME" | "EXPENSE") =>
                      setForm((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                      <SelectItem value="INCOME">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit">
                  {editingCategory ? "Edit" : "Add"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">
                {activeTab === "EXPENSE" ? "Expense" : "Income"}
              </h3>
              {!showAddForm && (
                <Button
                  onClick={() => {
                    setShowAddForm(true);
                    setForm({ name: "", type: activeTab });
                  }}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FaPlus /> Add Category
                </Button>
              )}
            </div>

            {filteredCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No categories {activeTab === "EXPENSE" ? "Expense" : "Income"}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <span className="font-medium">{category.name}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(category)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this category?
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Confirm
            </Button>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default CategoryManagementModal;
