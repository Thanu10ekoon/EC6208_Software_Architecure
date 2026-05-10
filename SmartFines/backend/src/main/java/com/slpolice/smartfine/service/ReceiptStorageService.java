package com.slpolice.smartfine.service;

import com.slpolice.smartfine.exception.ApiException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ReceiptStorageService {
  private final Path storagePath;

  public ReceiptStorageService(@Value("${app.receipts.storage-path}") String storagePath) {
    this.storagePath = Path.of(storagePath).toAbsolutePath().normalize();
  }

  public StoredFile store(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Receipt file is required");
    }

    try {
      Files.createDirectories(storagePath);
      String safeName = sanitizeFileName(file.getOriginalFilename());
      String storedName = UUID.randomUUID() + "_" + safeName;
      Path target = storagePath.resolve(storedName);
      Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

      return new StoredFile(target.toString(), safeName, file.getContentType(), file.getSize());
    } catch (IOException ex) {
      throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store receipt file");
    }
  }

  private String sanitizeFileName(String fileName) {
    if (fileName == null || fileName.isBlank()) {
      return "receipt";
    }
    return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
  }

  public record StoredFile(String path, String originalName, String mimeType, long sizeBytes) {}
}
