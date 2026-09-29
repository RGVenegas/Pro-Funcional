# ==========================================
# Base de Datos PostgreSQL Gestionada en AWS RDS (HU-14)
# ==========================================

# Subnet Group para alojar RDS estrictamente en subredes privadas
resource "aws_db_subnet_group" "rds" {
  name       = "${var.app_name}-${var.environment}-db-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  tags = {
    Name = "${var.app_name}-${var.environment}-db-subnet-group"
  }
}

# Instancia RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier             = "${var.app_name}-${var.environment}-postgres"
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t4g.micro" # Económico y de alto rendimiento ARM Graviton2
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_type           = "gp3"
  storage_encrypted      = true
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Aislamiento y Seguridad (Sin IP pública)
  publicly_accessible = false

  # Respaldos Automáticos y PITR (Point-In-Time Recovery)
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  skip_final_snapshot = true

  tags = {
    Name = "${var.app_name}-${var.environment}-rds-postgres"
  }
}
