# ==========================================
# Hosting Frontend: AWS S3 + CloudFront CDN (HU-15)
# ==========================================

# Bucket S3 Privado para alojar los artefactos estáticos del Frontend Vite
resource "aws_s3_bucket" "frontend" {
  bucket        = "${var.app_name}-${var.environment}-frontend-hosting"
  force_destroy = true

  tags = {
    Name = "${var.app_name}-${var.environment}-frontend-s3"
  }
}

# Bloqueo de Acceso Público al Bucket S3 (Acceso exclusivo vía CloudFront OAC)
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Control de Acceso de Origen (CloudFront Origin Access Control - OAC)
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${var.app_name}-${var.environment}-oac"
  description                       = "OAC para permitir acceso seguro a CloudFront sobre S3"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Distribución CDN Amazon CloudFront
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
    origin_id                = "S3-${aws_s3_bucket.frontend.id}"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  # Manejo de Rutas de SPA (Single Page Application)
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-cloudfront"
  }
}

# Política de Bucket S3 permitiendo acceso exclusivo desde CloudFront CDN
resource "aws_s3_bucket_policy" "frontend_policy" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipalReadOnly"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })
}
