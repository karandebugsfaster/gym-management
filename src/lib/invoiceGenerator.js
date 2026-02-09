// Invoice generation utility for creating PDF invoices
export function generateInvoiceHTML(invoiceData) {
  const {
    invoiceNumber,
    date,
    gymName,
    gymAddress,
    gymPhone,
    gymEmail,
    memberName,
    memberId,
    memberPhone,
    memberEmail,
    planName,
    planPrice,
    discount,
    finalPrice,
    amountPaid,
    dueAmount,
    paymentMode,
    membershipStartDate,
    membershipEndDate,
  } = invoiceData

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .invoice-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .invoice-title { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
    .invoice-number { font-size: 14px; opacity: 0.9; }
    .company-info { margin-bottom: 30px; }
    .company-name { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 5px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .info-section h3 { 
      font-size: 12px; 
      text-transform: uppercase; 
      color: #888; 
      margin-bottom: 10px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .info-section p { margin: 5px 0; font-size: 14px; }
    .table-container { margin: 30px 0; }
    table { width: 100%; border-collapse: collapse; }
    th { 
      background: #f7fafc; 
      padding: 12px; 
      text-align: left; 
      font-size: 12px; 
      text-transform: uppercase;
      color: #666;
      font-weight: 600;
      border-bottom: 2px solid #e2e8f0;
    }
    td { padding: 15px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .total-section { 
      margin-top: 30px; 
      padding: 20px; 
      background: #f7fafc; 
      border-radius: 10px;
    }
    .total-row { 
      display: flex; 
      justify-content: space-between; 
      padding: 8px 0;
      font-size: 14px;
    }
    .total-row.final { 
      font-size: 20px; 
      font-weight: bold; 
      color: #667eea;
      padding-top: 15px;
      border-top: 2px solid #cbd5e0;
      margin-top: 10px;
    }
    .payment-badge {
      display: inline-block;
      padding: 4px 12px;
      background: #48bb78;
      color: white;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #888;
      font-size: 12px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div class="invoice-title">INVOICE</div>
    <div class="invoice-number">#${invoiceNumber}</div>
  </div>

  <div class="company-info">
    <div class="company-name">${gymName}</div>
    <p>${gymAddress || ''}</p>
    <p>Phone: ${gymPhone || 'N/A'} | Email: ${gymEmail || 'N/A'}</p>
  </div>

  <div class="info-grid">
    <div class="info-section">
      <h3>Bill To</h3>
      <p><strong>${memberName}</strong></p>
      <p>Member ID: ${memberId}</p>
      <p>Phone: ${memberPhone}</p>
      ${memberEmail ? `<p>Email: ${memberEmail}</p>` : ''}
    </div>
    <div class="info-section" style="text-align: right;">
      <h3>Invoice Details</h3>
      <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-IN')}</p>
      <p><strong>Payment Mode:</strong> <span class="payment-badge">${paymentMode}</span></p>
    </div>
  </div>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Period</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${planName}</strong></td>
          <td>${new Date(membershipStartDate).toLocaleDateString('en-IN')} - ${new Date(membershipEndDate).toLocaleDateString('en-IN')}</td>
          <td style="text-align: right;">₹${planPrice.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="total-section">
    <div class="total-row">
      <span>Subtotal</span>
      <span>₹${planPrice.toLocaleString()}</span>
    </div>
    ${discount > 0 ? `
    <div class="total-row" style="color: #e53e3e;">
      <span>Discount</span>
      <span>- ₹${discount.toLocaleString()}</span>
    </div>
    ` : ''}
    <div class="total-row final">
      <span>Total Amount</span>
      <span>₹${finalPrice.toLocaleString()}</span>
    </div>
    <div class="total-row" style="color: #48bb78;">
      <span>Amount Paid</span>
      <span>₹${amountPaid.toLocaleString()}</span>
    </div>
    ${dueAmount > 0 ? `
    <div class="total-row" style="color: #ed8936; font-weight: 600;">
      <span>Due Amount</span>
      <span>₹${dueAmount.toLocaleString()}</span>
    </div>
    ` : ''}
  </div>

  <div class="footer">
    <p><strong>Thank you for your membership!</strong></p>
    <p>This is a computer-generated invoice. No signature required.</p>
    <p style="margin-top: 20px;">For any queries, please contact us at ${gymPhone || gymEmail || 'your gym'}</p>
  </div>
</body>
</html>
  `
}

// Function to trigger invoice download
export function downloadInvoice(invoiceData) {
  const html = generateInvoiceHTML(invoiceData)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Invoice-${invoiceData.invoiceNumber}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Function to print invoice
export function printInvoice(invoiceData) {
  const html = generateInvoiceHTML(invoiceData)
  const printWindow = window.open('', '_blank')
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}