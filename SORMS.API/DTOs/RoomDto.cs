namespace SORMS.API.DTOs
{
    public class RoomDto
    {
        public int Id { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string RoomType { get; set; } = string.Empty; // Alias for Type
        public int Floor { get; set; }
        public decimal MonthlyRent { get; set; }
        public decimal Area { get; set; }
        public string Status { get; set; } = "Available"; // Available, Occupied, Maintenance
        public DateTime? MaintenanceEndDate { get; set; }
        public string? CurrentResident { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
