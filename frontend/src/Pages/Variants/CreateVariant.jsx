import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
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
    lowStockThreshold: 15,
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
        lowStockThreshold: 15,
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
      lowStockThreshold: 15,
    });

    setIsOpen(false);
  };

  return (
    <>
      <button
        className="btn btn-sm btn-circle btn-ghost text-black hover:text-gray-700 border-0 transition-all duration-200"
        onClick={() => setIsOpen(true)}
        title="Add Variant"
      >
        <Plus className="w-4 h-4" />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="bg-white rounded-2xl max-w-2xl w-full p-0 max-h-[90vh] flex flex-col"
      >
        <div className="bg-red-400 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add Variant</h2>
              <p className="text-red-100 text-sm">Create a new product variant</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-5 flex-1 overflow-y-auto">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="size" className="block text-sm font-semibold text-gray-700 mb-2">
                  Size/Type <span className="text-gray-400 text-xs font-normal">(optional)</span>
                </label>
                <input
                  id="size"
                  type="text"
                  name="size"
                  placeholder="Size (e.g., Small, Medium)"
                  value={formData.size}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="select select-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
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
                <label htmlFor="dimension" className="block text-sm font-semibold text-gray-700 mb-2">
                  Dimension <span className="text-gray-400 text-xs font-normal">(optional)</span>
                </label>
                <input
                  id="dimension"
                  type="text"
                  name="dimension"
                  placeholder="e.g., 1 inch, 2.5 cm"
                  value={formData.dimension}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">e.g., diameter, thickness</p>
              </div>

              <div>
                <label htmlFor="dimensionType" className="block text-sm font-semibold text-gray-700 mb-2">
                  Dimension Type <span className="text-gray-400 text-xs font-normal">(optional)</span>
                </label>
                <select
                  id="dimensionType"
                  name="dimensionType"
                  value={formData.dimensionType}
                  onChange={handleChange}
                  className="select select-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
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

            {/* Removed old 'per' helper copy as requested; behavior is still controlled by includePerText flag */}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Supplier Price
                </label>
                <input
                  type="number"
                  name="supplier_price"
                  placeholder="Supplier price"
                  value={formData.supplier_price}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={formData.price}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color (if applicable)
                </label>
                <input
                  type="text"
                  name="color"
                  placeholder="Color (e.g., Red, Blue)"
                  value={formData.color}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Low stock threshold{" "}
                  <span className="text-gray-400 text-xs font-normal">
                    (alert when quantity is at or below this number)
                  </span>
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  placeholder="e.g., 15"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
                  min="0"
                />
              </div>
            </div>

            <div className="p-4 border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Source Variant
                    </label>
                    <select
                      name="conversionSource"
                      value={formData.conversionSource}
                      onChange={handleChange}
                      className="select select-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
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
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Units per source
                      </label>
                      <input
                        type="number"
                        name="conversionQuantity"
                        min="1"
                        value={formData.conversionQuantity}
                        onChange={handleChange}
                        className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Conversion Notes (optional)
                      </label>
                      <input
                        type="text"
                        name="conversionNotes"
                        placeholder="e.g., 1 box = 24 pcs"
                        value={formData.conversionNotes}
                        onChange={handleChange}
                        className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 btn btn-ghost border-2 border-gray-200 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn bg-red-400 hover:bg-red-500 text-white border-0 shadow-lg"
              >
                Create Variant
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default CreateVariant;
