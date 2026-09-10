import fs from 'node:fs';
function edit(path, fn) { fs.writeFileSync(path, fn(fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n'))); }
const root = 'src/app/components/';
edit(root + 'user/UserCalendar.tsx', s => {
  for (const name of ['createBookingTransaction', 'cancelBookingWith24hRule', 'rescheduleBookingTransaction']) s = s.replace('  ' + name + ',\n', '');
  s = `import { weekDate, today, appointmentTime } from '../../data/dates';\nimport { bookingsForSlot } from '../../data/gymStore';\nimport { createBookingTransaction, cancelBookingWith24hRule, rescheduleBookingTransaction, confirmBooking } from '../../data/operations';\n` + s;
  s = s.replace("const baseMonday = new Date(2025, 0, 20); // Jan 20, 2025 (Monday)", "const baseMonday = new Date(weekDate() + 'T12:00:00');");
  s = s.replaceAll('getUserBookings(memberName)', "getUserBookings(memberName).filter(b => b.status !== 'cancelled')");
  s = s.replace('const handleBookingSubmit = (', 'const handleBookingSubmit = async (').replace('const handleCancel = (', 'const handleCancel = async (').replace('const handleRescheduleSubmit = (', 'const handleRescheduleSubmit = async (');
  s = s.replaceAll('const result = createBookingTransaction', 'const result = await createBookingTransaction').replaceAll('const result = cancelBookingWith24hRule', 'const result = await cancelBookingWith24hRule').replaceAll('const result = rescheduleBookingTransaction', 'const result = await rescheduleBookingTransaction');
  s = s.replaceAll('b.students.length < b.capacity', 'bookingsForSlot(b.id, getDateForDayOfWeek(b.dayOfWeek)).length < b.capacity');
  s = s.replace('const booked = block.students.length;', 'const booked = bookingsForSlot(block.id, getDateForDayOfWeek(block.dayOfWeek)).length;');
  s = s.replace('bookingBlock.block.capacity - bookingBlock.block.students.length', 'bookingBlock.block.capacity - bookingsForSlot(bookingBlock.block.id, bookingBlock.targetDate).length');
  s = s.replace('Reserva en línea (HU-03), reagenda sin costo y cancela con regla de 24h (HU-04)', 'Cancela o reagenda con al menos 24 horas. Una cancelación tardía o inasistencia consume la sesión reservada.');
  // Existing booking cards retain their styling; confirmation is another action.
  s = s.replace('onClick={() => handleCancel(booking.id)}', "onClick={() => { if (window.confirm('¿Cancelar esta clase? Con menos de 24 horas, se libera el cupo sin devolver la sesión.')) void handleCancel(booking.id); }}");
  s = s.replace('onClick={() => handleOpenReschedule(booking)}', 'onClick={() => handleOpenReschedule(booking)}');
  const marker = 'onClick={() => handleOpenReschedule(booking)}';
  const pos = s.indexOf(marker);
  if (pos >= 0) { const start = s.lastIndexOf('<button', pos); s = s.slice(0, start) + `<button disabled={Boolean(booking.confirmedAt) || booking.status === 'attended' || booking.status === 'no-show' || appointmentTime(booking.date, booking.time.split(' - ')[0]) <= Date.now()} onClick={async () => { try { await confirmBooking(booking.id, memberName); showToast('Tu intención de asistir quedó confirmada.', 'success'); } catch (e) { showToast((e as Error).message, 'error'); } }} className="px-3 py-2 rounded-lg bg-white/5 text-[#00B4D8] text-xs disabled:opacity-50">{booking.confirmedAt ? 'Asistencia prevista confirmada' : 'Confirmo que asistiré'}</button>\n` + s.slice(start); }
  s = s.replaceAll('min="2025-01-01"', 'min={today()}');
  return s;
});
edit(root + 'admin/ScheduleManagement.tsx', s => {
  for (const name of ['addCentralScheduleBlock', 'deleteCentralScheduleBlock']) s = s.replace('  ' + name + ',\n', '');
  s = `import { weekDate } from '../../data/dates';\nimport { studentsForSlot, subscribeToBookings } from '../../data/gymStore';\nimport { addCentralScheduleBlock, deleteCentralScheduleBlock, recordAttendance } from '../../data/operations';\n` + s;
  s = s.replace('  createdAt: string;', '  createdAt: string;\n  isRefunded?: boolean;');
  s = s.replace("const baseMonday = new Date(2025, 0, 20);", "const baseMonday = new Date(weekDate() + 'T12:00:00');");
  s = s.replace('getCentralScheduleBlocks()', 'getCentralScheduleBlocks().map(b => ({ ...b, students: studentsForSlot(b.id, weekDate(currentWeek, ( [\'Monday\', \'Tuesday\', \'Wednesday\', \'Thursday\', \'Friday\', \'Saturday\', \'Sunday\'].indexOf(b.dayOfWeek)))) }))');
  s = s.replace('    const unsub = subscribeToSchedule(() => {', '    const update = () => {');
  s = s.replace('    });\n    return unsub;\n  }, []);', '    };\n    update();\n    const unsub = subscribeToSchedule(update);\n    const bookings = subscribeToBookings(update);\n    return () => { unsub(); bookings(); };\n  }, [currentWeek]);');
  s = s.replace('const handleCreateBlock = (', 'const handleCreateBlock = async (').replace('    addCentralScheduleBlock({', '    try { await addCentralScheduleBlock({').replace('    setIsAddModalOpen(false);', "    } catch (e) { showToast((e as Error).message); return; }\n    setIsAddModalOpen(false);");
  s = s.replace('const handleDeleteBlock = (', 'const handleDeleteBlock = async (').replace('const res = deleteCentralScheduleBlock', 'const res = await deleteCentralScheduleBlock');
  const a = s.indexOf('  const toggleAttendance ='); const b = s.indexOf('\n  return (', a);
  s = s.slice(0, a) + `  useEffect(() => { if (selectedBlock) setSelectedBlock(blocks.find(b => b.id === selectedBlock.id) || null); }, [blocks]);
  const toggleAttendance = async (blockId: string, studentId: string, newStatus: 'attended' | 'no-show' | 'pending') => {
    const student = blocks.find(b => b.id === blockId)?.students.find(s => s.id === studentId);
    if (!student?.bookingId) return;
    try { await recordAttendance(student.bookingId, student.status === newStatus ? 'pending' : newStatus); showToast('Asistencia actualizada.'); } catch (e) { showToast((e as Error).message); }
  };
` + s.slice(b);
  s = s.replace('(sesión reembolsada a saldo).', "({notification.isRefunded ? 'sesión devuelta al saldo' : 'sin devolución de sesión'}).");
  s = s.replace("'Pendiente de inicio'", "student.confirmedAt ? 'Confirmó que asistirá' : 'Pendiente de confirmación'");
  return s;
});
edit(root + 'user/TrainingTracking.tsx', s => {
  s = `import { getMemberByEmail, getUserBookings, subscribeToMembers, subscribeToBookings } from '../../data/gymStore';\nimport { CarePanel } from '../shared/CarePanel';\nimport { formatDate } from '../../data/dates';\n` + s;
  s = s.replace("import React, { useState }", "import React, { useState, useEffect }");
  s = s.replace('export function TrainingTracking() {', `export function TrainingTracking({ email }: { email: string }) {
    const [, refresh] = useState(0);
    useEffect(() => { const update = () => refresh(n => n + 1); const a = subscribeToMembers(update); const b = subscribeToBookings(update); return () => { a(); b(); }; }, []);
    const member = getMemberByEmail(email);
    const history = [...(member?.clinicalHistory || [])].sort((a, b) => a.date.localeCompare(b.date));
    const [area, setArea] = useState('');
    const selectedArea = area || history.at(-1)?.jointOrArea;
    const records = history.filter(e => e.jointOrArea === selectedArea);
    const latest = records.at(-1);
    const first = records[0];`);
  const a = s.indexOf('  // Evolution data'); const b = s.indexOf('\n  return (', a);
  s = s.slice(0, a) + `  const clinicalProgressData = records.map((e, i) => ({ session: 'Sesión ' + (i + 1), date: formatDate(e.date), evaPain: e.evaPain, romDegrees: e.romDegrees }));
  const sessions = getUserBookings(member?.name).filter(b => b.status === 'attended').map(b => ({ id: b.id, name: b.title, date: b.date, duration: Math.round((Date.parse(b.date + 'T' + b.time.split(' - ')[1]) - Date.parse(b.date + 'T' + b.time.split(' - ')[0])) / 60000), type: b.type === 'kine' ? 'Box Clínico' : 'Gimnasio', instructor: b.instructor }));
` + s.slice(b);
  s = s.replace('"Evitar sentadillas profundas &gt;90° y saltos de impacto alto por recuperación de tendinopatía / post-op."', "{member?.physicalRestrictions || 'Sin restricciones registradas por el profesional.'}");
  s = s.replace('Prescrito por Klgo. Andrés Morales · Vigente', "{latest ? `Evaluación de ${latest.professional} · ${formatDate(latest.date)}` : 'Evaluación pendiente'}");
  s = s.replace('>3 <span', ">{latest?.evaPain ?? '—'} <span").replace('-62% desde inicio', "{latest && first ? `${latest.evaPain - first.evaPain} puntos desde inicio` : 'Sin evaluaciones'}");
  s = s.replace('>130°</p>', ">{latest ? `${latest.romDegrees}°` : '—'}</p>").replace('+45° ganados', "{latest && first ? `${latest.romDegrees - first.romDegrees}° desde inicio` : 'Sin evaluaciones'}");
  s = s.replace('>5</p>', '>{sessions.length}</p>').replace('de 8 en paquete', 'Asistencias registradas');
  s = s.replace('Días Constantes', 'Días con asistencia').replace('>12</p>', '>{new Set(sessions.map(s => s.date)).size}</p>').replace('Racha activa', 'Historial personal');
  s = s.replace('{/* Gráfico Recharts */}', `<label className="block text-sm text-white/60">Zona evaluada<select aria-label="Zona evaluada" value={selectedArea || ''} onChange={e => setArea(e.target.value)} className="ml-2 bg-[#010A01] rounded-lg border border-white/10 p-2">{[...new Set(history.map(e => e.jointOrArea))].map(a => <option key={a}>{a}</option>)}</select></label>\n{!records.length && <p className="text-sm text-white/60">Aún no hay evaluaciones registradas.</p>}`);
  s = s.replace('domain={[60, 150]}', "domain={['auto', 'auto']}");
  s = s.replace("{activeChart === 'pain' ? '📉 Meta: Dolor ≤ 2/10 para alta kinésica' : '📈 Meta: ROM completo ≥ 135°'}", "{member?.care?.goals || 'Objetivos pendientes de definir con tu profesional'}");
  const end = s.lastIndexOf('    </div>');
  s = s.slice(0, end) + `      {member && <><CarePanel memberId={member.id} section="routine" /><CarePanel memberId={member.id} section="messages" author={member.name} /></>}\n` + s.slice(end);
  return s;
});
edit(root + 'user/UserHome.tsx', s => {
  s = `import { getUserBookings, subscribeToBookings, bookingStart } from '../../data/gymStore';\nimport { formatDate } from '../../data/dates';\nimport { ReminderPanel } from '../shared/ReminderPanel';\n` + s;
  const a = s.indexOf('  const selectedClasses'); const b = s.indexOf('\n  const remainingSessions', a);
  s = s.slice(0, a) + `  const [, tick] = useState(0);
  useEffect(() => subscribeToBookings(() => tick(n => n + 1)), []);
  const bookings = getUserBookings(account.name);
  const upcoming = bookings.filter(b => (!b.status || b.status === 'pending') && bookingStart(b) > Date.now()).sort((a, b) => bookingStart(a) - bookingStart(b))[0];
  const nextSession = { name: upcoming?.title || 'Sin clases agendadas', time: upcoming ? formatDate(upcoming.date) + ' · ' + upcoming.time : 'Elige un horario disponible', instructor: upcoming?.instructor || 'Por asignar', type: upcoming?.type === 'kine' ? 'Box Clínico' : 'Entrenamiento' };
` + s.slice(b);
  s = s.replace(": '3/10'", ": 'Sin registro'");
  s = s.replace("{ label: 'Racha de constancia', value: '12 días'", "{ label: 'Clases asistidas', value: String(bookings.filter(b => b.status === 'attended').length)");
  s = s.replace('      {/* Quick Stats */}', '      {memberData && <ReminderPanel memberId={memberData.id} />}\n      {/* Quick Stats */}');
  return s;
});
edit(root + 'user/UserProfile.tsx', s => {
  s = `import { getMemberByEmail } from '../../data/gymStore';\nimport { formatDate } from '../../data/dates';\nimport { CarePanel } from '../shared/CarePanel';\n` + s;
  s = s.replace('  const user = {', '  const member = getMemberByEmail(account.email);\n  const user = {');
  s = s.replace("status: 'Activa'", "status: member?.status === 'active' ? 'Activa' : member?.status === 'suspended' ? 'Suspendida' : 'Vencida'").replace("memberSince: '2024-01-15'", 'memberSince: member?.joinDate').replace("expirationDate: '2025-02-15'", 'expirationDate: member?.nextBilling');
  s = s.replace("new Date(user.memberSince).toLocaleDateString('es-CL')", 'formatDate(user.memberSince)').replace("new Date(user.expirationDate).toLocaleDateString('es-CL')", 'formatDate(user.expirationDate)');
  const end = s.lastIndexOf('    </div>'); s = s.slice(0, end) + '      {member && <CarePanel memberId={member.id} section="profile" author={member.name} />}\n' + s.slice(end);
  return s;
});
edit(root + 'user/DigitalCard.tsx', s => {
  s = `import { getMemberByEmail } from '../../data/gymStore';\n` + s;
  s = s.replace("memberSince: '2024-01-15'", "memberSince: getMemberByEmail(account.email)?.joinDate || ''").replace("expirationDate: '2025-02-15'", "expirationDate: getMemberByEmail(account.email)?.nextBilling || ''");
  return s;
});
edit(root + 'user/UserPlan.tsx', s => {
  s = `import { getMembers } from '../../data/gymStore';\nimport { careAction } from '../../data/careStore';\nimport { CarePanel } from '../shared/CarePanel';\nimport { formatDate } from '../../data/dates';\n` + s;
  s = s.replace('  const [feedback', '  const member = getMembers().find(m => m.name === memberName);\n  const [feedback');
  const a = s.indexOf('  const handleRenew ='); const b = s.indexOf('\n  return (', a);
  s = s.slice(0, a) + `  const requestPack = async (name: string) => {
    if (!member) return;
    try { await careAction(member.id, 'message', { text: 'Quiero renovar o adquirir: ' + name }, false, member.name); showFeedback('Solicitud enviada al centro. El equipo confirmará el pago y acreditará las sesiones.'); } catch (e) { showFeedback((e as Error).message); }
  };
  const handleRenew = () => requestPack(currentConfig.name);
  const handleSelectPack = (key: 'Basic' | 'Standard' | 'Premium') => requestPack(packsConfig[key].name);
` + s.slice(b);
  s = s.replace('Reagendamiento y cancelación sin pérdida de sesión', 'Reagendamiento y cancelación con al menos 24 horas');
  s = s.replace('15 Ene, 2025', '{formatDate(member?.joinDate)}').replace('Fecha de Activación', 'Fecha de ingreso').replace('60 días hábiles', '{formatDate(member?.nextBilling)}');
  s = s.replace('Renovar / Acreditar Paquete', 'Solicitar renovación');
  const end = s.lastIndexOf('    </div>'); s = s.slice(0, end) + '      {member && <><CarePanel memberId={member.id} section="payments" /><CarePanel memberId={member.id} section="rewards" /></>}\n' + s.slice(end);
  return s;
});
edit(root + 'admin/MemberDetail.tsx', s => {
  s = s.replace('addClinicalEvaluation, ', '').replace(', updateMember }', ' }');
  s = `import { addClinicalEvaluation, updateMember } from '../../data/operations';\nimport { careAction } from '../../data/careStore';\nimport { CarePanel } from '../shared/CarePanel';\nimport { getUserBookings } from '../../data/gymStore';\nimport { today } from '../../data/dates';\n` + s;
  s = s.replace('  onBack: () => void;', '  onBack: () => void;\n  author?: string;\n  canEdit?: boolean;');
  s = s.replace('({ memberId, onBack }: MemberDetailProps)', "({ memberId, onBack, author = 'Profesional del centro', canEdit = true }: MemberDetailProps)");
  const a = s.indexOf('  const [notes,'); const b = s.indexOf('  const [actionMessage', a);
  s = s.slice(0, a) + '  const notes = member.notes || [];\n' + s.slice(b);
  s = s.replace('const handleRenew = () =>', 'const handleRenew = async () =>').replace('const handleSuspend = () =>', 'const handleSuspend = async () =>').replace('const handleSaveEvaluation = (', 'const handleSaveEvaluation = async (').replace('const handleSaveNote = (', 'const handleSaveNote = async (');
  s = s.replaceAll('const updated = updateMember', 'const updated = await updateMember').replace('const newEval = addClinicalEvaluation', 'const newEval = await addClinicalEvaluation');
  s = s.replace("professional: 'Klgo. Andrés Morales'", 'professional: author').replace("new Date().toISOString().slice(0, 10)", 'today()');
  s = s.replace("subjective: soapS || 'Sin observaciones subjetivas reportadas.'", 'subjective: soapS.trim()').replace('objective: soapO || `ROM articular evaluado en ${romDegrees}°.`', 'objective: soapO.trim()').replace("assessment: soapA || 'Evolución clínica dentro de los parámetros esperados.'", 'assessment: soapA.trim()').replace("plan: soapP || 'Continuar pauta de kinesiología y readaptación funcional.'", 'plan: soapP.trim()').replace('physicalRestrictions: physicalRestrictions.trim() || undefined', 'physicalRestrictions: physicalRestrictions.trim()');
  s = s.replace('setNotes((prev) => [newNote, ...prev]);', "try { await careAction(member.id, 'note', { text: noteText }, true, author); } catch (e) { showFeedback((e as Error).message); return; }");
  s = s.replace("{activeTab === 'clinical' && (", "{activeTab === 'clinical' && canEdit && (");
  s = s.replace('{showSoapForm && (', '{showSoapForm && canEdit && (');
  s = s.replace('onClick={() => { setActiveTab', 'disabled={!canEdit} onClick={() => { setActiveTab');
  s = s.replace('onClick={handleRenew}', 'disabled={!canEdit} onClick={handleRenew}').replace('onClick={handleSuspend}', 'disabled={!canEdit} onClick={handleSuspend}');
  s = s.replace("{activeTab === 'notes' && (", "{activeTab === 'notes' && canEdit && (");
  const end = s.lastIndexOf('    </div>');
  s = s.slice(0, end) + `      {canEdit && activeTab === 'clinical' && <><CarePanel memberId={member.id} section="profile" staff author={author} /><CarePanel memberId={member.id} section="routine" staff author={author} /></>}
      {!canEdit && <CarePanel memberId={member.id} section="routine" />}
      {canEdit && activeTab === 'notes' && <CarePanel memberId={member.id} section="messages" staff author={author} />}
      {canEdit && activeTab === 'balance' && <><CarePanel memberId={member.id} section="payments" staff author={author} /><CarePanel memberId={member.id} section="rewards" staff author={author} /></>}
` + s.slice(end);
  return s;
});
