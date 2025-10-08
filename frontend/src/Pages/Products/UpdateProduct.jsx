import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import api from "../../utils/api.js";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useCategoriesStore } from "../../store/categoriesStore.js";
import { Edit } from "lucide-react";

const UpdateProduct = ({ product, onUpdateSuccess }) => {
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  });
  const [image, setImage] = useState(null);

  const { categories, fetchCategories, loading } = useCategoriesStore();

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, fetchCategories]);

  // Populate form with existing product data when modal opens
  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category?.name || "",
      });
    }
  }, [isOpen, product]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("category", formData.category);
      if (image) form.append("image", image);

      const res = await api.put(`/products/${product._id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      });

      toast.success(res.data.message || "Product updated!");
      setFormData({ name: "", description: "", category: "" });
      setImage(null);
      setIsOpen(false);

      if (onUpdateSuccess) onUpdateSuccess(res.data.product);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <div className="relative group inline-block">
        <button
          className="btn btn-square btn-ghost"
          onClick={() => setIsOpen(true)}
        >
          <Edit className="size-5 text-gray-700 hover:text-blue-500 transition-colors" />
        </button>

        {/* Tooltip */}
        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap">
          Update Product
        </span>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Update Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4 w-96">
          {/* Product Name */}
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            className="input input-bordered w-full bg-[#30475E] text-white"
            required
          />

          {/* Description */}
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="textarea textarea-bordered w-full bg-[#30475E] text-white"
          />

          {/* Category Input with datalist */}
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

          {/* Image Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input file-input-bordered w-full bg-[#30475E] text-white"
          />

          {/* Submit */}
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
