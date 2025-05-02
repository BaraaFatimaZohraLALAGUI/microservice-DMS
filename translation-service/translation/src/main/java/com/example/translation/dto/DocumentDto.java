package com.example.translation.dto;

import lombok.Data;

@Data
public class DocumentDto {
    private String title;
    private String category;
    private String department;
    private byte[] fileContent;
}