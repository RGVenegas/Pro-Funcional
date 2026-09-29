variable "aws_region" {
  description = "Región de AWS para el despliegue de infraestructura"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Entorno de ejecución (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "app_name" {
  description = "Nombre base de la aplicación"
  type        = string
  default     = "profuncional"
}

variable "db_name" {
  description = "Nombre de la base de datos PostgreSQL en RDS"
  type        = string
  default     = "profuncional_db"
}

variable "db_username" {
  description = "Usuario administrador de PostgreSQL en RDS"
  type        = string
  default     = "profuncional_admin"
}

variable "db_password" {
  description = "Contraseña maestra de la base de datos RDS PostgreSQL (Almacenada en Secrets Manager)"
  type        = string
  sensitive   = true
  default     = "CambiarPasswordSegura2026!"
}

variable "jwt_secret" {
  description = "Clave secreta para la firma de tokens JWT (Almacenada en Secrets Manager)"
  type        = string
  sensitive   = true
  default     = "ClaveSecretaSuperSeguraJWT2026ProFuncional!"
}

variable "container_port" {
  description = "Puerto en el que escucha el backend NestJS dentro del contenedor"
  type        = number
  default     = 3001
}
