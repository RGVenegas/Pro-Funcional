# ==========================================
# Security Groups (Reglas de Menor Privilegio)
# ==========================================

# Security Group para el Application Load Balancer (Acceso público 80/443)
resource "aws_security_group" "alb" {
  name        = "${var.app_name}-${var.environment}-alb-sg"
  description = "Permite acceso HTTP/HTTPS desde internet hacia el ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP desde cualquier origen"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS desde cualquier origen"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Permitir todo el tráfico saliente"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-alb-sg"
  }
}

# Security Group para las Tareas ECS Fargate (Restringido estrictamente al ALB)
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.app_name}-${var.environment}-ecs-tasks-sg"
  description = "Permite trafico entrante al backend solo desde el ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Tráfico entrante puerto del contenedor desde el ALB"
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Permitir salida para descargas y Secrets Manager"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-ecs-tasks-sg"
  }
}

# Security Group para la Base de Datos RDS PostgreSQL (Restringido estrictamente a las tareas ECS)
resource "aws_security_group" "rds" {
  name        = "${var.app_name}-${var.environment}-rds-sg"
  description = "Permite trafico PostgreSQL solo desde el Security Group del backend ECS"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL desde tareas ECS Fargate"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    description = "No requiere tráfico saliente fuera del SG"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-rds-sg"
  }
}
