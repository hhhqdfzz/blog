---
title: pdftoppm
alias: [pdftoppm]
os: [Linux]
category: [Office]
tags: [PDF, Processing]
description: PDF 转图片
---

# {{ $frontmatter.title }}

[官网](https://manned.org/pdftoppm)

**Description：** {{ $frontmatter.description }}。

| 适用系统 | 类型 | 标签 |
| --- | --- | --- |
| {{ $frontmatter.os.join(', ') }} | {{ $frontmatter.category.join(', ') }} | {{ $frontmatter.tags.join(', ') }}

---

```bash
$ sudo apt install pdftoppm
$ tldr pdftoppm

  pdftoppm

  Convert PDF document pages to portable Pixmap (image formats).
  More information: https://manned.org/pdftoppm.

  - Specify the range of pages to convert (n - first page, m - last page):
    pdftoppm -f n -l m path/to/file.pdf image_name_prefix

  - Convert only the first page of a PDF:
    pdftoppm -singlefile path/to/file.pdf image_name_prefix

  - Generate a monochrome PBM file (instead of a color PPM file):
    pdftoppm -mono path/to/file.pdf image_name_prefix

  - Generate a grayscale PGM file (instead of a color PPM file):
    pdftoppm -gray path/to/file.pdf image_name_prefix

  - Generate a PNG file instead a PPM file:
    pdftoppm -png path/to/file.pdf image_name_prefix

$ 
```
