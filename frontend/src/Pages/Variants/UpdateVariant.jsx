import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { toast } from "react-hot-toast";
import TextInput from "../../components/TextInput.jsx";
import { useVariant } from "../../hooks/useVariant.js";
import { Edit } from "lucide-react";

const UNIT_OPTIONS = [
  "pcs",
  "kg",
  "g",
  "lb",
  "m",
  "cm",
  "ft",
  "set",
  "W",
  "V",
  "amphere",
  "gang",
];

const UpdateVariant = ({ variant }) => {
  const { updateVariant } = useVariant();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    unit: "",
    size: "",
    color: "",
    supplier_price: "",
    price: "",
    quantity: "",
  });

  useEffect(() => {
    if (isOpen && variant) {
      setFormData({
        unit: variant.unit || "",
        size: variant.size || "",
        color: variant.color || "",
        price: variant.price || "",
        supplier_price: variant.supplier_price || "",
        quantity: variant.quantity || "",
      });
    }
  }, [isOpen, variant]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!variant?._id) return toast.error("No variant selected");

    const payload = { ...formData };
    if (!payload.unit) delete payload.unit;
    if (!payload.color) delete payload.color;

    await updateVariant(variant._id, payload);
    setIsOpen(false);
  };

  return (
    <>
        <button
        className="btn btn-sm btn-ghost gap-1.5 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200"
          onClick={() => setIsOpen(true)}
        title="Update Variant"
        >
        <Edit className="w-4 h-4" />
        </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold mb-4 text-center sm:text-left">
          Update Variant
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 w-full max-w-md sm:max-w-lg mx-auto px-4 sm:px-0"
        >
          {/* Unit dropdown */}
          <label className="label">
            <span className="label-text font-semibold text-gray-200">Unit</span>
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="select select-bordered w-full bg-[#30475E] text-white"
            required
          >
            <option value="">No Unit</option>
            {UNIT_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>
                {unit.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Size */}
          <TextInput
            label="Size"
            type="text"
            name="size"
            placeholder="Size (e.g., Small, Medium)"
            value={formData.size}
            onChange={handleChange}
          />

          {/* Supplier Price */}
          <TextInput
            label="Supplier Price"
            type="number"
            name="supplier_price"
            placeholder="Supplier price"
            value={formData.supplier_price}
            onChange={handleChange}
            required
          />

          {/* Price */}
          <TextInput
            label="Price"
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
          />

          {/* Quantity */}
          <TextInput
            label="Quantity"
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
          />

          {/* Color */}
          <TextInput
            label="Color (if only applicable)"
            type="text"
            name="color"
            placeholder="Color (e.g., Red, Blue)"
            value={formData.color}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="btn bg-red-500 text-white border-red-500 w-full"
          >
            Update Variant
          </button>
        </form>
      </Modal>
    </>
  );
};

export default UpdateVariant;
