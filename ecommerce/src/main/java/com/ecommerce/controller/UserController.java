package com.ecommerce.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    UserRepository repo;

    // Show all users
    @GetMapping("/all")
    public List<User> getAllUsers() {
        return repo.findAll();
    }

    // Add user using browser
    @GetMapping("/add")
    public String addUser(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password) {

        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(password);

        repo.save(u);

        return "User Added Successfully";
    }
}
