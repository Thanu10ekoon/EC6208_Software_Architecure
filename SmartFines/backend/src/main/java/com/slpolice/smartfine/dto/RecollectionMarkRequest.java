package com.slpolice.smartfine.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RecollectionMarkRequest {
  @Size(max = 255)
  private String notes;
}
