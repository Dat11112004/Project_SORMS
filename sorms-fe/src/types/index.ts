// ===== Auth =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  userName: string;
  password: string;
  roleId: number;
  fullName?: string;
  phone?: string;
  identityNumber?: string;
  address?: string;
  emergencyContact?: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  userRole: string;
  username: string;
  email: string;
  message?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateEmailRequest {
  email: string;
}

export interface UserDto {
  id: number;
  username: string;
  role: string;
  roleName: string;
  email: string;
  isActive: boolean;
}

// ===== Resident =====
export interface ResidentDto {
  id: number;
  userId?: number;
  fullName: string;
  email: string;
  phone: string;
  phoneNumber: string;
  identityNumber: string;
  role?: string;
  roomId?: number;
  roomNumber?: string;
  checkInDate?: string;
  checkOutDate?: string;
  isActive?: boolean;
  address?: string;
  emergencyContact?: string;
  notes?: string;
  gender?: string;
  dateOfBirth?: string;
  createdAt?: string;
}

export interface UpdateResidentProfileRequest {
  address?: string;
  emergencyContact?: string;
  notes?: string;
}

export interface UpdateResidentAccountRequest {
  email: string;
  phone: string;
}

// ===== Room =====
export interface RoomDto {
  id: number;
  roomNumber: string;
  type: string;
  roomType: string;
  floor: number;
  monthlyRent: number;
  area: number;
  isOccupied: boolean;
  isAvailable: boolean;
  currentResident?: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

// ===== Check-In =====
export interface CheckInRecordDto {
  id: number;
  residentId: number;
  residentName: string;
  roomId: number;
  roomNumber: string;
  requestTime: string;
  approvedTime?: string;
  checkInTime?: string;
  checkOutRequestTime?: string;
  checkOutTime?: string;
  status: string;
  rejectReason?: string;
  approvedBy?: number;
  approvedByName?: string;
  requestType: string;
}

export interface CreateCheckInRequest {
  roomId: number;
}

export interface CreateCheckOutRequest {
  checkInRecordId: number;
}

export interface ApproveCheckInRequest {
  requestId: number;
  isApproved: boolean;
  rejectReason?: string;
}

// ===== Service Request =====
export interface ServiceRequestDto {
  id: number;
  title: string;
  serviceType: string;
  description: string;
  requestDate: string;
  status: string;
  residentId: number;
  residentName?: string;
  staffFeedback?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  completedDate?: string;
  lastUpdated: string;
  priority: string;
}

export interface CreateServiceRequest {
  title: string;
  serviceType: string;
  description: string;
  priority?: string;
}

export interface UpdateServiceRequest {
  title: string;
  serviceType: string;
  description: string;
  priority: string;
}

export interface ReviewServiceRequest {
  status: string;
  staffFeedback: string;
}

// ===== Notification =====
export interface NotificationDto {
  id: number;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: string;
  targetRole?: string;
  residentId?: number;
  staffId?: number;
}

export interface CreateBroadcastNotification {
  message: string;
  targetRole: string;
}

export interface CreateIndividualNotification {
  message: string;
  residentId: number;
}

// ===== Report =====
export interface ReportDto {
  id: number;
  title: string;
  content: string;
  generatedDate: string;
  createdBy: string;
  staffId?: number;
  status: string;
  adminFeedback?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  lastUpdated: string;
}

export interface CreateReportRequest {
  title: string;
  content: string;
}

export interface UpdateReportRequest {
  title: string;
  content: string;
}

export interface ReviewReportRequest {
  status: string;
  adminFeedback: string;
}

// ===== Staff =====
export interface StaffDto {
  id: number;
  fullName: string;
  email: string;
  phone: string;
}

// ===== API Wrappers =====
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
