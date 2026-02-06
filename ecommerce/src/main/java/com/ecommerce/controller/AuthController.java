package com.ecommerce.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    UserRepository userRepo;

    // Register user
    @GetMapping("/register")
    public String registerUser(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password) {

        // Check if user already exists
        if (userRepo.findByEmail(email) != null) {
            return "User already exists with this email";
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);
        userRepo.save(user);

        return "Registration successful";
    }

    // Login user
    @GetMapping("/login")
    public User loginUser(
            @RequestParam String email,
            @RequestParam String password) {

        User user = userRepo.findByEmail(email);
        
        if (user == null) {
            return null;
        }

        if (user.getPassword().equals(password)) {
            return user;
        }

        return null;
    }

    // Check if email exists
    @GetMapping("/check-email")
    public Boolean checkEmail(@RequestParam String email) {
        return userRepo.findByEmail(email) != null;
    }
}
