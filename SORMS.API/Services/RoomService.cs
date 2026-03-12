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

            return rooms.Select(r => new RoomDto
            {
                Id = r.Id,
                RoomNumber = r.RoomNumber,
                Type = r.Type,
                RoomType = r.Type, // Alias
                Floor = r.Floor,
                MonthlyRent = r.MonthlyRent,
                Area = r.Area,
                Status = r.Status,
                MaintenanceEndDate = r.MaintenanceEndDate,
                CurrentResident = r.CurrentResident,
                Description = r.Description,
                ImageUrl = r.ImageUrl,
                IsActive = r.IsActive
            });
        }

        public async Task<RoomDto> GetRoomByIdAsync(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return null;

            return new RoomDto
            {
                Id = room.Id,
                RoomNumber = room.RoomNumber,
                Type = room.Type,
                RoomType = room.Type, // Alias
                Floor = room.Floor,
                MonthlyRent = room.MonthlyRent,
                Area = room.Area,
                Status = room.Status,
                MaintenanceEndDate = room.MaintenanceEndDate,
                CurrentResident = room.CurrentResident,
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

        public async Task<IEnumerable<RoomDto>> GetAvailableRoomsAsync()
        {
            var availableRooms = await _context.Rooms
                .Where(r => r.Status == "Available" && r.IsActive)
                .ToListAsync();

            return availableRooms.Select(r => new RoomDto
            {
                Id = r.Id,
                RoomNumber = r.RoomNumber,
                Type = r.Type,
                RoomType = r.Type, // Alias
                Floor = r.Floor,
                MonthlyRent = r.MonthlyRent,
                Area = r.Area,
                Status = r.Status,
                MaintenanceEndDate = r.MaintenanceEndDate,
                CurrentResident = r.CurrentResident,
                Description = r.Description,
                ImageUrl = r.ImageUrl,
                IsActive = r.IsActive
            });
        }
    }
}
