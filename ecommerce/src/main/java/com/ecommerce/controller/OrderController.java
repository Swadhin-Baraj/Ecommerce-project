package com.ecommerce.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.model.Cart;
import com.ecommerce.model.Order;
import com.ecommerce.model.User;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.UserRepository;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    OrderRepository orderRepo;

    @Autowired
    UserRepository userRepo;

    @Autowired
    CartRepository cartRepo;

    // Create order from cart
    @GetMapping("/create")
    public String createOrder(
            @RequestParam Long userId,
            @RequestParam String shippingAddress) {

        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            return "User not found";
        }

        List<Cart> userCart = cartRepo.findByUser(user);
        if (userCart.isEmpty()) {
            return "Cart is empty";
        }

        Double totalAmount = userCart.stream().mapToDouble(Cart::getTotalPrice).sum();
        Order order = new Order(user, totalAmount, shippingAddress);
        orderRepo.save(order);

        // Clear cart after order
        cartRepo.deleteAll(userCart);

        return "Order created successfully with ID: " + order.getId();
    }

    // Get user orders
    @GetMapping("/user")
    public List<Order> getUserOrders(@RequestParam Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        return orderRepo.findByUser(user);
    }

    // Get all orders (Admin)
    @GetMapping("/all")
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

    // Get order by id
    @GetMapping("/get")
    public Order getOrder(@RequestParam Long orderId) {
        return orderRepo.findById(orderId).orElse(null);
    }

    // Update order status (Admin)
    @GetMapping("/update-status")
    public String updateOrderStatus(@RequestParam Long orderId, @RequestParam String status) {
        if (orderRepo.existsById(orderId)) {
            Order order = orderRepo.findById(orderId).get();
            order.setStatus(status);
            orderRepo.save(order);
            return "Order status updated to: " + status;
        }
        return "Order not found";
    }

    // Cancel order
    @GetMapping("/cancel")
    public String cancelOrder(@RequestParam Long orderId) {
        if (orderRepo.existsById(orderId)) {
            Order order = orderRepo.findById(orderId).get();
            if (order.getStatus().equals("PENDING")) {
                order.setStatus("CANCELLED");
                orderRepo.save(order);
                return "Order cancelled successfully";
            }
            return "Can only cancel PENDING orders";
        }
        return "Order not found";
    }

    // Get order count (for admin dashboard)
    @GetMapping("/count")
    public Long getOrderCount() {
        return orderRepo.count();
    }

    // Get total revenue (for admin dashboard)
    @GetMapping("/revenue")
    public Double getTotalRevenue() {
        return orderRepo.findAll().stream()
                .filter(order -> order.getStatus().equals("COMPLETED"))
                .mapToDouble(Order::getTotalAmount)
                .sum();
    }
}
