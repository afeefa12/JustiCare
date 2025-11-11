# Backend API Suggestions and Fixes

Based on the frontend implementation, here are recommended changes for the backend:

## 1. **Fix SendOtp Endpoint Parameter**

**Current Issue:**
```csharp
[HttpPost("send-otp")]
public async Task<IActionResult> SendOtp([FromBody] string email)
```

**Problem:** `[FromBody] string email` doesn't work properly with JSON. ASP.NET Core expects complex types for `[FromBody]`.

**Recommended Fix:**
```csharp
[HttpPost("send-otp")]
public async Task<IActionResult> SendOtp([FromBody] OtpRequestDto dto)
{
    try
    {
        await _auth.SendOtpAsync(dto.Email);
        return Ok(new ApiResponse<string>(null, "OTP resent successfully.", "200"));
    }
    catch (Exception ex)
    {
        return BadRequest(new ApiResponse<string>(null, ex.Message, "400"));
    }
}
```

**Or alternatively:**
```csharp
[HttpPost("send-otp")]
public async Task<IActionResult> SendOtp([FromQuery] string email)
{
    // Use query parameter instead
}
```

## 2. **Implement SendOtpAsync Method**

**Current Issue:**
```csharp
public Task SendOtpAsync(string email)
{
    throw new NotImplementedException();
}
```

**Recommended Implementation:**
```csharp
public async Task SendOtpAsync(string email)
{
    // Option 1: Send OTP to existing user (after registration)
    var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
    if (user == null)
    {
        // Option 2: Send OTP to pending registration in Otp table
        var pendingOtp = await _db.Otp.FirstOrDefaultAsync(o => o.Email == email);
        if (pendingOtp == null)
            throw new UnauthorizedAccessException("Email not found.");
        
        // Update existing OTP
        var otp = new Random().Next(100000, 999999).ToString();
        pendingOtp.OTP = otp;
        pendingOtp.OTPExpireTime = DateTime.UtcNow.AddMinutes(5);
        await _db.SaveChangesAsync();
        await _emailService.SendOtpEmailAsync(email, otp);
        return;
    }
    
    // Resend OTP for existing user (if needed for password reset, etc.)
    var newOtp = new Random().Next(100000, 999999).ToString();
    // Store OTP appropriately (you may need an OTP table or user field)
    await _emailService.SendOtpEmailAsync(email, newOtp);
}
```

## 3. **Role Naming Consistency**

**Issue:** Backend uses `userRoles.User` which might be stored as "User", but frontend expects "Client" in some places.

**Recommendation:** 
- Keep backend enum as is (`userRoles.User`)
- Ensure frontend maps "User" to "Client" for display (already implemented)
- OR update backend to use `userRoles.Client` instead of `userRoles.User`

## 4. **Lawyer Registration OTP**

**Current Issue:** Lawyer registration doesn't store OTP in the Otp table before verification.

**Recommended Fix:**
```csharp
public async Task<RegisterResponse> RegisterLawyerAsync(LawyerRegisterDto dto)
{
    if (await _db.Lawyers.AnyAsync(l => l.Email == dto.Email))
        throw new InvalidOperationException("Email already registered.");

    var otp = new Random().Next(100000, 999999).ToString();
    
    // Store in Otp table first
    var otpEntry = new Otp
    {
        Email = dto.Email,
        Username = dto.Username,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
        Role = userRoles.Lawyer,
        OTP = otp,
        OTPExpireTime = DateTime.UtcNow.AddMinutes(5)
    };
    
    await _db.Otp.AddAsync(otpEntry);
    await _db.SaveChangesAsync();
    await _emailService.SendOtpEmailAsync(dto.Email, otp);

    return new RegisterResponse
    {
        Email = dto.Email,
        username = dto.Username
    };
}
```

Then update `VerifyOtpAsync` to handle lawyer registration properly (it seems partially implemented).

## 5. **Error Response Consistency**

Ensure all endpoints return the same `ApiResponse<T>` structure consistently:
- Success: `StatusCode = "200"`, `Message = "..."`, `Data = ...`
- Error: `StatusCode = "400"/"401"/"500"`, `Message = "..."`, `Data = null`

## 6. **Add CORS Configuration**

Make sure CORS is properly configured in `Program.cs` or `Startup.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000") // Vite default port
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// In middleware pipeline
app.UseCors("AllowFrontend");
```

## 7. **Token Storage Recommendation**

Consider storing tokens in HttpOnly cookies instead of localStorage for better security:
- Reduces XSS vulnerability
- More secure for production applications

## 8. **Add Input Validation**

Consider using Data Annotations or FluentValidation:
```csharp
public class UserRegisterDto
{
    [Required]
    [MinLength(3)]
    public string Username { get; set; }
    
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    
    [Required]
    [MinLength(6)]
    public string Password { get; set; }
}
```

## 9. **Improve OTP Expiration Handling**

Consider adding a background job to clean up expired OTP entries:
- Run periodically to remove OTP entries older than 5 minutes
- Keeps the database clean

## 10. **Add Rate Limiting for OTP**

Prevent abuse by adding rate limiting:
- Maximum 3 OTP requests per email per hour
- Prevents spam and reduces email service costs

