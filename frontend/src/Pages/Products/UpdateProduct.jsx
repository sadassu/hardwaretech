import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import api from "../../utils/api.js";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../hooks/useAuthContext";

const UpdateProduct = ({ product, onUpdateSuccess }) => {
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  });
  const [image, setImage] = useState(null);

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
      <button
        className="btn btn-square btn-ghost"
        onClick={() => setIsOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
          />
        </svg>
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Update Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4 w-96">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="textarea textarea-bordered w-full"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input file-input-bordered w-full"
          />
          <button type="submit" className="btn btn-primary w-full">
            Update
          </button>
        </form>
      </Modal>
    </>
  );
};

export default UpdateProduct;
