import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useSearchParams,
} from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Activity,
  CalendarDays,
  Users,
  LayoutDashboard,
  Settings,
  LogOut,
  Plus,
  ArrowRight,
  ShieldCheck,
  Search,
  X,
} from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import luxonPlugin from '@fullcalendar/luxon3';
import trLocale from '@fullcalendar/core/locales/tr';
import {
  Appointment,
  Package,
  Patient,
  Session,
  Staff,
  Resource,
  Viewer,
  patientInput,
} from '@clinic/contracts';
import {
  api,
  dayNow,
  getViewer,
  instant,
  localDay,
  localTime,
  setCsrf,
} from './api';
const labels: Record<string, string> = {
  scheduled: 'Planlandı',
  in_progress: 'Seans başladı',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
  no_show: 'Gelmedi',
};
const roleLabels = {
  ADMIN: 'Yönetici',
  THERAPIST: 'Fizyoterapist',
  RECEPTIONIST: 'Resepsiyon',
};
function ErrorText({ error }: { error: unknown }) {
  return error ? (
    <p role="alert" className="error">
      {error instanceof Error ? error.message : 'İşlem başarısız.'}
    </p>
  ) : null;
}
function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: React.ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = ref.current;
    const focusables = () =>
      Array.from(
        element?.querySelectorAll<HTMLElement>(
          'button,input,select,textarea,a[href],[tabindex="0"]',
        ) || [],
      ).filter((x) => !x.hasAttribute('disabled'));
    focusables()[0]?.focus();
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const items = focusables(),
          first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', fn);
    return () => {
      window.removeEventListener('keydown', fn);
      previous?.focus();
    };
  }, []);
  return (
    <div className="scrim" onClick={close}>
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <h2>{title}</h2>
          <button className="icon" aria-label="Kapat" onClick={close}>
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
function Login({ onLogin }: { onLogin: () => void }) {
  const [step, setStep] = useState<{
    secret: string | null;
    enrollmentUri: string | null;
  } | null>(null);
  const [invite, setInvite] = useState(
    location.hash.startsWith('#invite=') ? location.hash.slice(8) : '',
  );
  const [message, setMessage] = useState('');
  const mutation = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      const d = new FormData(form);
      if (invite) {
        await api('/auth/accept-invite', 'POST', {
          token: invite,
          password: d.get('password'),
        });
        setInvite('');
        history.replaceState(null, '', location.pathname);
        setMessage('Hesabınız hazır. E-posta ve parolanızla giriş yapın.');
        return;
      }
      if (step) {
        await api('/auth/verify', 'POST', { code: d.get('code') });
        setStep(null);
        onLogin();
        return;
      }
      const result = await api<{
        authenticated?: boolean;
        csrf: string;
        secret: string | null;
        enrollmentUri: string | null;
      }>('/auth/login', 'POST', {
        email: d.get('email'),
        password: d.get('password'),
      });
      setCsrf(result.csrf);
      if (result.authenticated) {
        onLogin();
        return;
      }
      setStep(result);
    },
  });
  return (
    <main className="login">
      <div className="login-story">
        <div className="brand">
          <Activity />
          <span>
            HG <small>KLİNİK YÖNETİMİ</small>
          </span>
        </div>
        <div>
          <p className="eyebrow">FİZYOTERAPİST HAMİT GÜMÜŞ</p>
          <h1>
            Gününüz düzenli.
            <br />
            Takibiniz güvenilir.
          </h1>
          <p>
            Randevular, seanslar ve paketler.
            <br />
            Kliniğinizin günlük akışı tek yerde.
          </p>
        </div>
        <small>Yenişehir, Mersin · İç kullanım</small>
      </div>
      <section className="auth-card">
        <ShieldCheck className="auth-icon" />
        <p className="eyebrow">GÜVENLİ ÇALIŞMA ALANI</p>
        <h2>
          {invite
            ? 'Hesabınızı etkinleştirin'
            : step
              ? 'İki adımlı doğrulama'
              : 'Kliniğinize giriş yapın'}
        </h2>
        <p className="muted">
          {step
            ? 'Kimlik doğrulama uygulamanızdaki 6 haneli kodu girin.'
            : 'Yetkili personel hesabınızla devam edin.'}
        </p>
        {step?.secret && (
          <div className="setup">
            <p>
              Authenticator uygulamanıza bu anahtarı ekleyin. Bu bilgi yalnız bu
              kurulum adımında gösterilir.
            </p>
            <code>{step.secret}</code>
            <p>Hesap: Klinik · TOTP · 6 hane · 30 saniye</p>
          </div>
        )}
        <form
          key={invite ? 'invite' : step ? 'verify' : 'login'}
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(e.currentTarget);
          }}
        >
          {!step && !invite && (
            <label>
              E-posta
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
              />
            </label>
          )}
          {!step ? (
            <label>
              {invite ? 'Yeni parola (en az 14 karakter)' : 'Parola'}
              <input
                name="password"
                type="password"
                minLength={invite ? 14 : 1}
                autoComplete={invite ? 'new-password' : 'current-password'}
                required
              />
            </label>
          ) : (
            <label>
              Doğrulama kodu
              <input
                autoFocus
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
              />
            </label>
          )}
          <ErrorText error={mutation.error} />
          {message && <p role="status">{message}</p>}
          <button className="primary" disabled={mutation.isPending}>
            {mutation.isPending
              ? 'Kontrol ediliyor…'
              : invite
                ? 'Hesabı etkinleştir'
                : step
                  ? 'Doğrula'
                  : 'Giriş yap'}
            <ArrowRight size={17} />
          </button>
          {step && (
            <button
              type="button"
              className="plain"
              onClick={() => {
                setStep(null);
                mutation.reset();
              }}
            >
              Girişe dön
            </button>
          )}
        </form>
        <small className="muted">
          Erişim veya MFA kurtarma için klinik yöneticisine başvurun.
        </small>
      </section>
    </main>
  );
}
export function App() {
  const client = useQueryClient();
  const viewer = useQuery({
    queryKey: ['viewer'],
    queryFn: getViewer,
    retry: false,
  });
  useEffect(() => {
    const fn = () => {
      client.setQueryData(['viewer'], null);
      client.removeQueries({ predicate: (q) => q.queryKey[0] !== 'viewer' });
    };
    window.addEventListener('session-expired', fn);
    return () => window.removeEventListener('session-expired', fn);
  }, [client]);
  if (viewer.isPending)
    return <div className="loading">Klinik yükleniyor…</div>;
  if (!viewer.data)
    return (
      <Login
        onLogin={() => void client.invalidateQueries({ queryKey: ['viewer'] })}
      />
    );
  const v = viewer.data;
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Activity />
          <span>
            HG <small>KLİNİK YÖNETİMİ</small>
          </span>
        </div>
        <p className="nav-caption">ÇALIŞMA ALANI</p>
        <nav>
          <NavLink to="/" end>
            <LayoutDashboard size={19} />
            Günlük özet
          </NavLink>
          <NavLink to="/patients">
            <Users size={19} />
            Hastalar
          </NavLink>
          <NavLink to="/appointments">
            <CalendarDays size={19} />
            Randevular
          </NavLink>
          {v.role === 'ADMIN' && (
            <NavLink to="/settings">
              <Settings size={19} />
              Yönetim
            </NavLink>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="secure">
            <ShieldCheck size={16} />
            Korumalı oturum
          </div>
          <strong>{v.name}</strong>
          <small>{roleLabels[v.role]}</small>
          <button
            className="plain"
            onClick={async () => {
              await api('/auth/logout', 'POST');
              client.setQueryData(['viewer'], null);
              client.removeQueries({
                predicate: (q) => q.queryKey[0] !== 'viewer',
              });
            }}
          >
            <LogOut size={16} />
            Çıkış yap
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            Fizyoterapist Hamit Gümüş <span className="muted">/ Klinik</span>
          </span>
          <span className="date">
            {new Intl.DateTimeFormat('tr-TR', {
              dateStyle: 'long',
              timeZone: 'Europe/Istanbul',
            }).format(new Date())}
          </span>
        </header>
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard viewer={v} />} />
            <Route path="/patients" element={<Patients viewer={v} />} />
            <Route path="/appointments" element={<Appointments viewer={v} />} />
            <Route
              path="/settings"
              element={
                v.role === 'ADMIN' ? <SettingsPage /> : <Navigate to="/" />
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer>
          HG · Klinik operasyonları <span>Europe/Istanbul</span>
        </footer>
      </div>
    </div>
  );
}
function Heading({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
function useDay(date: string) {
  return useQuery({
    queryKey: ['appointments', date],
    queryFn: () =>
      api<Appointment[]>(
        `/appointments?from=${encodeURIComponent(instant(date, '00:00'))}&to=${encodeURIComponent(new Date(new Date(instant(date, '00:00')).getTime() + 86400000).toISOString())}`,
      ),
  });
}
function Dashboard({ viewer }: { viewer: Viewer }) {
  const q = useDay(dayNow());
  const rows = q.data || [];
  return (
    <>
      <Heading
        eyebrow="GÜNLÜK ÖZET"
        title="Bugün klinikte"
        subtitle="Günün randevuları ve seans akışı."
      />
      <div className="stats">
        {[
          [
            'Planlı randevu',
            rows.filter((a) => a.status === 'scheduled').length,
          ],
          [
            'Seans başladı',
            rows.filter((a) => a.status === 'in_progress').length,
          ],
          ['Tamamlanan', rows.filter((a) => a.status === 'completed').length],
          [
            'İptal / gelmedi',
            rows.filter((a) => ['cancelled', 'no_show'].includes(a.status))
              .length,
          ],
        ].map(([label, num]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <strong>{q.isPending ? '—' : num}</strong>
            <small>Bugün</small>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="panel-heading">
          <h2>Günün akışı</h2>
          <NavLink to="/appointments">
            Takvimi aç <ArrowRight size={15} />
          </NavLink>
        </div>
        <ErrorText error={q.error} />
        {q.isPending ? (
          <p>Yükleniyor…</p>
        ) : (
          <AppointmentRows rows={rows} viewer={viewer} />
        )}
      </div>
      <div className="note">
        <ShieldCheck size={21} />
        <div>
          <strong>Her işlem kayıt altında</strong>
          <p>
            Seans tamamlandığında paket bakiyesi otomatik güncellenir. İptal ve
            gelmeme bakiyeyi etkilemez.
          </p>
        </div>
      </div>
    </>
  );
}
function PatientForm({
  patient,
  done,
}: {
  patient?: Patient;
  done: () => void;
}) {
  const client = useQueryClient();
  const [warning, setWarning] = useState('');
  const form = useForm<
    z.input<typeof patientInput>,
    unknown,
    z.output<typeof patientInput>
  >({
    resolver: zodResolver(patientInput),
    defaultValues: {
      fullName: patient?.fullName || '',
      phone: patient?.phone || '',
      administrativeNote: patient?.administrativeNote || '',
    },
  });
  const mutation = useMutation({
    mutationFn: (v: z.output<typeof patientInput>) =>
      api<Patient & { warning?: string }>(
        patient ? '/patients/' + patient.id : '/patients',
        patient ? 'PATCH' : 'POST',
        v,
      ),
    onSuccess: async (data) => {
      await client.invalidateQueries({ queryKey: ['patients'] });
      if (data.warning) setWarning(data.warning);
      else done();
    },
  });
  return (
    <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
      <label>
        Ad soyad
        <input {...form.register('fullName')} />
      </label>
      <label>
        Telefon
        <input type="tel" {...form.register('phone')} />
      </label>
      <label>
        İdari not
        <textarea
          placeholder="Yalnız idari bilgi. Teşhis veya tedavi bilgisi girmeyin."
          {...form.register('administrativeNote')}
        />
      </label>
      {Object.values(form.formState.errors).map((e, i) => (
        <p className="error" key={i}>
          {e.message}
        </p>
      ))}
      <ErrorText error={mutation.error} />
      {warning ? (
        <>
          <p role="status">Kaydedildi. {warning}</p>
          <button type="button" onClick={done}>
            Kapat
          </button>
        </>
      ) : (
        <button className="primary" disabled={mutation.isPending}>
          Kaydet
        </button>
      )}
    </form>
  );
}
function Patients({ viewer }: { viewer: Viewer }) {
  const [q, setQ] = useState(''),
    [archived, setArchived] = useState(false),
    [add, setAdd] = useState(false),
    [selected, setSelected] = useState<Patient | null>(null),
    [edit, setEdit] = useState<Patient | null>(null);
  const query = useQuery({
    queryKey: ['patients', q, archived],
    queryFn: () =>
      api<Patient[]>(
        `/patients?q=${encodeURIComponent(q)}&archived=${archived}`,
      ),
  });
  return (
    <>
      <Heading
        eyebrow="HASTA YÖNETİMİ"
        title="Hasta rehberi"
        subtitle="İletişim bilgileri, seans geçmişi ve paket bakiyeleri."
      >
        <button className="primary" onClick={() => setAdd(true)}>
          <Plus size={18} />
          Hasta ekle
        </button>
      </Heading>
      <div className="panel">
        <div className="toolbar">
          <label className="search">
            <Search size={18} />
            <input
              aria-label="Hasta ara"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ad veya telefon ile ara"
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
            />
            Arşiv
          </label>
          <span className="muted">En fazla 200 kayıt</span>
        </div>
        <ErrorText error={query.error} />
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Hasta</th>
                <th>Dosya no</th>
                <th>Telefon</th>
                <th>Durum</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {query.data?.map((p) => (
                <tr key={p.id}>
                  <td>
                    <button
                      className="patient-link"
                      onClick={() => setSelected(p)}
                    >
                      <span className="avatar">{p.fullName.slice(0, 1)}</span>
                      {p.fullName}
                    </button>
                  </td>
                  <td>HG-{String(p.fileNumber).padStart(4, '0')}</td>
                  <td>{p.phone}</td>
                  <td>
                    <span className="badge">
                      {p.archivedAt ? 'Arşiv' : 'Aktif'}
                    </span>
                  </td>
                  <td>
                    {viewer.role !== 'THERAPIST' && (
                      <button className="plain" onClick={() => setEdit(p)}>
                        Düzenle
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!query.data?.length && (
          <p className="empty">
            {query.isPending
              ? 'Yükleniyor…'
              : 'Kayıt bulunamadı. İlk hastanızı ekleyin.'}
          </p>
        )}
      </div>
      {add && (
        <Modal title="Yeni hasta" close={() => setAdd(false)}>
          <PatientForm done={() => setAdd(false)} />
        </Modal>
      )}
      {edit && (
        <Modal title="Hasta bilgilerini düzenle" close={() => setEdit(null)}>
          <PatientForm patient={edit} done={() => setEdit(null)} />
        </Modal>
      )}
      {selected && (
        <PatientDetails
          patient={selected}
          viewer={viewer}
          close={() => setSelected(null)}
        />
      )}
    </>
  );
}
function PatientDetails({
  patient,
  viewer,
  close,
}: {
  patient: Patient;
  viewer: Viewer;
  close: () => void;
}) {
  const client = useQueryClient();
  const packages = useQuery({
    queryKey: ['packages', patient.id],
    queryFn: () => api<Package[]>('/packages?patientId=' + patient.id),
  });
  const sessions = useQuery({
    queryKey: ['sessions', patient.id],
    queryFn: () => api<Session[]>('/sessions?patientId=' + patient.id),
  });
  const mutation = useMutation({
    mutationFn: ({ path, body }: { path: string; body?: unknown }) =>
      api(path, 'POST', body),
    onSuccess: async () => {
      await client.invalidateQueries();
    },
  });
  return (
    <Modal title={patient.fullName} close={close}>
      <p className="muted">
        {patient.phone} · HG-{patient.fileNumber}
      </p>
      {patient.administrativeNote && <p>{patient.administrativeNote}</p>}
      <h3>Seans paketleri</h3>
      <ErrorText error={packages.error} />
      {packages.data?.map((p) => (
        <div className="package" key={p.id}>
          <strong>{p.label}</strong>
          <span>
            <b>{p.remaining}</b> / {p.total} seans kaldı
          </span>
        </div>
      ))}
      {!packages.data?.length && <p className="muted">Henüz paket yok.</p>}
      {viewer.role === 'ADMIN' && !patient.archivedAt && (
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            mutation.mutate({
              path: '/packages',
              body: {
                patientId: patient.id,
                label: d.get('label'),
                total: Number(d.get('total')),
              },
            });
            e.currentTarget.reset();
          }}
        >
          <label>
            Paket adı
            <input name="label" required maxLength={80} />
          </label>
          <label>
            Seans hakkı
            <input
              type="number"
              name="total"
              required
              min="1"
              max="200"
              defaultValue="10"
            />
          </label>
          <button disabled={mutation.isPending}>Paket aç</button>
        </form>
      )}
      <h3>Seans geçmişi</h3>
      <ErrorText error={sessions.error} />
      {sessions.data?.map((s) => (
        <div className="history" key={s.id}>
          <div>
            <strong>
              {localDay(s.appointment.startsAt)} ·{' '}
              {localTime(s.appointment.startsAt)}
            </strong>
            <p className="muted">
              {s.reversedAt ? 'Geri alındı' : 'Tamamlandı'} ·{' '}
              {s.appointment.staff.name}
            </p>
          </div>
          {viewer.role === 'ADMIN' && !s.reversedAt && (
            <button
              className="plain"
              disabled={mutation.isPending}
              onClick={() => {
                const reason = prompt('Düzeltme gerekçesi (en az 5 karakter):');
                if (reason)
                  mutation.mutate({
                    path: '/sessions/' + s.id + '/reverse',
                    body: { reason },
                  });
              }}
            >
              Geri al
            </button>
          )}
        </div>
      ))}
      {!sessions.data?.length && <p className="muted">Seans kaydı yok.</p>}
      <ErrorText error={mutation.error} />
      {viewer.role !== 'THERAPIST' && !patient.archivedAt && (
        <button
          className="danger"
          disabled={mutation.isPending}
          onClick={() => {
            if (confirm('Hasta arşive alınsın mı? Geçmiş kayıtlar korunur.'))
              mutation.mutate(
                { path: '/patients/' + patient.id + '/archive' },
                { onSuccess: close },
              );
          }}
        >
          Hastayı arşivle
        </button>
      )}
    </Modal>
  );
}
function AppointmentRows({
  rows,
  viewer,
  onMove,
}: {
  rows: Appointment[];
  viewer: Viewer;
  onMove?: (a: Appointment) => void;
}) {
  const [complete, setComplete] = useState<Appointment | null>(null);
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ a, status }: { a: Appointment; status: string }) =>
      api('/appointments/' + a.id + '/status', 'POST', {
        status,
        version: a.version,
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['appointments'] }),
  });
  return (
    <>
      <ErrorText error={mutation.error} />
      {!rows.length && (
        <div className="empty">
          <CalendarDays size={30} />
          <h3>Bu gün için randevu yok</h3>
          <p>Yeni randevu ekleyerek gününüzü planlayın.</p>
        </div>
      )}
      {rows.map((a) => (
        <div className="appointment-row" key={a.id}>
          <div className="time">
            {localTime(a.startsAt)}
            <small>{localTime(a.endsAt)}</small>
          </div>
          <div className="appointment-person">
            <strong>{a.patient.fullName}</strong>
            <small>
              {a.staff.name} · {a.resource.name}
            </small>
          </div>
          <span className={'badge ' + a.status}>{labels[a.status]}</span>
          {['scheduled', 'in_progress'].includes(a.status) && (
            <div className="actions">
              {a.status === 'scheduled' && onMove && (
                <button className="plain" onClick={() => onMove(a)}>
                  Taşı
                </button>
              )}
              {viewer.role !== 'RECEPTIONIST' && (
                <button className="small" onClick={() => setComplete(a)}>
                  Tamamla
                </button>
              )}
              {a.status === 'scheduled' && viewer.role !== 'RECEPTIONIST' && (
                <button
                  className="plain"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ a, status: 'in_progress' })}
                >
                  Başlat
                </button>
              )}
              <select
                aria-label={a.patient.fullName + ' randevu durumu'}
                value=""
                disabled={mutation.isPending}
                onChange={(e) => {
                  if (
                    e.target.value &&
                    confirm('Randevu durumu değiştirilsin mi?')
                  )
                    mutation.mutate({ a, status: e.target.value });
                }}
              >
                <option value="">Diğer…</option>
                <option value="cancelled">İptal</option>
                <option value="no_show">Gelmedi</option>
              </select>
            </div>
          )}
        </div>
      ))}
      {complete && (
        <CompleteModal appointment={complete} close={() => setComplete(null)} />
      )}
    </>
  );
}
function CompleteModal({
  appointment: a,
  close,
}: {
  appointment: Appointment;
  close: () => void;
}) {
  const client = useQueryClient();
  const packages = useQuery({
    queryKey: ['packages', a.patientId],
    queryFn: () => api<Package[]>('/packages?patientId=' + a.patientId),
  });
  const [key] = useState(crypto.randomUUID());
  const mutation = useMutation({
    mutationFn: (packageId: string) =>
      api('/appointments/' + a.id + '/complete', 'POST', { packageId }, key),
    onSuccess: async () => {
      await client.invalidateQueries();
      close();
    },
  });
  return (
    <Modal title="Seansı tamamla" close={close}>
      <p>
        {a.patient.fullName} · {localTime(a.startsAt)}
      </p>
      <p className="muted">
        Seçilen paketten bir seans düşülür. İşlem tekrar gönderilse de bir kez
        uygulanır.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(
            String(new FormData(e.currentTarget).get('packageId')),
          );
        }}
      >
        <label>
          Paket
          <select aria-label="Paket" name="packageId" required>
            <option value="">Paket seçin</option>
            {packages.data
              ?.filter((p) => p.remaining > 0)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} · {p.remaining} kaldı
                </option>
              ))}
          </select>
        </label>
        <ErrorText error={packages.error || mutation.error} />
        <button
          className="primary"
          disabled={
            mutation.isPending || !packages.data?.some((p) => p.remaining > 0)
          }
        >
          Tamamla ve bir seans düş
        </button>
      </form>
    </Modal>
  );
}
function AppointmentForm({
  appointment: a,
  viewer,
  date,
  close,
}: {
  appointment?: Appointment;
  viewer: Viewer;
  date: string;
  close: () => void;
}) {
  const client = useQueryClient();
  const patients = useQuery({
    queryKey: ['patients', '', false],
    queryFn: () => api<Patient[]>('/patients'),
  });
  const staff = useQuery({
    queryKey: ['staff'],
    queryFn: () => api<Staff[]>('/staff'),
  });
  const resources = useQuery({
    queryKey: ['resources'],
    queryFn: () => api<Resource[]>('/resources'),
  });
  const [key] = useState(crypto.randomUUID());
  const mutation = useMutation({
    mutationFn: (form: HTMLFormElement) => {
      const d = new FormData(form);
      const appointment = {
        patientId: d.get('patientId'),
        staffId: d.get('staffId'),
        resourceId: d.get('resourceId'),
        startsAt: instant(String(d.get('date')), String(d.get('start'))),
        endsAt: instant(String(d.get('date')), String(d.get('end'))),
      };
      return api(
        a ? '/appointments/' + a.id : '/appointments',
        a ? 'PATCH' : 'POST',
        a ? { appointment, version: a.version } : appointment,
        key,
      );
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['appointments'] });
      close();
    },
  });
  return (
    <Modal title={a ? 'Randevuyu taşı' : 'Yeni randevu'} close={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(e.currentTarget);
        }}
      >
        <label>
          Hasta
          <select
            aria-label="Hasta"
            name="patientId"
            defaultValue={a?.patientId || ''}
            required
            onChange={() => mutation.reset()}
          >
            <option value="">Hasta seçin</option>
            {patients.data
              ?.filter((p) => !a || p.id === a.patientId)
              .map((p) => (
                <option value={p.id} key={p.id}>
                  {p.fullName} · {p.phone}
                </option>
              ))}
          </select>
        </label>
        <div className="inline-form">
          <label>
            Fizyoterapist
            <select
              aria-label="Fizyoterapist"
              name="staffId"
              defaultValue={a?.staffId || viewer.staffId || ''}
              required
            >
              {staff.data
                ?.filter(
                  (s) => viewer.role !== 'THERAPIST' || s.id === viewer.staffId,
                )
                .map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Oda / sedye
            <select
              aria-label="Oda / sedye"
              name="resourceId"
              defaultValue={a?.resourceId}
              required
            >
              {resources.data?.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Tarih
          <input
            name="date"
            type="date"
            defaultValue={a ? localDay(a.startsAt) : date}
            required
          />
        </label>
        <div className="inline-form">
          <label>
            Başlangıç
            <input
              name="start"
              type="time"
              defaultValue={a ? localTime(a.startsAt) : '09:00'}
              required
            />
          </label>
          <label>
            Bitiş
            <input
              name="end"
              type="time"
              defaultValue={a ? localTime(a.endsAt) : '10:00'}
              required
            />
          </label>
        </div>
        <p className="muted">
          Saatler Türkiye saatidir. Personel, hasta ve oda/sedye müsaitliği
          kayıtta kontrol edilir.
        </p>
        <ErrorText
          error={
            patients.error || staff.error || resources.error || mutation.error
          }
        />
        <button className="primary" disabled={mutation.isPending}>
          Randevuyu kaydet
        </button>
      </form>
    </Modal>
  );
}
function Appointments({ viewer }: { viewer: Viewer }) {
  const [params, setParams] = useSearchParams();
  const date = z.iso.date().safeParse(params.get('date')).success
    ? params.get('date')!
    : dayNow();
  const setDate = (v: string) => setParams({ date: v });
  const [view, setView] = useState<'day' | 'week'>('day'),
    [staff, setStaff] = useState(''),
    [resource, setResource] = useState(''),
    [form, setForm] = useState<Appointment | 'new' | null>(null);
  const query = useDay(date);
  const staffQuery = useQuery({
    queryKey: ['staff'],
    queryFn: () => api<Staff[]>('/staff'),
  });
  const resourceQuery = useQuery({
    queryKey: ['resources'],
    queryFn: () => api<Resource[]>('/resources'),
  });
  const week = useQuery({
    queryKey: ['appointments', 'week', date],
    enabled: view === 'week',
    queryFn: () =>
      api<Appointment[]>(
        `/appointments?from=${encodeURIComponent(instant(date, '00:00'))}&to=${encodeURIComponent(new Date(new Date(instant(date, '00:00')).getTime() + 7 * 86400000).toISOString())}`,
      ),
  });
  const filter = (a: Appointment) =>
    (!staff || a.staffId === staff) && (!resource || a.resourceId === resource);
  return (
    <>
      <Heading
        eyebrow="RANDEVU YÖNETİMİ"
        title="Klinik takvimi"
        subtitle="Ekibinizin ve odalarınızın günlük akışı."
      >
        <button className="primary" onClick={() => setForm('new')}>
          <Plus size={18} />
          Randevu ekle
        </button>
      </Heading>
      <div className="panel">
        <div className="toolbar wrap">
          <input
            aria-label="Takvim tarihi"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <select
            aria-label="Personel filtresi"
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
          >
            <option value="">Tüm personel</option>
            {staffQuery.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Kaynak filtresi"
            value={resource}
            onChange={(e) => setResource(e.target.value)}
          >
            <option value="">Tüm odalar</option>
            {resourceQuery.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="segmented">
            <button
              className={view === 'day' ? 'active' : ''}
              onClick={() => setView('day')}
            >
              Gün
            </button>
            <button
              className={view === 'week' ? 'active' : ''}
              onClick={() => setView('week')}
            >
              Hafta
            </button>
          </div>
        </div>
        <ErrorText error={query.error || week.error} />
        {view === 'day' ? (
          <AppointmentRows
            rows={(query.data || []).filter(filter)}
            viewer={viewer}
            onMove={setForm}
          />
        ) : (
          <FullCalendar
            key={date}
            plugins={[timeGridPlugin, interactionPlugin, luxonPlugin]}
            initialView="timeGridWeek"
            initialDate={date}
            firstDay={new Date(instant(date, '12:00')).getDay()}
            timeZone="Europe/Istanbul"
            locale={trLocale}
            headerToolbar={false}
            allDaySlot={false}
            height="auto"
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            events={(week.data || []).filter(filter).map((a) => ({
              id: a.id,
              title: a.patient.fullName + ' · ' + labels[a.status],
              start: a.startsAt,
              end: a.endsAt,
              backgroundColor: a.status === 'cancelled' ? '#89938f' : '#517a6c',
            }))}
            eventClick={(info) => {
              const a = week.data?.find((x) => x.id === info.event.id);
              if (a?.status === 'scheduled') setForm(a);
            }}
          />
        )}
      </div>
      {form && (
        <AppointmentForm
          appointment={form === 'new' ? undefined : form}
          viewer={viewer}
          date={date}
          close={() => setForm(null)}
        />
      )}
    </>
  );
}
function SettingsPage() {
  const client = useQueryClient();
  const staff = useQuery({
    queryKey: ['staff'],
    queryFn: () =>
      api<
        (Staff & {
          absences: { id: string; startsAt: string; endsAt: string }[];
        })[]
      >('/staff'),
  });
  const resources = useQuery({
    queryKey: ['resources'],
    queryFn: () => api<Resource[]>('/resources'),
  });
  const users = useQuery({
    queryKey: ['users'],
    queryFn: () =>
      api<
        {
          id: string;
          name: string;
          email: string;
          role: keyof typeof roleLabels;
          active: boolean;
        }[]
      >('/users'),
  });
  const audit = useQuery({
    queryKey: ['audit'],
    queryFn: () =>
      api<
        {
          id: string;
          action: string;
          targetId: string;
          createdAt: string;
          requestId: string;
        }[]
      >('/audit'),
  });
  const [invite, setInvite] = useState('');
  const mutation = useMutation({
    mutationFn: ({
      path,
      body,
      method = 'POST',
    }: {
      path: string;
      body?: unknown;
      method?: string;
    }) => api<{ inviteToken?: string }>(path, method, body),
    onSuccess: async (data) => {
      if (data.inviteToken)
        setInvite(location.origin + '/#invite=' + data.inviteToken);
      await client.invalidateQueries();
    },
  });
  const submit = (
    e: FormEvent<HTMLFormElement>,
    path: string,
    body: (d: FormData) => unknown,
    method = 'POST',
  ) => {
    e.preventDefault();
    mutation.mutate({
      path,
      body: body(new FormData(e.currentTarget)),
      method,
    });
  };
  return (
    <>
      <Heading
        eyebrow="KLİNİK YÖNETİMİ"
        title="Ekip ve ayarlar"
        subtitle="Erişim, çalışma saatleri ve işlem geçmişi."
      />
      <ErrorText
        error={
          mutation.error ||
          staff.error ||
          resources.error ||
          users.error ||
          audit.error
        }
      />
      <div className="settings-grid">
        <section className="panel">
          <h2>Personel ve çalışma saatleri</h2>
          {staff.data?.map((s) => (
            <details key={s.id}>
              <summary>
                {s.name} · {s.startMinute / 60}:00–{s.endMinute / 60}:00
              </summary>
              <form
                onSubmit={(e) =>
                  submit(
                    e,
                    '/staff/' + s.id,
                    (d) => ({
                      name: d.get('name'),
                      startMinute: Number(d.get('startMinute')),
                      endMinute: Number(d.get('endMinute')),
                      weekdays: String(d.get('weekdays'))
                        .split(',')
                        .map(Number),
                    }),
                    'PATCH',
                  )
                }
              >
                <label>
                  Ad
                  <input name="name" defaultValue={s.name} required />
                </label>
                <label>
                  Başlangıç (dakika, 09:00 = 540)
                  <input
                    type="number"
                    name="startMinute"
                    defaultValue={s.startMinute}
                    required
                  />
                </label>
                <label>
                  Bitiş (dakika, 18:00 = 1080)
                  <input
                    type="number"
                    name="endMinute"
                    defaultValue={s.endMinute}
                    required
                  />
                </label>
                <label>
                  Günler (Pzt=1, Paz=7)
                  <input
                    name="weekdays"
                    defaultValue={s.weekdays.join(',')}
                    required
                  />
                </label>
                <button disabled={mutation.isPending}>Saatleri güncelle</button>
              </form>
              <h3>İzin ekle</h3>
              <form
                onSubmit={(e) =>
                  submit(e, '/staff/' + s.id + '/absences', (d) => ({
                    startsAt: new Date(
                      String(d.get('start')) + '+03:00',
                    ).toISOString(),
                    endsAt: new Date(
                      String(d.get('end')) + '+03:00',
                    ).toISOString(),
                  }))
                }
              >
                <label>
                  Başlangıç
                  <input type="datetime-local" name="start" required />
                </label>
                <label>
                  Bitiş
                  <input type="datetime-local" name="end" required />
                </label>
                <button disabled={mutation.isPending}>İzin kaydet</button>
              </form>
              {s.absences.map((a) => (
                <p key={a.id}>
                  {localDay(a.startsAt)} – {localDay(a.endsAt)}
                </p>
              ))}
            </details>
          ))}
          <form
            onSubmit={(e) =>
              submit(e, '/staff', (d) => ({
                name: d.get('name'),
                startMinute: 540,
                endMinute: 1080,
                weekdays: [1, 2, 3, 4, 5],
              }))
            }
          >
            <label>
              Yeni personel
              <input name="name" required minLength={2} />
            </label>
            <button disabled={mutation.isPending}>Personel ekle</button>
          </form>
        </section>
        <section className="panel">
          <h2>Oda ve sedyeler</h2>
          {resources.data?.map((r) => (
            <p key={r.id}>{r.name}</p>
          ))}
          <form
            onSubmit={(e) =>
              submit(e, '/resources', (d) => ({ name: d.get('name') }))
            }
          >
            <label>
              Kaynak adı
              <input name="name" required minLength={2} />
            </label>
            <button disabled={mutation.isPending}>Kaynak ekle</button>
          </form>
          <h2>Personel daveti</h2>
          <form
            onSubmit={(e) =>
              submit(e, '/users', (d) => ({
                name: d.get('name'),
                email: d.get('email'),
                role: d.get('role'),
                ...(d.get('staffId') ? { staffId: d.get('staffId') } : {}),
              }))
            }
          >
            <label>
              Ad
              <input name="name" required />
            </label>
            <label>
              E-posta
              <input name="email" type="email" required />
            </label>
            <label>
              Rol
              <select name="role">
                <option value="RECEPTIONIST">Resepsiyon</option>
                <option value="THERAPIST">Fizyoterapist</option>
                <option value="ADMIN">Yönetici</option>
              </select>
            </label>
            <label>
              Personel bağlantısı
              <select aria-label="Fizyoterapist" name="staffId">
                <option value="">Yok</option>
                {staff.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <button disabled={mutation.isPending}>Davet oluştur</button>
          </form>
          {invite && (
            <div className="setup">
              <p>
                Bu bağlantıyı kullanıcıya güvenli kanaldan iletin. 24 saat
                geçerlidir.
              </p>
              <textarea readOnly aria-label="Davet bağlantısı" value={invite} />
              <button onClick={() => setInvite('')}>Gizle</button>
            </div>
          )}
          {users.data?.map((u) => (
            <div className="history" key={u.id}>
              <span>
                {u.name}
                <small>
                  {roleLabels[u.role]} · {u.active ? 'Aktif' : 'Pasif / davet'}
                </small>
              </span>
              {u.active && (
                <button
                  className="plain"
                  disabled={mutation.isPending}
                  onClick={() => {
                    if (confirm('Kullanıcının erişimi kapatılsın mı?'))
                      mutation.mutate({ path: '/users/' + u.id + '/disable' });
                  }}
                >
                  Kapat
                </button>
              )}
            </div>
          ))}
        </section>
      </div>
      <section className="panel audit">
        <h2>Son 100 işlem</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Zaman</th>
                <th>İşlem</th>
                <th>İstek kimliği</th>
              </tr>
            </thead>
            <tbody>
              {audit.data?.map((a) => (
                <tr key={a.id}>
                  <td>
                    {localDay(a.createdAt)} {localTime(a.createdAt)}
                  </td>
                  <td>{a.action}</td>
                  <td>
                    <code>{a.requestId}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
