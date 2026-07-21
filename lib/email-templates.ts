interface EmailLineItem {
  title: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationInput {
  orderNumber: string;
  items: EmailLineItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: { name: string; line1: string; city: string; state: string; zip: string; country: string };
}

function money(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function orderConfirmationEmail(input: OrderConfirmationInput): string {
  const rows = input.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;color:#1c1f26;">${item.title} × ${item.quantity}</td>
        <td style="padding:8px 0;text-align:right;color:#1c1f26;">${money(item.price * item.quantity)}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#1c1f26;">
    <h1 style="font-size:20px;">Thanks for your order!</h1>
    <p style="color:#565d6b;font-size:14px;">Order <strong>${input.orderNumber}</strong> is confirmed and will be on its way soon.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px;">
      ${rows}
      <tr><td style="padding-top:12px;color:#565d6b;">Subtotal</td><td style="padding-top:12px;text-align:right;">${money(input.subtotal)}</td></tr>
      <tr><td style="color:#565d6b;">Shipping</td><td style="text-align:right;">${input.shipping === 0 ? "Free" : money(input.shipping)}</td></tr>
      <tr><td style="color:#565d6b;">Tax</td><td style="text-align:right;">${money(input.tax)}</td></tr>
      <tr><td style="padding-top:8px;font-weight:700;border-top:1px solid #e4e7ec;">Total</td><td style="padding-top:8px;font-weight:700;text-align:right;border-top:1px solid #e4e7ec;">${money(input.total)}</td></tr>
    </table>
    <h2 style="font-size:14px;margin-top:24px;">Shipping to</h2>
    <p style="color:#565d6b;font-size:14px;">
      ${input.shippingAddress.name}<br/>
      ${input.shippingAddress.line1}<br/>
      ${input.shippingAddress.city}, ${input.shippingAddress.state} ${input.shippingAddress.zip}
    </p>
    <p style="color:#8a92a3;font-size:12px;margin-top:24px;">Baruashop</p>
  </div>`;
}
