package com.slpolice.smartfine.exception;

import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ErrorResponse {
  private Instant timestamp;
  private int status;
  private String error;
  private String message;
  private String path;
  private List<FieldError> fieldErrors;

  @Getter
  @Builder
  public static class FieldError {
    private String field;
    private String message;
  }
}
