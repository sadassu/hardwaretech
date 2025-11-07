import React, { useRef } from "react";

function Receipt({ sale, onClose }) {
  const receiptRef = useRef();

  const handlePrint = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    const receiptContent = receiptRef.current.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${sale._id?.slice(-8)}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              padding: 20px; 
              max-width: 400px; 
              margin: 0 auto;
              color: #000;
              background: #fff;
            }

            .receipt { background: white; }

            /* Header Section */
            .header { 
              text-align: center; 
              margin-bottom: 16px; 
              border-bottom: 2px dashed #000; 
              padding-bottom: 10px; 
            }
            .header h1 { font-size: 22px; margin-bottom: 5px; }
            .header p { font-size: 12px; line-height: 1.2; }

            /* Sections */
            .section { margin: 12px 0; }
            .section-title { 
              font-weight: bold; 
              font-size: 13px; 
              text-transform: uppercase;
              margin-bottom: 6px;
              border-bottom: 1px solid #000; 
              padding-bottom: 2px;
            }

            /* Rows */
            .row { 
              display: flex; 
              justify-content: space-between; 
              margin: 4px 0; 
              font-size: 13px; 
            }

            /* Items */
            .items { 
              border-top: 2px dashed #000; 
              border-bottom: 2px dashed #000; 
              padding: 10px 0; 
            }
            .item { 
              margin: 8px 0; 
              border-bottom: 1px dotted #999;
              padding-bottom: 4px;
            }
            .item:last-child {
              border-bottom: none;
            }
            .item-name { font-weight: bold; }
            .item-details { font-size: 11px; color: #555; margin: 3px 0; }

            /* Totals */
            .totals { margin-top: 12px; border-top: 2px dashed #000; padding-top: 8px; }
            .total-row { display: flex; justify-content: space-between; font-size: 14px; margin: 6px 0; }
            .grand-total { 
              font-weight: bold; 
              font-size: 15px; 
              border-top: 2px solid #000; 
              padding-top: 6px; 
              margin-top: 6px; 
            }

            /* Footer */
            .footer { 
              text-align: center; 
              margin-top: 16px; 
              padding-top: 10px; 
              border-top: 2px dashed #000; 
              font-size: 12px; 
            }

            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    const receiptContent = receiptRef.current.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${sale._id?.slice(-8)}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              padding: 20px; 
              max-width: 400px; 
              margin: 0 auto;
              color: #000;
              background: #fff;
            }

            .receipt { background: white; }

            /* Header Section */
            .header { 
              text-align: center; 
              margin-bottom: 16px; 
              border-bottom: 2px dashed #000; 
              padding-bottom: 10px; 
            }
            .header h1 { font-size: 22px; margin-bottom: 5px; }
            .header p { font-size: 12px; line-height: 1.2; }

            /* Sections */
            .section { margin: 12px 0; }
            .section-title { 
              font-weight: bold; 
              font-size: 13px; 
              text-transform: uppercase;
              margin-bottom: 6px;
              border-bottom: 1px solid #000; 
              padding-bottom: 2px;
            }

            /* Rows */
            .row { 
              display: flex; 
              justify-content: space-between; 
              margin: 4px 0; 
              font-size: 13px; 
            }

            /* Items */
            .items { 
              border-top: 2px dashed #000; 
              border-bottom: 2px dashed #000; 
              padding: 10px 0; 
            }
            .item { 
              margin: 8px 0; 
              border-bottom: 1px dotted #999;
              padding-bottom: 4px;
            }
            .item:last-child {
              border-bottom: none;
            }
            .item-name { font-weight: bold; }
            .item-details { font-size: 11px; color: #555; margin: 3px 0; }

            /* Totals */
            .totals { margin-top: 12px; border-top: 2px dashed #000; padding-top: 8px; }
            .total-row { display: flex; justify-content: space-between; font-size: 14px; margin: 6px 0; }
            .grand-total { 
              font-weight: bold; 
              font-size: 15px; 
              border-top: 2px solid #000; 
              padding-top: 6px; 
              margin-top: 6px; 
            }

            /* Footer */
            .footer { 
              text-align: center; 
              margin-top: 16px; 
              padding-top: 10px; 
              border-top: 2px dashed #000; 
              font-size: 12px; 
            }

            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${receiptContent}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  if (!sale) {
    return (
      <div className="p-4 text-center">
        <p>No sale data available</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header Actions */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">Receipt Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              🖨 Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              📄 PDF
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="p-6 font-mono">
          <div className="receipt">
            {/* Store Header */}
            <div className="text-center mb-4 pb-3 border-b-2 border-dashed border-black">
              <h1 className="text-2xl font-bold mb-1">HARDWARE TECH</h1>
              <p className="text-xs leading-tight">Rizal Street Tuy Batangas</p>
              <p className="text-xs leading-tight">
                Email: hardwaretech27@gmail.com
              </p>
            </div>

            {/* Transaction Info */}
            <div className="my-3">
              <div className="font-bold text-sm uppercase mb-2 border-b border-black">
                TRANSACTION DETAILS
              </div>
              <div className="flex justify-between text-sm">
                <span>Receipt #:</span>
                <span>#{sale._id?.slice(-8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Date:</span>
                <span>
                  {new Date(sale.saleDate).toLocaleDateString("en-PH")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Time:</span>
                <span>
                  {new Date(sale.saleDate).toLocaleTimeString("en-PH")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cashier:</span>
                <span>{sale.cashier?.name || "Unknown"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Type:</span>
                <span className="uppercase">{sale.type}</span>
              </div>
            </div>

            {/* Items */}
            <div className="my-3 border-t-2 border-b-2 border-dashed border-black py-3">
              <div className="font-bold text-sm uppercase mb-2">ITEMS</div>
              {sale.items?.length > 0 ? (
                sale.items.map((item, index) => {
                  const variant = item.productVariantId;
                  const product = variant?.product;

                  return (
                    <div
                      key={index}
                      className="my-2 pb-1 border-b border-dotted border-gray-400 last:border-0"
                    >
                      <div className="font-bold text-sm">
                        {product?.name || "Unnamed Product"}
                      </div>
                      <div className="text-xs text-gray-600 my-1">
                        {variant?.size ? `${variant.size} ` : ""}
                        {variant?.color ? `${variant.color} ` : ""}
                        {variant?.unit ? `(${variant.unit})` : ""}
                      </div>
                      <div className="text-xs text-gray-600 my-1">
                        {item.quantity} × ₱{item.price?.toLocaleString()}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span className="font-bold">
                          ₱{item.subtotal?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-sm">No items</p>
              )}
            </div>

            {/* Totals */}
            <div className="my-3 border-t-2 border-dashed border-black pt-2">
              <div className="flex justify-between text-base font-bold my-2 pt-2 border-t-2 border-black">
                <span>TOTAL:</span>
                <span>₱{sale.totalPrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm my-2">
                <span>Amount Paid:</span>
                <span>₱{sale.amountPaid?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm my-2">
                <span>Change:</span>
                <span>₱{sale.change?.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="my-3">
              <div className="font-bold text-sm uppercase mb-2 border-b border-black">
                PAYMENT STATUS
              </div>
              <div className="flex justify-between text-sm">
                <span>Status:</span>
                <span className="font-bold">
                  {sale.amountPaid >= sale.totalPrice
                    ? "PAID"
                    : "PARTIAL PAYMENT"}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 pt-3 border-t-2 border-dashed border-black text-xs">
              <p className="font-bold mb-1">Thank you for your purchase!</p>
              <p>Please keep this receipt for your records.</p>
              <p className="mt-2">Visit us again soon!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Receipt;
