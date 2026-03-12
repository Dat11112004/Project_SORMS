using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SORMS.API.DTOs
{
    public class FoodItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; }
    }

    public class CreateFoodItemDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; }
        public string? Description { get; set; }
        [Required]
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; } = true;
    }

    public class FoodOrderDto
    {
        public int Id { get; set; }
        public int ResidentId { get; set; }
        public string ResidentName { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public List<FoodOrderItemDto> Items { get; set; } = new List<FoodOrderItemDto>();
    }

    public class FoodOrderItemDto
    {
        public int Id { get; set; }
        public int FoodItemId { get; set; }
        public string FoodName { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }

    public class CreateFoodOrderRequest
    {
        public List<OrderItemRequest> Items { get; set; }
    }

    public class OrderItemRequest
    {
        public int FoodItemId { get; set; }
        public int Quantity { get; set; }
    }
    
    public class UpdateFoodOrderStatusRequest
    {
        public string Status { get; set; } // Preparing, Delivered, Cancelled
    }
}
