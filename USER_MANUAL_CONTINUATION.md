**Q16: What happens after I add an item to cart in POS?**

A: After adding an item to cart in POS, you stay on the POS page to continue selecting more products. This allows cashiers to efficiently build a complete sale without being redirected away from the product selection interface.

**Q17: How do I filter products by category?**

A: On the Products page, use the category filter located on the left side (or top on mobile devices). Click on a category name to view only products in that category. Click "All" to view all products again. Categories help organize products and make browsing easier.

**Q18: What information is shown in the dashboard analytics?**

A: The dashboard provides comprehensive analytics including:

- **Sales Trends**: Line chart showing sales over time (daily, monthly, yearly)
- **Supply vs Sales Analysis**: Comparison of supply costs vs sales revenue with profit calculations
- **Fast-Moving Products**: Bar chart showing which products are restocked most frequently
- **Product Sales Movement**: Bar chart showing top-selling products
- **Stock Status Cards**: Low stock alerts, out of stock items, total products, and total stock value
- **Recent Supply History**: Latest supply entries with product details

**Q19: How do I view product variants?**

A: Click on any product card to view its details. You'll see all available variants listed with their:
- Size/Type and Unit (e.g., "12 ft")
- Color (if applicable)
- Dimension and Dimension Type (if applicable)
- Current stock quantity
- Price per unit
- Conversion information (if the variant converts from another)

**Q20: What does "Low Stock" mean?**

A: Low stock refers to products or variants with a quantity less than 20 units. The dashboard displays low stock alerts to help you identify items that need restocking. You can also see low stock indicators on product cards in the inventory page.

**Q21: Can I see which products are out of stock?**

A: Yes, the dashboard shows an "Out of Stock" card displaying the count of products with zero quantity. In the inventory page, out-of-stock items are clearly marked. Customers cannot add out-of-stock items to their cart.

**Q22: How does the search functionality work?**

A: The search feature works across different pages:

- **Products Page**: Search by product name or description
- **Reservations Page**: Search by customer name, email, reservation ID, product name, or date
- **Sales Page**: Search by sale ID, cashier name/email, or product name
- **Supply History Page**: Search by product name (works even for deleted products)

Search is case-insensitive and updates results in real-time as you type.

**Q23: What is the difference between "Size/Type" and "Unit" in variants?**

A: 
- **Size/Type**: Optional field for variant size or type (e.g., "12", "Small", "Large", "Medium"). This appears on the left side of the unit in displays.
- **Unit**: Required field for the unit of measurement (e.g., "ft", "kg", "pcs", "set"). This appears on the right side of the size in displays.

Together they form labels like "12 ft" or "5 kg".

**Q24: How do I add notes to a reservation or sale?**

A: When adding items to cart, you can add special notes in the notes field before processing. These notes are saved with the reservation or sale and can be viewed later. Notes are useful for special instructions, delivery requests, or customer preferences.

**Q25: What happens when I complete a reservation?**

A: When you complete a reservation:
1. The reservation status changes to "Completed"
2. A sale record is created with all the reservation details
3. Inventory quantities are automatically reduced
4. Payment information is recorded
5. You are automatically redirected to the Sales page to verify the sale
6. The customer receives confirmation

**Q26: Can I update a reservation after it's been created?**

A: Yes, admins and cashiers can update reservation details:
- Click on the reservation
- Click "Update Details" button
- Modify items, quantities, or prices
- Save the changes

Note: Customers can only cancel their own reservations, not update them.

**Q27: How do I handle a sale return?**

A: To return a sale:
1. Navigate to the Sales page
2. Find the sale you want to return
3. Click the "Return" button (with a rotate icon)
4. Confirm the return in the modal
5. The items will be automatically returned to inventory
6. The sale will be marked as "Returned"
7. Stock quantities will be restored

**Q28: What information is included in the sales export CSV file?**

A: The exported CSV file includes:
- Sale ID/Transaction number
- Date and time of sale
- Cashier information (name and email)
- Sale type (POS or Reservation)
- Status (Paid, Partial, Returned)
- List of items with:
  - Product names (preserved even if deleted)
  - Variant details (size, unit, color)
  - Quantities
  - Prices per unit
  - Subtotal for each item
- Total amount
- Amount paid
- Change given

