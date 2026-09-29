# ==========================================
# Gestión de Secretos en AWS Secrets Manager (HU-13)
# ==========================================

# Clave KMS dedicada para el cifrado de secretos
resource "aws_kms_key" "secrets" {
  description             = "Clave de cifrado KMS para secretos de ${var.app_name}-${var.environment}"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "${var.app_name}-${var.environment}-kms-secrets"
  }
}

# Secreto en AWS Secrets Manager
resource "aws_secretsmanager_secret" "app_secrets" {
  name                    = "${var.app_name}/${var.environment}/config"
  description             = "Credenciales sensibles de ejecucion para el backend NestJS"
  kms_key_id              = aws_kms_key.secrets.arn
  recovery_window_in_days = 0

  tags = {
    Name = "${var.app_name}-${var.environment}-secrets"
  }
}

# Valor del Secreto (Inyección de variables críticas)
resource "aws_secretsmanager_secret_version" "app_secrets_val" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    DATABASE_URL = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${var.db_name}?sslmode=require"
    JWT_SECRET   = var.jwt_secret
    NODE_ENV     = var.environment
    PORT         = tostring(var.container_port)
  })
}

# ==========================================
# Roles e IAM (Política de Menor Privilegio)
# ==========================================

# Rol de Ejecución de Tareas ECS (Task Execution Role)
resource "aws_iam_role" "ecs_execution_role" {
  name = "${var.app_name}-${var.environment}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Política Estándar de Ejecución ECS (ECR pull, CloudWatch logs)
resource "aws_iam_role_policy_attachment" "ecs_execution_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Política Inline de Menor Privilegio para Lectura Estricta del Secreto en Secrets Manager
resource "aws_iam_policy" "secrets_read_policy" {
  name        = "${var.app_name}-${var.environment}-secrets-read-policy"
  description = "Permite acceso strictly GetSecretValue al secreto especifico de la aplicacion"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.app_secrets.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = [
          aws_kms_key.secrets.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_secrets_attach" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.secrets_read_policy.arn
}

# Rol de Tarea ECS (Task Role) para permisos que ejecute la app internamente
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.app_name}-${var.environment}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}
