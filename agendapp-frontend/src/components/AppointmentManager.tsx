import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  cancelAppointment,
  cancelAppointmentFlow,
  getActiveAppointments,
  getAppointmentContext,
  getAppointmentHistory,
  getAvailability,
  rescheduleAppointment,
  scheduleAppointment,
  type AppointmentContext,
  type AppointmentSlot,
  type MedicalAppointment,
} from "@/lib/appointment-service";
import {
  acceptPortalRedirect,
  goToAppointmentsPortal,
  inspectPortal,
  selectPortalBeneficiary,
  type PortalDiagnosticSnapshot,
} from "@/lib/portal-diagnostic-service";
import { ArrowLeft, CalendarCheck, Clock, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";

interface AppointmentManagerProps {
  sessionId: string;
  onBack: () => void;
}

const today = new Date().toISOString().slice(0, 10);

export function AppointmentManager({ sessionId, onBack }: AppointmentManagerProps) {
  const [context, setContext] = useState<AppointmentContext | null>(null);
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [appointmentTypeId, setAppointmentTypeId] = useState("");
  const [date, setDate] = useState(today);
  const [timezone, setTimezone] = useState("America/Bogota");
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [activeAppointments, setActiveAppointments] = useState<MedicalAppointment[]>([]);
  const [history, setHistory] = useState<MedicalAppointment[]>([]);
  const [rescheduleTarget, setRescheduleTarget] = useState<MedicalAppointment | null>(null);
  const [diagnostic, setDiagnostic] = useState<PortalDiagnosticSnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  const canLoadSlots = beneficiaryId && appointmentTypeId && date && timezone;
  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.time === selectedTime),
    [selectedTime, slots]
  );
  const isRescheduling = Boolean(rescheduleTarget);

  const resetSchedulerDefaults = (sourceContext: AppointmentContext | null = context) => {
    setSlots([]);
    setSelectedTime("");
    setDate(today);
    if (sourceContext) {
      setTimezone(sourceContext.timezone);
      setBeneficiaryId(sourceContext.beneficiaries[0]?.id ?? "");
      setAppointmentTypeId(sourceContext.appointmentTypes[0]?.id ?? "");
    }
  };

  const refreshAppointments = async () => {
    const [active, appointmentHistory] = await Promise.all([
      getActiveAppointments(sessionId),
      getAppointmentHistory(sessionId),
    ]);

    setActiveAppointments(active);
    setHistory(appointmentHistory);
  };

  useEffect(() => {
    getAppointmentContext(sessionId)
      .then((loadedContext) => {
        setContext(loadedContext);
        setTimezone(loadedContext.timezone);
        setBeneficiaryId(loadedContext.beneficiaries[0]?.id ?? "");
        setAppointmentTypeId(loadedContext.appointmentTypes[0]?.id ?? "");
      })
      .then(refreshAppointments)
      .catch((error) => toast.error(error.message));
  }, [sessionId]);

  const handleLoadSlots = async () => {
    if (!canLoadSlots) return;

    setLoading(true);
    try {
      const availableSlots = await getAvailability(sessionId, date, timezone);
      setSlots(availableSlots);
      setSelectedTime("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible consultar horarios");
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedSlot) return;

    setLoading(true);
    try {
      await scheduleAppointment(sessionId, {
        beneficiaryId,
        appointmentTypeId,
        date: selectedSlot.date,
        time: selectedSlot.time,
        timezone: selectedSlot.timezone,
      });
      toast.success("Cita agendada correctamente");
      setSlots([]);
      setSelectedTime("");
      await refreshAppointments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible agendar la cita");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelFlow = async () => {
    await cancelAppointmentFlow(sessionId).catch(() => undefined);
    setSlots([]);
    setSelectedTime("");
    toast.info("Proceso de agendamiento cancelado");
  };

  const handleStartReschedule = (appointment: MedicalAppointment) => {
    setRescheduleTarget(appointment);
    setBeneficiaryId(appointment.beneficiary.id);
    setAppointmentTypeId(appointment.appointmentType.id);
    setDate(appointment.date);
    setTimezone(appointment.timezone);
    setSlots([]);
    setSelectedTime("");
  };

  const handleReschedule = async () => {
    if (!selectedSlot || !rescheduleTarget) return;

    setLoading(true);
    try {
      await rescheduleAppointment(sessionId, rescheduleTarget.appointmentId, {
        date: selectedSlot.date,
        time: selectedSlot.time,
        timezone: selectedSlot.timezone,
      });
      toast.success("Cita reprogramada correctamente");
      setRescheduleTarget(null);
      resetSchedulerDefaults();
      await refreshAppointments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible reprogramar la cita");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReschedule = () => {
    setRescheduleTarget(null);
    resetSchedulerDefaults();
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setLoading(true);
    try {
      await cancelAppointment(sessionId, appointmentId);
      toast.success("Cita cancelada");
      await refreshAppointments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible cancelar la cita");
    } finally {
      setLoading(false);
    }
  };

  const handleInspectPortal = async () => {
    setLoading(true);
    try {
      const snapshot = await inspectPortal(sessionId);
      setDiagnostic(snapshot);
      toast.success("Diagnostico del portal capturado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible inspeccionar el portal");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToPortalAppointments = async () => {
    setLoading(true);
    try {
      const snapshot = await goToAppointmentsPortal(sessionId);
      setDiagnostic(snapshot);
      toast.success("Modulo de citas inspeccionado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible entrar a citas");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPortalBeneficiary = async () => {
    if (!beneficiaryId) return;

    setLoading(true);
    try {
      const snapshot = await selectPortalBeneficiary(sessionId, beneficiaryId);
      setDiagnostic(snapshot);
      toast.success("Beneficiario seleccionado en portal");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible seleccionar beneficiario");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPortalRedirect = async () => {
    setLoading(true);
    try {
      const snapshot = await acceptPortalRedirect(sessionId);
      setDiagnostic(snapshot);
      toast.success("Redireccion del portal inspeccionada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible continuar en portal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a sesion
      </button>

      <div className="grid lg:grid-cols-[1fr_0.9fr] gap-6">
        <section className="bg-card rounded-xl shadow-card border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <CalendarCheck className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-xl font-heading font-bold">
                {isRescheduling ? "Reprogramar cita" : "Agendar cita"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isRescheduling
                  ? "Selecciona nueva fecha y horario para la cita activa."
                  : "Selecciona beneficiario, especialidad, fecha y horario."}
              </p>
            </div>
          </div>

          {rescheduleTarget && (
            <div className="mb-5 rounded-lg border border-border/70 bg-muted/40 p-3 text-sm">
              <p className="font-semibold">Reprogramando:</p>
              <p className="text-muted-foreground">
                {rescheduleTarget.appointmentType.name} - {rescheduleTarget.beneficiary.name}
              </p>
              <p className="text-muted-foreground">
                {rescheduleTarget.date} {rescheduleTarget.time} ({rescheduleTarget.timezone})
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Persona</Label>
              <Select
                value={beneficiaryId}
                onValueChange={setBeneficiaryId}
                disabled={isRescheduling}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar persona" />
                </SelectTrigger>
                <SelectContent>
                  {context?.beneficiaries.map((beneficiary) => (
                    <SelectItem key={beneficiary.id} value={beneficiary.id}>
                      {beneficiary.name} - {beneficiary.relationship}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de cita</Label>
              <Select
                value={appointmentTypeId}
                onValueChange={setAppointmentTypeId}
                disabled={isRescheduling}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {context?.appointmentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Fecha</Label>
              <Input
                id="appointmentDate"
                type="date"
                min={today}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Zona horaria</Label>
              <Input
                id="timezone"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <Button onClick={handleLoadSlots} disabled={!canLoadSlots || loading}>
              <Clock className="w-4 h-4 mr-2" />
              Consultar horarios
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={isRescheduling ? handleCancelReschedule : handleCancelFlow}
            >
              <XCircle className="w-4 h-4 mr-2" />
              {isRescheduling ? "Cancelar reprogramacion" : "Cancelar proceso"}
            </Button>
            {context?.rescheduleUrl && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => window.open(context.rescheduleUrl, "_blank")}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Cancelar/Reprogramar en EPS
              </Button>
            )}
          </div>

          {slots.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3">Horarios disponibles</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot.slotId}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
                      selectedTime === slot.time
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
              <Button
                className="w-full mt-4"
                onClick={isRescheduling ? handleReschedule : handleSchedule}
                disabled={!selectedSlot || loading}
              >
                {isRescheduling ? "Confirmar reprogramacion" : "Confirmar cita"}
              </Button>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <AppointmentList
            title="Citas activas"
            appointments={activeAppointments}
            emptyText="No tienes citas activas."
            onCancel={handleCancelAppointment}
            onReschedule={handleStartReschedule}
            loading={loading}
          />
          <AppointmentList
            title="Historial"
            appointments={history}
            emptyText="Aun no hay historial de citas."
            loading={loading}
          />
          <PortalDiagnosticPanel
            snapshot={diagnostic}
            loading={loading}
            onInspect={handleInspectPortal}
            onGoToAppointments={handleGoToPortalAppointments}
            onSelectBeneficiary={handleSelectPortalBeneficiary}
            onAcceptRedirect={handleAcceptPortalRedirect}
          />
        </section>
      </div>
    </div>
  );
}

function PortalDiagnosticPanel({
  snapshot,
  loading,
  onInspect,
  onGoToAppointments,
  onSelectBeneficiary,
  onAcceptRedirect,
}: {
  snapshot: PortalDiagnosticSnapshot | null;
  loading: boolean;
  onInspect: () => void;
  onGoToAppointments: () => void;
  onSelectBeneficiary: () => void;
  onAcceptRedirect: () => void;
}) {
  const visibleLinks = snapshot?.links
    .filter((link) => link.text || link.href)
    .slice(0, 8);

  return (
    <div className="bg-card rounded-xl shadow-card border border-border p-5">
      <h3 className="font-heading font-bold mb-3">Diagnostico portal EPS</h3>
      <div className="grid gap-2">
        <Button type="button" variant="outline" disabled={loading} onClick={onInspect}>
          Inspeccionar pagina actual
        </Button>
        <Button type="button" variant="secondary" disabled={loading} onClick={onGoToAppointments}>
          Entrar a citas e inspeccionar
        </Button>
        <Button type="button" variant="secondary" disabled={loading} onClick={onSelectBeneficiary}>
          Seleccionar persona e inspeccionar
        </Button>
        <Button type="button" variant="secondary" disabled={loading} onClick={onAcceptRedirect}>
          Entendido e inspeccionar
        </Button>
      </div>

      {snapshot && (
        <div className="mt-4 space-y-3 text-xs">
          <p className="break-all text-muted-foreground">{snapshot.url}</p>
          {snapshot.artifactPath && (
            <p className="break-all text-muted-foreground">
              Archivo: {snapshot.artifactPath}
            </p>
          )}
          <div className="grid grid-cols-3 gap-2">
            <Metric label="Links" value={snapshot.links.length} />
            <Metric label="Botones" value={snapshot.buttons.length} />
            <Metric label="Selects" value={snapshot.selects.length} />
          </div>
          {visibleLinks && visibleLinks.length > 0 && (
            <div className="space-y-1">
              <p className="font-semibold">Links detectados</p>
              {visibleLinks.map((link, index) => (
                <p key={`${link.href}-${index}`} className="truncate text-muted-foreground">
                  {link.text || link.href}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-2">
      <p className="text-muted-foreground">{label}</p>
      <p className="text-base font-bold">{value}</p>
    </div>
  );
}

function AppointmentList({
  title,
  appointments,
  emptyText,
  loading,
  onCancel,
  onReschedule,
}: {
  title: string;
  appointments: MedicalAppointment[];
  emptyText: string;
  loading: boolean;
  onCancel?: (appointmentId: string) => void;
  onReschedule?: (appointment: MedicalAppointment) => void;
}) {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border p-5">
      <h3 className="font-heading font-bold mb-3">{title}</h3>
      {appointments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div key={appointment.appointmentId} className="rounded-lg border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{appointment.appointmentType.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {appointment.beneficiary.name} - {appointment.date} {appointment.time}
                  </p>
                  <p className="text-xs text-muted-foreground">{appointment.timezone}</p>
                </div>
                <span className="text-xs font-medium capitalize">{appointment.status}</span>
              </div>
              {(onCancel || onReschedule) && appointment.status === "active" && (
                <div className="mt-3 grid gap-2">
                  {onReschedule && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      disabled={loading}
                      onClick={() => onReschedule(appointment)}
                    >
                      Reprogramar cita
                    </Button>
                  )}
                  {onCancel && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={loading}
                      onClick={() => onCancel(appointment.appointmentId)}
                    >
                      Cancelar cita
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
