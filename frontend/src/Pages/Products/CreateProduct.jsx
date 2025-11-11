import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import api from "../../utils/api.js";
import { useAuthContext } from "../../hooks/useAuthContext.js";
import TextInput from "../../components/TextInput.jsx";
import { useCategoriesStore } from "../../store/categoriesStore.js";
import { useProductStore } from "../../store/productStore.js";
import StatusToast from "../../components/StatusToast.jsx";

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
  const { products, setProducts, setSuccess, successMessage, clearMessages } =
    useProductStore();

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
      setSuccess(message);

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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold mb-4 text-center sm:text-left">
          Create Product
        </h2>

        {localError && <div className="text-red-500 mb-4">{localError}</div>}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 w-full max-w-md sm:max-w-lg mx-auto px-4 sm:px-0"
        >
          <TextInput
            label="Product Name"
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full"
          />

          <label className="label">
            <span className="label-text font-semibold text-gray-200">
              Description
            </span>
          </label>
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="textarea textarea-bordered w-full bg-[#30475E] text-white"
          />

          <label className="label">
            <span className="label-text font-semibold text-gray-200">
              Category
            </span>
          </label>
          <input
            list="categories-list"
            name="category"
            autoComplete="off"
            placeholder="Select or type a category"
            value={formData.category}
            onChange={handleChange}
            className="input input-bordered w-full bg-[#30475E] text-white"
            required
          />
          <datalist id="categories-list">
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name} />
            ))}
          </datalist>
          {loading && (
            <p className="text-gray-400 text-sm mt-1">Loading categories...</p>
          )}

          <label className="label">
            <span className="label-text font-semibold text-gray-200">
              Image URL
            </span>
          </label>
          <textarea
            name="image"
            placeholder="Paste image URL"
            value={formData.image}
            onChange={handleChange}
            className="textarea textarea-bordered w-full bg-[#30475E] text-white"
          />

          <button
            type="submit"
            className="btn bg-red-500 text-white border-red-500 w-full"
          >
            Create
          </button>
        </form>
      </Modal>

      {/* ✅ Show only success toast */}
      <StatusToast
        color="border-green-500 bg-green-100 text-green-700"
        header="Success"
        message={successMessage}
        show={!!successMessage}
        onClose={clearMessages}
      />
    </>
  );
};

export default CreateProduct;
