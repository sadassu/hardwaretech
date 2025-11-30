import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import TextInput from "../../components/TextInput.jsx";
import { useAuthContext } from "../../hooks/useAuthContext.js";
import { useCategoriesStore } from "../../store/categoriesStore.js";
import { useProductStore } from "../../store/productStore.js";
import { Edit } from "lucide-react";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

const UpdateProduct = ({ product, onUpdateSuccess }) => {
  const { user } = useAuthContext();
  const { categories, fetchCategories, loading } = useCategoriesStore();
  const { updateProduct } = useProductStore();
  const confirm = useConfirm();
  const quickToast = useQuickToast();

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    image: "",
  });

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen, fetchCategories]);

  // Populate form when modal opens
  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category?.name || "",
        image: product.image || "",
      });
    }
  }, [isOpen, product]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in");
      return;
    }

    const result = await confirm({
      title: "Update product details?",
      text: `Changes to "${formData.name}" will be applied immediately.`,
      confirmButtonText: "Yes, save changes",
    });
    if (!result.isConfirmed) return;

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        image: formData.image, // plain string URL
      };

      const updatedProduct = await updateProduct(user.token, product._id, payload);
      quickToast({ title: "Product updated", icon: "success" });
      setFormData({ name: "", description: "", category: "", image: "" });
      setIsOpen(false);
      if (onUpdateSuccess) onUpdateSuccess(updatedProduct);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update product");
      quickToast({
        title: "Failed to update product",
        text: err.response?.data?.message || "Please try again.",
        icon: "error",
      });
    }
  };

  return (
    <>
      <button
        className="btn btn-sm btn-ghost gap-1.5 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200"
        onClick={() => setIsOpen(true)}
        title="Update Product"
      >
        <Edit className="w-4 h-4" />
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        className="bg-white rounded-2xl max-w-2xl w-full p-0 max-h-[90vh] flex flex-col"
      >
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Update Product</h2>
              <p className="text-blue-100 text-sm">Modify product details</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-5 flex-1 overflow-y-auto">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-4">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <textarea
                name="description"
                placeholder="Brief description (optional)"
                value={formData.description}
                onChange={handleChange}
                className="textarea textarea-bordered w-full bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <input
                list="categories-list"
                name="category"
                autoComplete="off"
                placeholder="Select or type a category"
                value={formData.category}
                onChange={handleChange}
                className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900"
                required
              />
              <datalist id="categories-list">
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name} />
                ))}
              </datalist>
              {loading && (
                <p className="text-gray-400 text-xs mt-1">Loading categories...</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Image URL
              </label>
              <textarea
                name="image"
                placeholder="Paste image URL"
                value={formData.image}
                onChange={handleChange}
                className="textarea textarea-bordered w-full bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900"
                rows={2}
                required
              />
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 btn btn-ghost border-2 border-gray-200 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 shadow-lg"
              >
                Update Product
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default UpdateProduct;