**Q29: How do I restock a variant?**

A: To restock a variant:
1. Navigate to the Products/Inventory page
2. Find the product and variant you want to restock
3. Click the "Restock" button on the variant
4. Enter the quantity to add
5. Enter the supplier price (if different from current)
6. Add optional notes
7. Click "Restock"
8. A new supply history entry will be created
9. The variant's quantity will be updated

**Q30: What is the purpose of supply history pull-out functionality?**

A: The pull-out feature allows you to track when stock is removed from a specific supply entry. This is useful for:
- Tracking damaged or defective items
- Recording stock adjustments
- Maintaining accurate inventory records
- Auditing supply entries

When you pull out stock, the available quantity from that supply entry is reduced, but the supply history record remains for tracking purposes.

**Q31: How do I filter sales by date range?**

A: On the Sales page:
1. Use the "Date From" field to set the start date
2. Use the "Date To" field to set the end date
3. The sales list will automatically filter to show only sales within that range
4. You can combine date filters with other filters (type, status, cashier, search)

**Q32: What roles can a user have?**

A: Users can have one or more of the following roles:
- **User/Customer**: Can browse products, make reservations, and manage their account
- **Cashier**: Can process sales, manage reservations, and view sales history
- **Admin**: Has full access to all features including inventory management, user management, analytics, and settings

A user can have multiple roles (e.g., both Cashier and Admin).

**Q33: How do I assign roles to users?**

A: Only admins can assign roles:
1. Navigate to Settings → User Management (or Edit User)
2. Find the user you want to manage
3. Click "Edit" or "Manage Roles"
4. Select the appropriate roles
5. Save the changes

**Q34: What happens when I delete a category?**

A: You can only delete a category if no products are currently using it. If products are assigned to the category, you must either:
- Reassign those products to other categories first, or
- Delete the products using that category

This prevents orphaned products and maintains data integrity.

**Q35: Can I upload product images?**

A: Yes, when creating or editing a product, you can upload a product image. The image will be displayed on:
- Product cards in the product list
- Product detail pages
- Customer-facing product views

Supported image formats depend on your system configuration (typically JPG, PNG, etc.).

**Q36: How does the "Supply vs Sales Analysis" help my business?**

A: This analysis provides valuable insights:
- **Supply Cost**: Total money spent on inventory
- **Sales Revenue**: Total money earned from sales
- **Profit**: Difference between sales and supply costs
- **Profit Margin**: Percentage of profit relative to sales
- **Best Performing Period**: Time period with highest profit

This helps you:
- Identify profitable periods
- Plan inventory purchases
- Optimize pricing strategies
- Make data-driven business decisions

**Q37: What does "Fast-Moving Products" mean?**

A: Fast-moving products are items that are restocked frequently. The dashboard shows the top 5 products that have the most supply history entries. This helps you identify:
- Popular items that need frequent restocking
- Products with high turnover
- Items to keep well-stocked
- Seasonal trends

**Q38: How do I filter the Supply vs Sales Analysis by month?**

A: 
1. In the Dashboard, locate the "Supply vs Sales Analysis" section
2. Select "By Month" from the filter dropdown
3. Select the year from the year dropdown
4. Select the month from the month dropdown
5. The graph will show all weeks that belong to that month (weeks where at least 4 days fall within the selected month)

**Q39: What is the difference between daily, monthly, and yearly sales trends?**

A: 
- **Daily**: Shows sales for the last 14 days, with each data point representing one day
- **Monthly**: Shows sales for the current year, with each data point representing one month
- **Yearly**: Shows sales across all years, with each data point representing one year

Switch between these views using the dropdown in the Sales Trends section of the dashboard.

**Q40: How do I know if my account is verified?**

A: 
- **Admin and Cashier users**: Accounts are automatically verified and don't require email verification
- **Regular users (customers)**: You'll see a verification page if your account isn't verified. Check your email for the verification link, or click "Resend Verification Email"

Once verified, you can access all features available to your role.

**Q41: Can I use the system on my mobile phone?**

A: Yes, Hardware Tech is fully responsive and works on mobile devices. The interface adapts to smaller screens:
- Navigation menu becomes a hamburger menu
- Product cards stack vertically
- Shopping cart opens as a centered modal
- Tables become card views
- All features are accessible on mobile

