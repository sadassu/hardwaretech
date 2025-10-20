import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import api from "../../utils/api.js";
import { useAuthContext } from "../../hooks/useAuthContext.js";
import TextInput from "../../components/TextInput.jsx";
import { useCategoriesStore } from "../../store/categoriesStore.js";
import { useProductStore } from "../../store/productStore.js";

const CreateProduct = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    image: "", // now a text area input
  });

  const { user } = useAuthContext();
  const { categories, fetchCategories, loading } = useCategoriesStore();
  const { products, setProducts } = useProductStore();

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
      setError("You must be logged in");
      return;
    }

    try {
      const { data } = await api.post(
        "/products",
        {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          image: formData.image, // send text instead of file
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      // ✅ Update Zustand store immediately
      setProducts({
        products: [...products, data.product],
        total: products.length + 1,
        page: 1,
        pages: 1,
      });

      // Reset form
      setFormData({ name: "", description: "", category: "", image: "" });
      setIsOpen(false);
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || "Failed to create product");
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
            Create
          </button>
        </form>
      </Modal>
    </>
  );
};

export default CreateProduct;
