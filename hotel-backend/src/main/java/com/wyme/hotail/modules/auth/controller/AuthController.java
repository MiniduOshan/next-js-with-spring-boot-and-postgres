package com.wyme.hotail.modules.auth.controller;

import com.wyme.hotail.core.security.JwtTokenProvider;
import com.wyme.hotail.modules.auth.entity.RefreshToken;
import com.wyme.hotail.modules.auth.entity.UserAccount;
import com.wyme.hotail.modules.auth.repository.RefreshTokenRepository;
import com.wyme.hotail.modules.auth.repository.UserAccountRepository;
import com.wyme.hotail.modules.hotel.entity.HotelProfile;
import com.wyme.hotail.modules.hotel.service.HotelService;
import com.wyme.hotail.modules.auth.service.EmailService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserAccountRepository userAccountRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final HotelService hotelService;
    private final EmailService emailService;

    public AuthController(
            UserAccountRepository userAccountRepository,
            RefreshTokenRepository refreshTokenRepository,
            JwtTokenProvider jwtTokenProvider,
            HotelService hotelService,
            EmailService emailService) {
        this.userAccountRepository = userAccountRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.hotelService = hotelService;
        this.emailService = emailService;
    }

    @PostMapping("/signup")
    @Transactional
    public ResponseEntity<?> signup(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String email = (String) body.get("email");
        String password = (String) body.get("password");
        Boolean isPartner = (Boolean) body.get("isPartner");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        if (password == null || password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }

        String normalizedEmail = email.trim().toLowerCase();

        // Admin account cannot be created using signup form
        if (normalizedEmail.endsWith("admin@yme.lk") || normalizedEmail.equals("admin@yme.lk")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Cannot register an admin account via this form"));
        }

        if (userAccountRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email is already registered"));
        }

        UserAccount user = new UserAccount();
        user.setName(name);
        user.setEmail(normalizedEmail);
        user.setPassword(password); // Simple storage as in demo or plaintext check
        user.setIsPartner(isPartner != null && isPartner);
        user.setIsAdmin(false);
        user.setVerified(false);

        // Generate verification code
        String code = String.format("%06d", new Random().nextInt(1000000));
        user.setVerificationCode(code);
        System.out.println("VERIFICATION CODE FOR EMAIL " + normalizedEmail + ": " + code);
        emailService.sendVerificationCode(normalizedEmail, code);

        if (user.getIsPartner()) {
            Map<String, String> hotelDetails = (Map<String, String>) body.get("hotelDetails");
            String hotelName = hotelDetails != null ? hotelDetails.get("hotelName") : "My Property";
            String hotelCity = hotelDetails != null ? hotelDetails.get("hotelCity") : "Colombo";
            String hotelPhone = hotelDetails != null ? hotelDetails.get("hotelPhone") : "";

            user.setHotelName(hotelName);
            user.setHotelCity(hotelCity);
            user.setHotelPhone(hotelPhone);
            user.setHotelStatus("pending");
        }


        userAccountRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Signup successful. Please verify email.",
                "debugVerificationCode", code
        ));
    }

    @PostMapping("/verify")
    @Transactional
    public ResponseEntity<?> verify(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");

        if (email == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and code are required"));
        }

        Optional<UserAccount> userOpt = userAccountRepository.findByEmailIgnoreCase(email.trim().toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        UserAccount user = userOpt.get();
        if (user.getVerificationCode() != null && user.getVerificationCode().equals(code.trim())) {
            user.setVerified(true);
            user.setVerificationCode(null);
            userAccountRepository.save(user);

            // Create property profile only after verification is successful
            if (user.getIsPartner()) {
                hotelService.getOrCreateHotelProfile(
                        user.getEmail(),
                        user.getHotelName() != null ? user.getHotelName() : "My Property",
                        user.getHotelCity() != null ? user.getHotelCity() : "Colombo",
                        user.getHotelPhone() != null ? user.getHotelPhone() : ""
                );
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Email verified successfully"));
        }


        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid verification code"));
    }

    @PostMapping("/forgot-password")
    @Transactional
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        String normalizedEmail = email.trim().toLowerCase();
        Optional<UserAccount> userOpt = userAccountRepository.findByEmailIgnoreCase(normalizedEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        UserAccount user = userOpt.get();
        // Generate reset code
        String code = String.format("%06d", new Random().nextInt(1000000));
        user.setVerificationCode(code);
        userAccountRepository.save(user);

        System.out.println("PASSWORD RESET CODE FOR EMAIL " + normalizedEmail + ": " + code);
        emailService.sendPasswordResetCode(normalizedEmail, code);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Reset code generated successfully.",
                "debugResetCode", code
        ));
    }

    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        String newPassword = body.get("newPassword");

        if (email == null || code == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email, code, and a password of at least 6 characters are required"));
        }

        String normalizedEmail = email.trim().toLowerCase();
        Optional<UserAccount> userOpt = userAccountRepository.findByEmailIgnoreCase(normalizedEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        UserAccount user = userOpt.get();
        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code.trim())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid or expired reset code"));
        }

        user.setPassword(newPassword);
        user.setVerificationCode(null);
        userAccountRepository.save(user);

        return ResponseEntity.ok(Map.of("success", true, "message", "Password reset successfully."));
    }


    @PostMapping("/login")
    @Transactional
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletResponse response) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        String normalizedEmail = email.trim().toLowerCase();

        // 1. Try User Accounts in database
        Optional<UserAccount> userOpt = userAccountRepository.findByEmailIgnoreCase(normalizedEmail);
        if (userOpt.isPresent()) {
            UserAccount user = userOpt.get();
            if (!password.equals(user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
            }

            if (!user.getVerified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Email not verified", "requiresVerification", true));
            }

            String role = "ROLE_TRAVELER";
            if (user.getIsAdmin()) {
                role = "ROLE_ADMIN";
            } else if (user.getIsPartner()) {
                role = "ROLE_OWNER";
            }

            String accessToken = jwtTokenProvider.generateToken(user.getEmail(), role);
            String refreshToken = createAndSaveRefreshToken(user.getEmail());

            setRefreshTokenCookie(response, refreshToken);

            Map<String, Object> userProfile = new HashMap<>();
            userProfile.put("id", user.getId().toString());
            userProfile.put("name", user.getName());
            userProfile.put("email", user.getEmail());
            userProfile.put("isPartner", user.getIsPartner());
            userProfile.put("isAdmin", user.getIsAdmin());
            userProfile.put("hotelName", user.getHotelName());
            userProfile.put("hotelCity", user.getHotelCity());
            userProfile.put("hotelPhone", user.getHotelPhone());
            userProfile.put("hotelStatus", user.getHotelStatus());
            userProfile.put("avatarUrl", user.getAvatarUrl());
            userProfile.put("joinedDate", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "Today");

            return ResponseEntity.ok(Map.of("success", true, "accessToken", accessToken, "user", userProfile));
        }

        // 2. Try Hotel Staff (e.g. from existing hotel_staff check)
        try {
            HotelProfile hotel = hotelService.staffLogin(normalizedEmail, password);
            String displayName = normalizedEmail.split("@")[0].replace(".", " ");

            String accessToken = jwtTokenProvider.generateToken(normalizedEmail, "ROLE_STAFF");
            String refreshToken = createAndSaveRefreshToken(normalizedEmail);

            setRefreshTokenCookie(response, refreshToken);

            Map<String, Object> staffUser = Map.of(
                    "id", "staff-" + normalizedEmail,
                    "name", displayName,
                    "email", normalizedEmail,
                    "isPartner", false,
                    "isStaff", true,
                    "staffRole", "manager",
                    "hotelStatus", "approved",
                    "avatarUrl", "https://api.dicebear.com/7.x/initials/svg?seed=" + displayName,
                    "joinedDate", "Today"
            );

            return ResponseEntity.ok(Map.of("success", true, "accessToken", accessToken, "user", staffUser, "hotel", hotel));
        } catch (Exception e) {
            // Unregistered / invalid
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
    }

    @PostMapping("/google")
    @Transactional
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, Object> body, HttpServletResponse response) {
        String token = (String) body.get("token");
        Boolean isPartner = (Boolean) body.get("isPartner");

        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token is required from Google account"));
        }

        Map<String, Object> userInfo;
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String url = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + token;
            ResponseEntity<Map> googleResponse = restTemplate.getForEntity(url, Map.class);
            userInfo = googleResponse.getBody();
            
            if (userInfo == null || !userInfo.containsKey("email")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Failed to retrieve user info from Google"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid Google token"));
        }

        String email = (String) userInfo.get("email");
        String name = (String) userInfo.get("name");
        String avatarUrl = (String) userInfo.get("picture");

        String normalizedEmail = email.trim().toLowerCase();

        // Get or Create user
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseGet(() -> {
                    UserAccount newUser = new UserAccount();
                    newUser.setEmail(normalizedEmail);
                    newUser.setName(name != null ? name : "Google User");
                    newUser.setIsPartner(isPartner != null && isPartner);
                    newUser.setVerified(true); // Google emails are pre-verified
                    newUser.setProvider("google");
                    newUser.setAvatarUrl(avatarUrl);
                    if (newUser.getIsPartner()) {
                        newUser.setHotelStatus("approved"); // Google partner approved by default or pending
                        hotelService.getOrCreateHotelProfile(normalizedEmail, "Google Property", "Colombo", "");
                    }
                    return userAccountRepository.save(newUser);
                });

        String role = "ROLE_TRAVELER";
        if (user.getIsAdmin()) {
            role = "ROLE_ADMIN";
        } else if (user.getIsPartner()) {
            role = "ROLE_OWNER";
        }

        String accessToken = jwtTokenProvider.generateToken(user.getEmail(), role);
        String refreshToken = createAndSaveRefreshToken(user.getEmail());

        setRefreshTokenCookie(response, refreshToken);

        Map<String, Object> userProfile = new HashMap<>();
        userProfile.put("id", user.getId().toString());
        userProfile.put("name", user.getName());
        userProfile.put("email", user.getEmail());
        userProfile.put("isPartner", user.getIsPartner());
        userProfile.put("isAdmin", user.getIsAdmin());
        userProfile.put("hotelName", user.getHotelName());
        userProfile.put("hotelCity", user.getHotelCity());
        userProfile.put("hotelPhone", user.getHotelPhone());
        userProfile.put("hotelStatus", user.getHotelStatus());
        userProfile.put("avatarUrl", user.getAvatarUrl());

        return ResponseEntity.ok(Map.of("success", true, "accessToken", accessToken, "user", userProfile));
    }

    @PostMapping("/refresh")
    @Transactional
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        String token = extractRefreshTokenFromCookie(request);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Missing refresh token"));
        }

        Optional<RefreshToken> storedTokenOpt = refreshTokenRepository.findByToken(token);
        if (storedTokenOpt.isEmpty() || storedTokenOpt.get().getExpiryDate().isBefore(Instant.now())) {
            if (storedTokenOpt.isPresent()) {
                refreshTokenRepository.delete(storedTokenOpt.get());
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Expired or invalid refresh token"));
        }

        RefreshToken storedToken = storedTokenOpt.get();
        String email = storedToken.getUserEmail();

        // Determine user role
        String role = "ROLE_TRAVELER";
        Optional<UserAccount> userOpt = userAccountRepository.findByEmailIgnoreCase(email);
        if (userOpt.isPresent()) {
            UserAccount user = userOpt.get();
            if (user.getIsAdmin()) {
                role = "ROLE_ADMIN";
            } else if (user.getIsPartner()) {
                role = "ROLE_OWNER";
            }
        } else {
            // Check if staff email
            role = "ROLE_STAFF";
        }

        String newAccessToken = jwtTokenProvider.generateToken(email, role);
        
        // Rotate refresh token
        refreshTokenRepository.delete(storedToken);
        String newRefreshToken = createAndSaveRefreshToken(email);
        setRefreshTokenCookie(response, newRefreshToken);

        return ResponseEntity.ok(Map.of("success", true, "accessToken", newAccessToken));
    }

    @PostMapping("/logout")
    @Transactional
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String token = extractRefreshTokenFromCookie(request);
        if (token != null) {
            refreshTokenRepository.findByToken(token).ifPresent(refreshTokenRepository::delete);
        }

        // Clear HttpOnly Cookie
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
    }

    @GetMapping("/partners")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getPartners() {
        List<UserAccount> partners = userAccountRepository.findByIsPartnerTrue();
        List<Map<String, Object>> response = new ArrayList<>();
        for (UserAccount user : partners) {
            Map<String, Object> userProfile = new HashMap<>();
            userProfile.put("id", user.getId() != null ? user.getId().toString() : "");
            userProfile.put("name", user.getName());
            userProfile.put("email", user.getEmail());
            userProfile.put("isPartner", user.getIsPartner());
            userProfile.put("isAdmin", user.getIsAdmin());
            userProfile.put("hotelName", user.getHotelName());
            userProfile.put("hotelCity", user.getHotelCity());
            userProfile.put("hotelPhone", user.getHotelPhone());
            userProfile.put("hotelStatus", user.getHotelStatus());
            userProfile.put("avatarUrl", user.getAvatarUrl());
            userProfile.put("joinedDate", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "Today");
            response.add(userProfile);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/partners/{userId}/approve")
    @Transactional
    public ResponseEntity<?> approvePartner(@PathVariable String userId) {
        try {
            UUID id = UUID.fromString(userId);
            Optional<UserAccount> userOpt = userAccountRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }
            UserAccount user = userOpt.get();
            user.setHotelStatus("approved");
            userAccountRepository.save(user);
            return ResponseEntity.ok(Map.of("success", true, "message", "Partner approved"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID"));
        }
    }

    @PostMapping("/partners/{userId}/reject")
    @Transactional
    public ResponseEntity<?> rejectPartner(@PathVariable String userId) {
        try {
            UUID id = UUID.fromString(userId);
            Optional<UserAccount> userOpt = userAccountRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }
            UserAccount user = userOpt.get();
            user.setHotelStatus("rejected");
            userAccountRepository.save(user);
            return ResponseEntity.ok(Map.of("success", true, "message", "Partner rejected"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID"));
        }
    }

    private String createAndSaveRefreshToken(String email) {
        refreshTokenRepository.deleteByUserEmail(email);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setUserEmail(email);
        refreshToken.setExpiryDate(Instant.now().plus(7, ChronoUnit.DAYS));

        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if ("refreshToken".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
