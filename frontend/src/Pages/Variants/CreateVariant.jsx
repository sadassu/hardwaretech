import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import TextInput from "../../components/TextInput.jsx";
import { useVariant } from "../../hooks/useVariant.js";
import { Plus } from "lucide-react";
import { formatVariantLabel } from "../../utils/formatVariantLabel.js";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

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
  "box",
  "pack",
  "roll",
  "Wey",
];

const CreateVariant = ({ product }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { createVariant } = useVariant();
  const confirm = useConfirm();
  const quickToast = useQuickToast();
  const [formData, setFormData] = useState({
    unit: "",
    size: "",
    dimension: "",
    dimensionType: "",
    color: "",
    supplier_price: "",
    price: "",
    quantity: "",
    conversionSource: "",
    conversionQuantity: 1,
    autoConvert: false,
    conversionNotes: "",
    includePerText: false,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        unit: "",
        size: "",
        dimension: "",
        dimensionType: "",
        color: "",
        supplier_price: "",
        price: "",
        quantity: "",
        conversionSource: "",
        conversionQuantity: 1,
        autoConvert: false,
        conversionNotes: "",
        includePerText: false,
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const nextValue = type === "checkbox" ? checked : value;
      const updated = {
        ...prev,
        [name]: nextValue,
      };

      if (name === "autoConvert" && !checked) {
        updated.conversionSource = "";
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product?._id) {
      return toast.error("Product not specified");
    }

    const payload = { ...formData };
    if (!payload.unit) delete payload.unit;
    if (!payload.color) delete payload.color;

    const result = await confirm({
      title: "Add this variant?",
      text: "The variant will be created and stock will be added.",
      confirmButtonText: "Yes, add variant",
    });
    if (!result.isConfirmed) return;

    try {
      await createVariant(product._id, payload);
      quickToast({
        title: "Variant added",
        icon: "success",
      });
    } catch (error) {
      quickToast({
        title: "Failed to add variant",
        text: error.response?.data?.message || error.message,
        icon: "error",
      });
      return;
    }

    // reset
    setFormData({
      unit: "",
      size: "",
      dimension: "",
      dimensionType: "",
      color: "",
      supplier_price: "",
      price: "",
      quantity: "",
      conversionSource: "",
      conversionQuantity: 1,
      autoConvert: false,
      conversionNotes: "",
      includePerText: false,
    });

    setIsOpen(false);
  };

  return (
    <>
      <button
        className="btn btn-sm gap-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white border-0 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-200"
        onClick={() => setIsOpen(true)}
        title="Add Variant"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Variant</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="bg-[#222831] text-white rounded-2xl w-full max-w-2xl shadow-2xl p-4 sm:p-6"
      >
        <div className="max-h-[80vh] overflow-y-auto pr-1 sm:pr-2 space-y-6">
          <h2 className="text-xl font-semibold">Add Variant</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="size" className="block text-sm font-medium mb-1">
                  Size/Type <span className="text-gray-400 text-xs font-normal">(optional)</span>
                </label>
                <input
                  id="size"
                  type="text"
                  name="size"
                  placeholder="Size (e.g., Small, Medium)"
                  value={formData.size}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-[#30475E] text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold text-gray-200">
                    Unit
                  </span>
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
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="dimension" className="block text-sm font-medium mb-1">
                  Dimension <span className="text-gray-400 text-xs font-normal">(optional)</span>
                </label>
                <input
                  id="dimension"
                  type="text"
                  name="dimension"
                  placeholder="e.g., 1 inch, 2.5 cm"
                  value={formData.dimension}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-[#30475E] text-white placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">e.g., diameter, thickness</p>
              </div>

              <div>
                <label htmlFor="dimensionType" className="block text-sm font-medium mb-1">
                  Dimension Type <span className="text-gray-400 text-xs font-normal">(optional)</span>
                </label>
                <select
                  id="dimensionType"
                  name="dimensionType"
                  value={formData.dimensionType}
                  onChange={handleChange}
                  className="select select-bordered w-full bg-[#30475E] text-white"
                >
                  <option value="">None</option>
                  <option value="diameter">Diameter</option>
                  <option value="thickness">Thickness</option>
                  <option value="length">Length</option>
                  <option value="width">Width</option>
                  <option value="height">Height</option>
                </select>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-600/40 px-4 py-3">
              <input
                type="checkbox"
                id="includePerText"
                name="includePerText"
                checked={formData.includePerText}
                onChange={handleChange}
                className="checkbox checkbox-primary mt-1"
              />
              <label htmlFor="includePerText" className="text-sm font-medium leading-relaxed">
                Insert the word <span className="font-semibold text-blue-200">"per"</span> between size and unit
                (e.g., <span className="font-semibold">1 set per 30 m</span>)
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Supplier Price"
                type="number"
                name="supplier_price"
                placeholder="Supplier price"
                value={formData.supplier_price}
                onChange={handleChange}
                required
              />

              <TextInput
                label="Price"
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Quantity"
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
              />

              <TextInput
                label="Color (if applicable)"
                type="text"
                name="color"
                placeholder="Color (e.g., Red, Blue)"
                value={formData.color}
                onChange={handleChange}
              />
            </div>

            <div className="p-4 border border-dashed border-gray-300/60 rounded-2xl space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="autoConvert"
                  checked={formData.autoConvert}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                Allow this variant to convert from another variant
              </label>

              {formData.autoConvert && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Source Variant
                    </label>
                    <select
                      name="conversionSource"
                      value={formData.conversionSource}
                      onChange={handleChange}
                      className="select select-bordered w-full bg-[#30475E] text-white"
                      required
                    >
                      <option value="">Select a variant</option>
                      {product?.variants?.map((variant) => (
                        <option key={variant._id} value={variant._id}>
                          {formatVariantLabel(variant) || variant.unit || "variant"} • Stock:{" "}
                          {variant.quantity ?? 0}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput
                      label="Units per source"
                      type="number"
                      name="conversionQuantity"
                      min="1"
                      value={formData.conversionQuantity}
                      onChange={handleChange}
                      required
                    />

                    <TextInput
                      label="Conversion Notes (optional)"
                      type="text"
                      name="conversionNotes"
                      placeholder="e.g., 1 box = 24 pcs"
                      value={formData.conversionNotes}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn bg-red-500 text-white border-red-500 w-full"
            >
              Create Variant
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default CreateVariant;
