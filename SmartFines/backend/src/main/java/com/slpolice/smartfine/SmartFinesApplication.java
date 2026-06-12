package com.slpolice.smartfine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SmartFinesApplication {
  public static void main(String[] args) {
    SpringApplication.run(SmartFinesApplication.class, args);
  }
}
