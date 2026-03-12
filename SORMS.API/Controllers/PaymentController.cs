using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
// using Net.payOS.Types;
// using Net.payOS;
using SORMS.API.Data;
using SORMS.API.Models;
using System.Security.Claims;

namespace SORMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        // private readonly PayOS _payOS;
        private readonly SormsDbContext _context;

        public PaymentController(SormsDbContext context)
        {
            // _payOS = payOS;
            _context = context;
        }

        [HttpGet("my-invoices")]
        public async Task<IActionResult> GetMyInvoices()
        {
            try
            {
                var userIdString = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (!int.TryParse(userIdString, out int userId))
                {
                    return Unauthorized("User ID not found or invalid.");
                }

                var resident = await _context.Residents.FirstOrDefaultAsync(r => r.UserId == userId);
                if (resident == null)
                    return BadRequest("User is not a resident.");

                var invoices = await _context.Invoices
                    .Where(i => i.ResidentId == resident.Id)
                    .OrderByDescending(i => i.CreatedAt)
                    .Select(i => new {
                        i.Id,
                        i.ResidentId,
                        i.RoomId,
                        i.Amount,
                        i.Description,
                        i.Status,
                        i.PayOSOrderId,
                        i.CheckoutUrl,
                        i.CreatedAt,
                        i.PaidAt
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = invoices });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("create-payment-link/{invoiceId}")]
        public async Task<IActionResult> CreatePaymentLink(int invoiceId)
        {
            try
            {
                var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == invoiceId);
                if (invoice == null)
                {
                    return NotFound(new { message = "Invoice not found" });
                }

                if (invoice.Status == "Paid")
                {
                    return BadRequest(new { message = "Invoice is already paid" });
                }

                int orderCode = int.Parse(DateTimeOffset.Now.ToString("ffffff") + invoice.Id.ToString());
                invoice.PayOSOrderId = orderCode;
                
                var domain = "http://localhost:5173"; // Default Vite local port

                // Temporarily disabled due to missing Net.payOS package
                /*
                ItemData item = new ItemData(invoice.Description, 1, (int)invoice.Amount);
                List<ItemData> items = new List<ItemData>();
                items.Add(item);

                PaymentData paymentData = new PaymentData(
                    orderCode: orderCode,
                    amount: (int)invoice.Amount,
                    description: invoice.Description.Length > 25 ? invoice.Description.Substring(0, 25) : invoice.Description, 
                    items: items,
                    cancelUrl: $"{domain}/resident/invoices?cancel=true",
                    returnUrl: $"{domain}/resident/invoices?success=true"
                );

                CreatePaymentResult createPayment = await _payOS.createPaymentLink(paymentData);
                
                invoice.CheckoutUrl = createPayment.checkoutUrl;
                */

                invoice.CheckoutUrl = $"{domain}/resident/invoices?success=true&demo=true"; // mock URL
                await _context.SaveChangesAsync();

                return Ok(new { 
                    checkoutUrl = invoice.CheckoutUrl, 
                    orderCode = orderCode,
                    message = "Payment link creation is temporarily mocked." 
                });
            }
            catch (Exception exception)
            {
                return BadRequest(new { message = exception.Message });
            }
        }

        [HttpPost("payos_transfer_handler")]
        public async Task<IActionResult> PayOSTransferHandler([FromBody] object body) // Changed from WebhookType
        {
            try
            {
                /* 
                WebhookData data = _payOS.verifyPaymentWebhookData(body);
                
                if (data.code == "00") // Success
                {
                    var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.PayOSOrderId == data.orderCode);
                    if (invoice != null && invoice.Status != "Paid")
                    {
                        invoice.Status = "Paid";
                        invoice.PaidAt = DateTime.Now;
                        await _context.SaveChangesAsync();
                    }
                    return Ok(new { success = true });
                }
                */
                return Ok(new { success = true, temp_msg = "Webhook disabled" });
            }
            catch (Exception e)
            {
                return BadRequest(new { success = false, message = e.Message });
            }
        }
    }
}
