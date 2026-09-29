# ==========================================
# Application Load Balancer (ALB) (HU-12)
# ==========================================

resource "aws_lb" "main" {
  name               = "${var.app_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  enable_deletion_protection = false

  tags = {
    Name = "${var.app_name}-${var.environment}-alb"
  }
}

# Target Group para las Tareas ECS Backend
resource "aws_lb_target_group" "backend" {
  name        = "${var.app_name}-${var.environment}-backend-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/api/v1/health"
    protocol            = "HTTP"
    port                = "traffic-port"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-backend-tg"
  }
}

# Listener HTTP (Puerto 80)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  # Redirección por defecto de HTTP (80) hacia HTTPS (443) o reenvío directo si aún no hay cert ACM
  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}
