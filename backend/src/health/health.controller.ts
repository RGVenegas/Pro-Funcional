import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('v1/health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Verificar el estado de salud de la API backend (ALB Health Check)' })
  @ApiResponse({ status: 200, description: 'La API está en funcionamiento saludable' })
  checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'pro-funcional-backend',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
