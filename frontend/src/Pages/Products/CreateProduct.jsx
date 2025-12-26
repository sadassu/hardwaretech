import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import api from "../../utils/api.js";
import { useAuthContext } from "../../hooks/useAuthContext.js";
import { useCategoriesStore } from "../../store/categoriesStore.js";
import { useProductStore } from "../../store/productStore.js";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";
import { Plus } from "lucide-react";

const CreateProduct = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [localError, setLocalError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    category: "",
    image: "",
  });

  const { user } = useAuthContext();
  const { categories, fetchCategories, loading } = useCategoriesStore();
  const { products, setProducts } = useProductStore();
  const quickToast = useQuickToast();
  const confirm = useConfirm();

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, fetchCategories]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setLocalError("You must be logged in");
      return;
    }

    const result = await confirm({
      title: "Create new product?",
      text: `Add "${formData.name || "this product"}" to inventory?`,
      confirmButtonText: "Yes, create product",
      icon: "question",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await api.post("/products", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // ✅ Get message from backend
      const { message, product } = res.data;

      // ✅ Update Zustand store
      setProducts({
        products: [...products, product],
        total: products.length + 1,
        page: 1,
        pages: 1,
      });

      // ✅ Show backend message via toast
      quickToast({
        title: message || "Product created successfully",
        icon: "success",
      });

      // Reset form + close modal
      setFormData({ name: "", brand: "", description: "", category: "", image: "" });
      setIsOpen(false);
      setLocalError(null);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to create product";
      setLocalError(msg);
    }
  };

  return (
    <>
      <button
        className="btn w-full bg-red-400 hover:bg-red-500 text-white border-red-400"
        onClick={() => setIsOpen(true)}
      >
        Add Product
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="bg-white rounded-2xl max-w-2xl w-full p-0 max-h-[90vh] flex flex-col"
      >
        <div className="bg-red-400 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Product</h2>
              <p className="text-red-100 text-sm">Add a new product to the catalog</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-5 flex-1 overflow-y-auto">
            {localError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-4">
                <p className="text-red-700 text-sm font-medium">{localError}</p>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Brand
                  </label>
                  <span className="text-xs text-gray-500">Optional (e.g. Makita, Bosch, Stanley)</span>
                </div>
                <input
                  type="text"
                  name="brand"
                  placeholder="Enter brand name"
                  value={formData.brand}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
              Description
          </label>
                  <span className="text-xs text-gray-500">Optional</span>
                </div>
          <textarea
            name="description"
                  placeholder="Brief description (optional)"
            value={formData.description}
            onChange={handleChange}
                  className="textarea textarea-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
                  rows={3}
          />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
          </label>
          <input
            list="categories-list"
            name="category"
            autoComplete="off"
            placeholder="Select or type a category"
            value={formData.category}
            onChange={handleChange}
                  className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
            required
          />
          <datalist id="categories-list">
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name} />
            ))}
          </datalist>
          {loading && (
                  <p className="text-gray-400 text-xs mt-1">
                    Loading categories...
                  </p>
          )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
          </label>
          <textarea
            name="image"
            placeholder="Paste image URL"
            value={formData.image}
            onChange={handleChange}
                  className="textarea textarea-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
                  rows={2}
                  required
                />
              </div>
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
            className="flex-1 btn bg-red-400 hover:bg-red-500 text-white border-0 shadow-lg"
          >
            Create Product
          </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ✅ Show only success toast */}
    </>
  );
};

export default CreateProduct;
