import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { toast } from "react-hot-toast";
import TextInput from "../../components/TextInput.jsx";
import { useVariant } from "../../hooks/useVariant.js";

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
