using Microsoft.EntityFrameworkCore;
using SORMS.API.Data;
using SORMS.API.DTOs;
using SORMS.API.Interfaces;
using SORMS.API.Models;

namespace SORMS.API.Services
{
    public class RoomService : IRoomService
    {
        private readonly SormsDbContext _context;

        public RoomService(SormsDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RoomDto>> GetAllRoomsAsync()
        {
            var rooms = await _context.Rooms.ToListAsync();
            var currentTime = DateTime.UtcNow;
            
            var activeBookings = await _context.CheckInRecords
                .Include(c => c.Resident)
                .Where(c => c.Status != "Rejected" && c.Status != "CheckedOut" && c.ExpectedCheckInDate != null && c.ExpectedCheckOutDate != null)
                .Where(c => c.Status == "CheckedIn" || (c.ExpectedCheckInDate <= currentTime && c.ExpectedCheckOutDate >= currentTime))
                .ToListAsync();

            var activeBookingDict = activeBookings.GroupBy(b => b.RoomId).ToDictionary(g => g.Key, g => g.First());

            return rooms.Select(r => {
                var isOccupied = activeBookingDict.TryGetValue(r.Id, out var booking);
                var dynStatus = isOccupied ? "Occupied" : (r.Status == "Maintenance" ? "Maintenance" : "Available");
                var dynResident = isOccupied ? booking?.Resident?.FullName : (r.Status == "Occupied" ? r.CurrentResident : null);

                return new RoomDto
                {
                    Id = r.Id,
                    RoomNumber = r.RoomNumber,
                    Type = r.Type,
                    RoomType = r.Type,
                    Floor = r.Floor,
                    MonthlyRent = r.MonthlyRent,
                    Area = r.Area,
                    Status = dynStatus,
                    MaintenanceEndDate = r.MaintenanceEndDate,
                    CurrentResident = dynResident,
                    Description = r.Description,
                    ImageUrl = r.ImageUrl,
                    IsActive = r.IsActive
                };
            });
        }

        public async Task<RoomDto> GetRoomByIdAsync(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return null;

            var currentTime = DateTime.UtcNow;
            var activeBooking = await _context.CheckInRecords
                .Include(c => c.Resident)
                .Where(c => c.RoomId == id && c.Status != "Rejected" && c.Status != "CheckedOut" && c.ExpectedCheckInDate != null && c.ExpectedCheckOutDate != null)
                .Where(c => c.Status == "CheckedIn" || (c.ExpectedCheckInDate <= currentTime && c.ExpectedCheckOutDate >= currentTime))
                .FirstOrDefaultAsync();

            var isOccupied = activeBooking != null;
            var dynStatus = isOccupied ? "Occupied" : (room.Status == "Maintenance" ? "Maintenance" : "Available");
            var dynResident = isOccupied ? activeBooking?.Resident?.FullName : (room.Status == "Occupied" ? room.CurrentResident : null);

            return new RoomDto
            {
                Id = room.Id,
                RoomNumber = room.RoomNumber,
                Type = room.Type,
                RoomType = room.Type, // Alias
                Floor = room.Floor,
                MonthlyRent = room.MonthlyRent,
                Area = room.Area,
                Status = dynStatus,
                MaintenanceEndDate = room.MaintenanceEndDate,
                CurrentResident = dynResident,
                Description = room.Description,
                ImageUrl = room.ImageUrl,
                IsActive = room.IsActive
            };
        }

        public async Task<RoomDto> CreateRoomAsync(RoomDto roomDto)
        {
            var room = new Room
            {
                RoomNumber = roomDto.RoomNumber,
                Type = roomDto.Type,
                Floor = roomDto.Floor,
                MonthlyRent = roomDto.MonthlyRent,
                Area = roomDto.Area,
                Status = roomDto.Status,
                MaintenanceEndDate = roomDto.MaintenanceEndDate,
                Description = roomDto.Description,
                ImageUrl = roomDto.ImageUrl,
                CurrentResident = roomDto.CurrentResident,
                IsActive = roomDto.IsActive
            };

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            roomDto.Id = room.Id;
            return roomDto;
        }

        public async Task<bool> UpdateRoomAsync(int id, RoomDto roomDto)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return false;

            // Validate status changes
            if (room.Status == "Occupied" && roomDto.Status == "Maintenance")
            {
                throw new InvalidOperationException("Cannot set an occupied room to maintenance status directly.");
            }
            if (room.Status == "Maintenance" && roomDto.Status != "Maintenance" && roomDto.MaintenanceEndDate > DateTime.UtcNow)
            {
                throw new InvalidOperationException("Cannot change status from maintenance if maintenance end date is in the future.");
            }

            room.RoomNumber = roomDto.RoomNumber;
            room.Type = roomDto.Type;
            room.Floor = roomDto.Floor;
            room.MonthlyRent = roomDto.MonthlyRent;
            room.Area = roomDto.Area;
            room.Status = roomDto.Status;
            room.MaintenanceEndDate = roomDto.MaintenanceEndDate;
            room.Description = roomDto.Description;
            room.ImageUrl = roomDto.ImageUrl;
            room.CurrentResident = roomDto.CurrentResident;
            room.IsActive = roomDto.IsActive;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteRoomAsync(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return false;

            // Kiểm tra xem phòng có đang được thuê không
            if (room.Status == "Occupied")
                throw new InvalidOperationException("Khong the xoa phong dang co nguoi thue.");

            // Kiểm tra xem có lịch sử check-in không
            var hasCheckInHistory = await _context.CheckInRecords.AnyAsync(c => c.RoomId == id);

            if (hasCheckInHistory)
            {
                // Nếu có lịch sử -> Soft Delete (giữ lại dữ liệu)
                room.IsActive = false;
                room.Status = "Maintenance"; // Logically hide it
                _context.Rooms.Update(room);
            }
            else
            {
                // Nếu không có lịch sử gì -> Hard Delete (xóa hẳn khỏi database)
                _context.Rooms.Remove(room);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<RoomDto>> GetAvailableRoomsAsync(DateTime? checkInDate = null, DateTime? checkOutDate = null)
        {
            var query = _context.Rooms.Where(r => r.IsActive).AsQueryable();

            DateTime targetCheckIn = checkInDate ?? DateTime.UtcNow;
            DateTime targetCheckOut = checkOutDate ?? DateTime.UtcNow;

            // Find rooms that ARE NOT available
            var bookedRoomIds = await _context.CheckInRecords
                .Where(c => c.Status != "Rejected" && c.Status != "CheckedOut" && c.ExpectedCheckInDate != null && c.ExpectedCheckOutDate != null)
                .Where(c => (c.ExpectedCheckInDate < targetCheckOut && c.ExpectedCheckOutDate > targetCheckIn) || (c.Status == "CheckedIn" && targetCheckIn < DateTime.UtcNow.AddHours(1))) // If currently checked in and we are looking at 'now'
                .Select(c => c.RoomId)
                .Distinct()
                .ToListAsync();

            query = query.Where(r => !bookedRoomIds.Contains(r.Id)); 
            query = query.Where(r => r.Status != "Maintenance");

            var availableRooms = await query.ToListAsync();

            return availableRooms.Select(r => new RoomDto
            {
                Id = r.Id,
                RoomNumber = r.RoomNumber,
                Type = r.Type,
                RoomType = r.Type, // Alias
                Floor = r.Floor,
                MonthlyRent = r.MonthlyRent,
                Area = r.Area,
                Status = "Available",
                MaintenanceEndDate = r.MaintenanceEndDate,
                CurrentResident = string.Empty,
                Description = r.Description,
                ImageUrl = r.ImageUrl,
                IsActive = r.IsActive
            });
        }
    }
}
