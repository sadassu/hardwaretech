import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import api from "../../utils/api.js";
import { useAuthContext } from "../../hooks/useAuthContext.js";
import { useCategoriesStore } from "../../store/categoriesStore.js";
import { useProductStore } from "../../store/productStore.js";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

const CreateProduct = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [localError, setLocalError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
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
      setFormData({ name: "", description: "", category: "", image: "" });
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
        className="btn w-full bg-red-500 text-white border-red-500"
        onClick={() => setIsOpen(true)}
      >
        Add Product
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="bg-white text-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl p-0"
      >
        <div className="border-b border-gray-200 px-6 py-4 flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Create Product</h2>
          <p className="text-sm text-gray-500">
            Provide basic details to add a new product to the catalog.
          </p>
        </div>

        <div className="p-6">
          {localError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="input input-bordered w-full bg-white text-gray-900"
            required
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
                  className="textarea textarea-bordered w-full bg-white text-gray-900"
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
                  className="input input-bordered w-full bg-white text-gray-900"
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
                  className="textarea textarea-bordered w-full bg-white text-gray-900"
                  rows={2}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost border border-gray-200"
              >
                Cancel
              </button>
          <button
            type="submit"
                className="btn bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
          >
                Create Product
          </button>
            </div>
        </form>
        </div>
      </Modal>

      {/* ✅ Show only success toast */}
    </>
  );
};

export default CreateProduct;
