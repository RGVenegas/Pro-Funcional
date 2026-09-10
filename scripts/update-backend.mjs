import fs from 'node:fs';
const edit = (path, fn) => fs.writeFileSync(path, fn(fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n')));
edit('backend/src/app.module.ts', s => "import { WorkspaceModule } from './workspace/workspace.module';\n" + s.replace('    ClinicalModule,', '    ClinicalModule,\n    WorkspaceModule,'));
edit('backend/package.json', s => { const p = JSON.parse(s); p.dependencies['web-push'] = '^3.6.7'; p.devDependencies['@types/web-push'] = '^3.6.4'; return JSON.stringify(p, null, 2) + '\n'; });
edit('backend/src/auth/auth.service.ts', s => s.replace('role: dto.role || Role.PATIENT', 'role: Role.PATIENT'));
edit('backend/src/clinical/clinical.controller.ts', s => {
  s = s.replace('import { Body,', 'import { ForbiddenException, Body,');
  s = s.replace("getPatientHistory(@Param('patientId') patientId: string) {\n    return", "getPatientHistory(@Param('patientId') patientId: string, @GetUser() user: any) {\n    if (user.id !== patientId && ![Role.ADMIN, Role.KINESIOLOGO].includes(user.role)) throw new ForbiddenException('No tienes acceso a esta ficha.');\n    return");
  return s;
});
edit('backend/src/clinical/clinical.service.ts', s => {
  s = s.replace("import { Injectable", "import { Injectable");
  s = s.replace("import { PrismaService", "import { serial } from '../common/transaction';\nimport { PrismaService");
  s = s.replace('return this.prisma.$transaction(async (tx) => {', 'return serial(this.prisma, async (tx) => {');
  s = s.replace('// 2. Actualizar restricciones', `const current = await tx.user.findUnique({ where: { id: patientId } });
      const care: any = structuredClone(current.care || {});
      if (care.routine) { care.routine.status = 'draft'; delete care.routine.approvedAt; delete care.routine.approvedBy; await tx.user.update({ where: { id: patientId }, data: { care } }); }
      // 2. Actualizar restricciones`);
  return s;
});
// Limit full clinical records to treating professionals; coaches get the permitted snapshot.
edit('backend/src/members/members.controller.ts', s => s.replaceAll('@Roles(Role.ADMIN, Role.KINESIOLOGO, Role.COACH)', '@Roles(Role.ADMIN, Role.KINESIOLOGO)'));
edit('backend/src/members/dto/update-member.dto.ts', s => s.replace(/  @ApiPropertyOptional\(\{ enum: Role \}\)[\s\S]*?  role\?: Role;\n/, ''));
edit('backend/src/members/members.service.ts', s => {
  s = s.replace("import { PrismaService", "import { serial } from '../common/transaction';\nimport { PrismaService");
  const start = s.indexOf('    const updated = await this.prisma.user.update({', s.indexOf('  async update('));
  const end = s.indexOf('\n\n    await this.prisma.activityLog', start);
  s = s.slice(0, start) + `    const updated = await serial(this.prisma, async tx => {
      const current = await tx.user.findUnique({ where: { id } });
      const care: any = structuredClone(current.care || {});
      if (dto.physicalRestrictions !== undefined && care.routine) { care.routine.status = 'draft'; delete care.routine.approvedAt; delete care.routine.approvedBy; }
      return tx.user.update({ where: { id }, data: { ...dto, care } });
    });` + s.slice(end);
  return s;
});
edit('backend/src/schedule/schedule.controller.ts', s => s.replace("  @Get('grid')", "  @Get('grid')\n  @UseGuards(JwtAuthGuard, RolesGuard)\n  @Roles(Role.ADMIN, Role.KINESIOLOGO, Role.COACH)").replace("  @Get('blocks/:id')", "  @Get('blocks/:id')\n  @UseGuards(JwtAuthGuard, RolesGuard)\n  @Roles(Role.ADMIN, Role.KINESIOLOGO, Role.COACH)"));