**Q42: What happens if I try to add more items to cart than available in stock?**

A: The system prevents adding more than available stock:
- The quantity input shows the maximum available stock
- If you try to add more, you'll see a message indicating the maximum stock available
- The "Add to Cart" button may be disabled if stock is insufficient
- Cart quantities automatically adjust if stock decreases after items are added

**Q43: How do I see which products are selling the most?**

A: Use the "Product Sales Movement" chart in the Dashboard:
1. Filter by year and month (optional)
2. Filter by category (optional)
3. View the top 5 selling products
4. Click on bars to see detailed sales information
5. Switch between weekly and daily views

**Q44: What information is preserved when I delete a product with supply history?**

A: When you delete a product:
- **Supply history records are preserved** - they are never deleted
- **Product names in supply history remain visible** - you can still see what was supplied
- **Variant details are preserved** - size, unit, and color information remains
- **Money spent calculations remain accurate** - based on stored supply history data
- **Financial reports are unaffected** - all cost analysis remains correct

**Q45: How do I cancel my own reservation as a customer?**

A: 
1. Navigate to "Reservations" in the navigation menu
2. Find your reservation in the list
3. Click on the reservation to view details
4. Click the "Cancel Reservation" button
5. Confirm the cancellation
6. The reserved stock will be released back to inventory
7. Your reservation status will change to "Cancelled"

Note: No success alert is shown, but the cancellation is processed successfully.

**Q46: What is the purpose of variant conversion notes?**

A: Conversion notes allow you to add additional information about how a variant converts from another variant. This is useful for:
- Documenting conversion rules
- Adding special instructions
- Explaining conversion logic
- Providing context for inventory management

These notes are visible when viewing variant details.

**Q47: How do I know if a variant can auto-convert from another variant?**

A: When viewing variant details, you'll see:
- A "Converts from" indicator if auto-conversion is enabled
- The source variant name
- The conversion quantity (e.g., "1 source = 10 of this variant")
- Conversion notes (if any)
- The "Include 'per' text" option affects display format

**Q48: What happens to sales records when I delete a variant that was sold?**

A: Sales records are completely preserved:
- Product names remain visible (not "Unknown Product")
- Variant details (size, unit, color) remain visible
- All quantities and prices are preserved
- Financial calculations remain accurate
- You can still view, export, and analyze historical sales data

**Q49: How do I filter reservations by status?**

A: On the Reservations page:
1. Use the status cards at the top (Pending, Confirmed, Completed, Cancelled)
2. Click on a status card to filter reservations by that status
3. Click "All" or refresh to see all reservations again
4. You can combine status filters with search queries

**Q50: What is the difference between "Amount Paid" and "Change" in sales?**

A: 
- **Amount Paid**: The total amount the customer gave you
- **Change**: The difference between amount paid and total sale amount (calculated automatically)
- If amount paid is less than total, change will be negative (indicating partial payment)
- The system shows a warning if amount paid is insufficient

**Q51: Can I see a receipt for a completed sale?**

A: Yes, you can view and print receipts:
1. Navigate to the Sales page
2. Find the sale you want to view
3. Click on the sale to expand details
4. Click "View Receipt" or "Print Receipt" button
5. A printable receipt will be displayed with all sale details

**Q52: How does the system handle real-time updates?**

A: The system uses WebSocket connections to provide real-time updates:
- Product changes (price, stock, details) update automatically across all users
- Cart contents sync automatically when products change
- Reservation status updates in real-time
- Inventory changes reflect immediately
- No page refresh needed to see updates

**Q53: What should I do if I see "WebSocket connection error" in the console?**

A: This is usually a temporary connection issue:
- The system will automatically attempt to reconnect
- Refresh the page if the error persists
- Check your internet connection
- Real-time updates may be delayed until reconnection
- Core functionality (viewing, adding, editing) still works without WebSocket

**Q54: How do I delete my account?**

A: 
1. Navigate to your Profile page
2. Scroll to the account management section
3. Click "Delete Account" button
4. Confirm the deletion
5. **Warning**: This action is permanent and will:
   - Delete your account
   - Delete all your reservations
   - Remove your access to the system

**Q55: What is the "Include 'per' text" option in variant conversion?**

