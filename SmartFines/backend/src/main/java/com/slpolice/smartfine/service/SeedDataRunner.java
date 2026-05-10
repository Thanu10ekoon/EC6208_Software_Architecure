package com.slpolice.smartfine.service;

import com.slpolice.smartfine.entity.Role;
import com.slpolice.smartfine.repository.RoleRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SeedDataRunner implements CommandLineRunner {
  private final RoleRepository roleRepository;

  public SeedDataRunner(RoleRepository roleRepository) {
    this.roleRepository = roleRepository;
  }

  @Override
  public void run(String... args) {
    List<String> roles = List.of("admin", "traffic_officer", "driver");
    roles.forEach(name -> roleRepository.findByName(name).orElseGet(() -> {
      Role role = new Role();
      role.setName(name);
      role.setDescription("System role: " + name);
      return roleRepository.save(role);
    }));
  }
}
