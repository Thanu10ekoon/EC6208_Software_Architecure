package com.slpolice.smartfine.repository;

import com.slpolice.smartfine.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
  Optional<User> findByUsername(String username);
  Optional<User> findByNic(String nic);
  Optional<User> findByPhone(String phone);

  boolean existsByEmail(String email);
  boolean existsByUsername(String username);
  boolean existsByNic(String nic);
  boolean existsByPhone(String phone);
}