A: This option affects how converted variants are displayed:
- **Checked**: Displays as "1 per 30 m" (for example)
- **Unchecked**: Displays as "1 30 m" (for example)

This helps clarify the conversion relationship in the variant label.

**Q56: How do I know which week a supply entry belongs to in the monthly view?**

A: In the Supply vs Sales Analysis with "By Month" filter:
- Weeks are displayed that have at least 4 days within the selected month
- Each week shows its date range
- Weeks are labeled with their ISO week number and year
- Click on data points to see detailed week information

**Q57: Can I see profit margins for specific time periods?**

A: Yes, in the Supply vs Sales Analysis:
- Select your desired filter (By Month, By Year, or Overall)
- The analysis summary cards show:
  - Total Profit for the selected period
  - Profit Margin percentage
  - Average Profit per period
- This helps you analyze profitability for different time frames

**Q58: What happens if I try to process a sale with insufficient stock?**

A: The system prevents this:
- Cart quantities are automatically adjusted if stock becomes insufficient
- You'll see warnings about stock availability
- Items with zero stock are removed from cart automatically
- You cannot process a sale if any item has insufficient stock
- Check stock levels before processing sales

**Q59: How do I see the total value of my inventory?**

A: The Dashboard shows a "Total Stock Value" card that displays the total monetary value of all inventory. This is calculated based on:
- Current stock quantities
- Supplier prices
- All variants across all products

**Q60: What information do I need to create a new product?**

A: Minimum required information:
- **Product Name**: Required
- **Category**: Required (select existing or create new)
- **Unit**: Required (for the first variant)

Optional information:
- Description
- Product Image
- Variant details (size, color, dimension, etc.)
- Prices (can be set per variant)

---

## 9. Troubleshooting Guide

### Common Issues and Solutions

**Issue 1: Cannot log in after password reset**

**Solution**: 
- Ensure you're using the new password
- Check that caps lock is off
- Clear browser cache and cookies
- Try using "Forgot Password" again if the reset link expired

**Issue 2: Email verification not received**

**Solution**:
- Check spam/junk folder
- Verify email address is correct
- Click "Resend Verification Email"
- Wait a few minutes (email delivery can be delayed)
- Contact administrator if issue persists

**Issue 3: Products not showing in search**

**Solution**:
- Clear search filters
- Check category filter (set to "All")
- Verify product name spelling
- Refresh the page
- Check if product is active/available

**Issue 4: Cart not updating**

**Solution**:
- Refresh the page
- Check internet connection
- Clear browser cache
- Close and reopen cart
- Remove and re-add items if needed

**Issue 5: Cannot add items to cart**

**Solution**:
- Check if item is in stock
- Verify you're logged in
- Check if variant is selected (for products with variants)
- Refresh the page
- Try a different browser

**Issue 6: Dashboard charts not loading**

**Solution**:
- Check internet connection
- Refresh the page
- Clear browser cache
- Check browser console for errors
- Try a different browser
- Contact administrator if issue persists

**Issue 7: Cannot export sales data**

**Solution**:
- Ensure you have admin or cashier role
- Check that filters are not too restrictive (no results)
- Verify browser allows downloads
- Try a different browser
- Check file download permissions

**Issue 8: Supply history not showing deleted product names**

**Solution**:
- This should not happen - product names are preserved
- If you see "Unknown", it may be a very old record
- Contact administrator to verify system version
- Check if the record was created before the preservation feature

**Issue 9: Variant conversion not working**

**Solution**:
- Verify source variant has stock
- Check conversion quantity is set correctly
- Ensure "Allow conversion" checkbox is checked
- Verify source variant is selected
- Check if source variant was deleted (would set quantity to 0)

**Issue 10: Real-time updates not working**

**Solution**:
- Check internet connection
- Verify WebSocket connection (check browser console)
- Refresh the page
- Check if firewall is blocking WebSocket connections
- Try a different network

---

## 10. Keyboard Shortcuts and Tips

### Navigation Tips

- Use browser back/forward buttons to navigate
- Click on logo/brand name to return to home/dashboard
- Use search bars for quick access to items
- Use category filters to narrow down product lists

### Efficiency Tips

- **For Cashiers**: 
  - Keep POS page open for quick transactions
  - Use search to quickly find products
  - Memorize common product names for faster entry

