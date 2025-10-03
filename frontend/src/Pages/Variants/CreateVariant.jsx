import React, { useState } from "react";
import Modal from "../../components/Modal";
import api from "../../utils/api.js";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useProductsContext } from "../../hooks/useProductContext.js";
import TextInput from "../../components/TextInput.jsx"; // ✅ import reusable component

const UNIT_OPTIONS = ["pcs", "kg", "g", "lb", "m", "cm", "ft", "set"];

const CreateVariant = ({ product }) => {
  const { user } = useAuthContext();
  const { dispatch } = useProductsContext();
  const [isOpen, setIsOpen] = useState(false);
  const [hasColor, setHasColor] = useState(false);
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

    try {
      const res = await api.post(
        "/product-variants",
        {
          productId: product._id,
          ...formData,
          color: hasColor ? formData.color : null,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      toast.success(res.data.message || "Variant created!");

      dispatch({
        type: "UPDATE_VARIANT",
        payload: {
          productId: res.data.productId,
          variant: res.data.variant,
        },
      });

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
