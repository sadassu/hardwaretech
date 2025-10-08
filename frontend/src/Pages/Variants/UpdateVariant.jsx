import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { toast } from "react-hot-toast";
import TextInput from "../../components/TextInput.jsx";
import { useVariant } from "../../hooks/useVariant.js";

import { Edit } from "lucide-react";

const UNIT_OPTIONS = ["pcs", "kg", "g", "lb", "m", "cm", "ft", "set"];

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

    // Clean up optional fields
    const payload = { ...formData };
    if (!payload.unit) delete payload.unit;
    if (!payload.color) delete payload.color;

    await updateVariant(variant._id, payload);
    setIsOpen(false);
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
          Update Variant
        </span>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Update Variant</h2>

        <form onSubmit={handleSubmit} className="space-y-4 w-96">
          {/* Unit dropdown - optional */}
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

          {/* Size input */}
          <TextInput
            label="Size"
            type="text"
            name="size"
            placeholder="Size (e.g., small, medium)"
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

          {/* Price input */}
          <TextInput
            label="Price"
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
          />

          <TextInput
            label="Quantity"
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
          />

          {/* Color input */}
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
            className="rounded-2xl p-2 cursor-pointer bg-[#f05454] w-full"
          >
            Update Variant
          </button>
        </form>
      </Modal>
    </>
  );
};

export default UpdateVariant;