- **For Admins**:
  - Use dashboard filters to analyze specific time periods
  - Export sales data regularly for backup
  - Monitor low stock alerts daily
  - Review supply vs sales analysis weekly

- **For Customers**:
  - Use category filters to browse efficiently
  - Save product names for quick search
  - Check reservation status regularly

### Best Practices

1. **Regular Backups**: Export sales data regularly (admins)
2. **Stock Monitoring**: Check low stock alerts daily
3. **Data Entry**: Enter accurate supplier prices for better analytics
4. **Inventory Management**: Update product information regularly
5. **User Management**: Review user roles periodically
6. **Category Organization**: Maintain clear category structure

---

## 11. System Limitations and Notes

### Known Limitations

1. **File Upload Size**: Product images have size limitations (check with administrator)
2. **Export Limits**: Large sales exports may take time to generate
3. **Real-time Updates**: Requires active internet connection
4. **Browser Compatibility**: Some features may work better in Chrome/Edge
5. **Mobile Experience**: Some advanced features optimized for desktop

### Important Notes

- Product deletion is permanent and cannot be undone
- Data export files are in CSV format (compatible with Excel)
- Email delivery depends on email service provider
- WebSocket connections may drop on unstable networks
- System performance may vary with large datasets

### Data Retention

- Sales records are kept indefinitely
- Supply history is kept indefinitely
- Reservation records are kept indefinitely
- User accounts remain until manually deleted
- Deleted products/variants: names preserved in historical records

---

## 12. Contact and Support

### Getting Help

If you encounter issues or need assistance:

1. **Check this manual** for common solutions
2. **Review the FAQ section** for answers to common questions
3. **Contact your system administrator** for:
   - Account issues
   - Role assignments
   - System configuration
   - Technical problems
   - Feature requests

### Reporting Issues

When reporting issues, please provide:
- Your user role
- Description of the problem
- Steps to reproduce
- Browser and version
- Screenshots (if applicable)
- Error messages (if any)

### Feature Requests

For new feature requests:
- Contact your system administrator
- Provide detailed description of desired feature
- Explain the business need or use case
- Be patient - features are evaluated and prioritized

---

## 13. Glossary of Terms

**Admin**: User with full system access and management capabilities

**Cashier**: User who can process sales and manage reservations

**Category**: Classification system for organizing products

**Conversion**: Automatic stock transfer between related variants

**Customer/User**: Regular user who can browse products and make reservations

**Dashboard**: Main analytics and overview page for admins

**Inventory**: Complete list of all products and their stock levels

**POS (Point of Sale)**: System for processing direct sales transactions

**Product**: Main item in the inventory system

**Reservation**: Customer order that is pending completion

**Sale**: Completed transaction record

**Supply History**: Record of all inventory additions and stock updates

**Variant**: Different version of a product (size, color, unit, etc.)

**WebSocket**: Technology enabling real-time data updates

---

## 14. Version History

**Version 2.0** (Current)
- Enhanced data persistence for sales and supply history
- Variant conversion capabilities
- Supply vs Sales analysis with multiple filter options
- Mobile-optimized shopping cart interface
- Improved sales trends with timezone handling
- Real-time cart synchronization
- Enhanced dashboard analytics
- Improved reservation management
- Historical data preservation features

---

## 15. Appendix

### A. Password Requirements

Your password must contain:
- At least 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&* etc.)

### B. Supported Unit Types

- pcs (pieces)
- kg (kilograms)
- g (grams)
- lb (pounds)
- m (meters)
- cm (centimeters)
- ft (feet)
- set
- W (Watts)
- V (Volts)
- amphere
- gang
- box
- pack
- roll
- Wey

### C. Reservation Statuses

- **Pending**: Awaiting store confirmation
- **Confirmed**: Ready for customer pickup
- **Completed**: Successfully picked up (converted to sale)
- **Cancelled**: Reservation cancelled

### D. Sale Statuses

- **Paid**: Full payment received
- **Partial**: Partial payment received
- **Returned**: Sale was returned, items back in inventory

### E. Sale Types

- **POS**: Direct sale through Point of Sale system
- **Reservation**: Sale converted from a customer reservation

---

**End of User Manual**

*Thank you for using Hardware Tech!*

*For the most up-to-date information, please refer to your system administrator or the latest version of this manual.*

