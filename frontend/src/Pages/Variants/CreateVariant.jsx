import React, { useState } from "react";
import Modal from "../../components/Modal";
import { toast } from "react-hot-toast";
import TextInput from "../../components/TextInput.jsx"; 
import { useVariant } from "../../hooks/useVariant.js";
import { Plus } from "lucide-react";

const UNIT_OPTIONS = ["pcs", "kg", "g", "lb", "m", "cm", "ft", "set"];

const CreateVariant = ({ product }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasColor, setHasColor] = useState(false);
  const { createVariant } = useVariant();
  const [formData, setFormData] = useState({
    unit: "pcs",
    size: "",
    price: "",
    quantity: "",
    supplier_price: "",
    color: "",
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

    await createVariant(product._id, formData, hasColor);

    // reset
    setFormData({
      unit: "pcs",
      size: "",
      price: "",
      quantity: "",
      supplier_price: "",
      color: "",
    });

    setHasColor(false);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative group inline-block">
        <button className="btn bg-red-500" onClick={() => setIsOpen(true)}>
          <Plus className="size-5 text-white hover:scale-110 transition-transform" />
        </button>

        {/* Tooltip */}
        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap">
          Add Variant
        </span>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">
          Add Variant for "{product?.name}"
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 w-96">
          {/* Unit dropdown */}
          <div>
            <label htmlFor="unit" className="block text-sm font-medium mb-1">
              Unit
            </label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="select select-bordered w-full bg-[#30475E] text-white"
            >
              {UNIT_OPTIONS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Size */}
          <TextInput
            label="Size"
            type="text"
            name="size"
            placeholder="e.g., small, medium"
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
            label="Retail Price"
            type="number"
            name="price"
            placeholder="Retail Price"
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

          {/* Checkbox: has color */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasColor"
              checked={hasColor}
              onChange={(e) => setHasColor(e.target.checked)}
              className="w-5 h-5 accent-[#f05454] border-2 border-[#f05454] rounded"
            />

            <label htmlFor="hasColor" className="text-sm font-medium">
              This variant has a color
            </label>
          </div>

          {/* Color input (conditionally rendered) */}
          {hasColor && (
            <TextInput
              label="Color"
              type="text"
              name="color"
              placeholder="e.g., Red, Blue"
              value={formData.color}
              onChange={handleChange}
              required={hasColor}
            />
          )}

          <button type="submit" className="btn btn-primary w-full">
            Create Variant
          </button>
        </form>
      </Modal>
    </>
  );
};

export default CreateVariant;
