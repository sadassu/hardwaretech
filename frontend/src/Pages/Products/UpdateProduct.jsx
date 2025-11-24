import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import TextInput from "../../components/TextInput.jsx";
import { useAuthContext } from "../../hooks/useAuthContext.js";
import { useCategoriesStore } from "../../store/categoriesStore.js";
import { useProductStore } from "../../store/productStore.js";
import { Edit } from "lucide-react";
import { toast } from "react-hot-toast";

const UpdateProduct = ({ product, onUpdateSuccess }) => {
  const { user } = useAuthContext();
  const { categories, fetchCategories, loading } = useCategoriesStore();
  const { updateProduct } = useProductStore();

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

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        image: formData.image, // plain string URL
      };

      const updatedProduct = await updateProduct(
        user.token,
        product._id,
        payload
      );
      toast.success("Product updated successfully!");
      setFormData({ name: "", description: "", category: "", image: "" });
      setIsOpen(false);
      if (onUpdateSuccess) onUpdateSuccess(updatedProduct);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update product");
      toast.error("Failed to update product");
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold mb-4 text-center sm:text-left">
          Update Product
        </h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}

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
            Update
          </button>
        </form>
      </Modal>
    </>
  );
};

export default UpdateProduct;
