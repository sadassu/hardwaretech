import React, { useState } from "react";
import Modal from "../../components/Modal";
import api from "../../utils/api.js";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../hooks/useAuthContext";

const UNIT_OPTIONS = ["pcs", "kg", "g", "lb", "m", "cm", "ft", "set"];

const CreateVariant = ({ product }) => {
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    unit: "pcs", // default value
    size: "",
    price: "",
    quantity: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product?._id) {
      return toast.error("Product not specified");
    }

    try {
      const res = await api.post(
        "/product-variants",
        {
          productId: product._id,
          ...formData,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      toast.success(res.data.message || "Variant created!");
      setFormData({ unit: "pcs", size: "", price: "", quantity: "" });
      setIsOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
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
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">
          Add Variant for "{product?.name}"
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 w-96">
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            {UNIT_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>
                {unit.toUpperCase()}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="size"
            placeholder="Size (e.g., small, medium)"
            value={formData.size}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />

          <button type="submit" className="btn btn-primary w-full">
            Create Variant
          </button>
        </form>
      </Modal>
    </>
  );
};

export default CreateVariant;
