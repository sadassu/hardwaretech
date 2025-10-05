import { useState } from "react";
import Modal from "../../components/Modal";
import api from "../../utils/api.js";
import { useAuthContext } from "../../hooks/useAuthContext.js";
import { useProductsContext } from "../../hooks/useProductContext.js";
import TextInput from "../../components/TextInput.jsx";

const CreateProduct = () => {
  const { dispatch } = useProductsContext();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  });
  const [image, setImage] = useState(null);
  const { user } = useAuthContext();

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

    if (!user) {
      setError("You must be logged in");
      return;
    }

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("category", formData.category);
      if (image) form.append("image", image);

      const { data } = await api.post("/products", form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      });

      dispatch({ type: "CREATE_PRODUCT", payload: data.product });

      setFormData({ name: "", description: "", category: "" });
      setImage(null);
      setIsOpen(false);
    } catch (error) {
      console.log(error);
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
        <h2 className="text-xl font-semibold mb-4">Create Product</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 w-96">
          <TextInput
            label="Product Name"
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            required
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
          <TextInput
            label="Category"
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
            className="file-input file-input-bordered w-full bg-[#30475E] text-white"
          />

          <button type="submit" className="btn bg-red-500 text-white border-red-500 w-full">
            Create
          </button>
        </form>
      </Modal>
    </>
  );
};

export default CreateProduct;
