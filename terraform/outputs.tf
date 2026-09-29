output "vpc_id" {
  description = "ID de la VPC creada"
  value       = aws_vpc.main.id
}

output "alb_dns_name" {
  description = "URL publica del Application Load Balancer (Acceso Backend)"
  value       = aws_lb.main.dns_name
}

output "ecr_repository_url" {
  description = "URL del repositorio de Amazon ECR para publicar imágenes Docker"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecs_cluster_name" {
  description = "Nombre del cluster ECS Fargate"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "Nombre del servicio ECS Fargate"
  value       = aws_ecs_service.backend.name
}

output "rds_endpoint" {
  description = "Endpoint privado de la base de datos RDS PostgreSQL"
  value       = aws_db_instance.postgres.endpoint
}

output "secrets_manager_arn" {
  description = "ARN del secreto guardado en AWS Secrets Manager"
  value       = aws_secretsmanager_secret.app_secrets.arn
}

output "s3_bucket_name" {
  description = "Nombre del bucket S3 de hosting de Frontend"
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_distribution_id" {
  description = "ID de la distribucion de Amazon CloudFront"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "Dominio público de la CDN CloudFront para acceder al Frontend"
  value       = aws_cloudfront_distribution.frontend.domain_name
}
