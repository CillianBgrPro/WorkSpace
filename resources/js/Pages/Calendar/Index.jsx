import { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/20/solid';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import frLocale from '@fullcalendar/core/locales/fr';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import EventModal from '@/Components/Calendar/EventModal';
import useMediaQuery from '@/hooks/useMediaQuery';
import PageHeader from '@/Components/ui/PageHeader';
import Button from '@/Components/ui/Button';
import { toast } from '@/Components/ui/Toaster';
import useCanEdit from '@/hooks/useCanEdit';

const localDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function CalendarIndex({ events, users, teams }) {
    const { auth } = usePage().props;
    const [modal, setModal] = useState({ open: false, event: null, dateStr: null });

    const [announce, setAnnounce] = useState('');
    const isMobile = useMediaQuery('(max-width: 767px)');
    const canEdit = useCanEdit();
    // Sous 1024 px (tablette, ou mobile), la barre d'outils complète ne tient pas sur une ligne.
    const isCompact = useMediaQuery('(max-width: 1023px)');


    const openNew = (dateStr = localDate()) => canEdit && setModal({ open: true, event: null, dateStr: dateStr.slice(0, 10) });

    // « Nouvel événement » depuis la palette ou le dashboard : /calendar?new=1
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('new')) {
            openNew();
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const handleDateClick = (info) => openNew(info.dateStr);


    const handleEventClick = (info) => {
        const e = info.event;
        setModal({
            open: true,
            dateStr: null,
            event: {
                id: e.id,
                title: e.title,
                start_at: e.startStr,
                end_at: e.endStr,
                all_day: e.allDay,
                color: e.backgroundColor,
                ...e.extendedProps,
            },
        });
    };


    const handleEventDrop = (info) => {
        router.patch(route('calendar.move', info.event.id), {
            start_at: info.event.startStr,
            end_at: info.event.endStr || null,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setAnnounce('Événement déplacé'),
            onError: () => {
                info.revert();
                toast.error('Impossible de déplacer cet événement.');
            },
        });
    };

    return (
        <AppLayout header="Calendrier">
            <Head title="Calendrier" />

            <PageHeader
                title="Calendrier"
                description={!canEdit ? 'Consultation seule : vous avez un accès lecteur à ce projet.' : isMobile ? 'Touchez un jour pour y ajouter un événement.' : 'Cliquez sur un jour pour ajouter un événement, glissez-déposez pour le déplacer.'}
                actions={canEdit && <Button icon={PlusIcon} onClick={() => openNew()}>Nouvel événement</Button>}
            />

            <div className="rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm md:p-5">

                <div className="sr-only" aria-live="assertive" role="status">{announce}</div>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    locale={frLocale}
                    key={isMobile ? 'mobile' : isCompact ? 'compact' : 'desktop'}
                    initialView={isMobile ? 'listWeek' : 'dayGridMonth'}
                    headerToolbar={isCompact
                        ? { left: 'prev,next', center: 'title', right: 'today' }
                        : {
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                        }}
                    footerToolbar={isCompact
                        ? { center: isMobile ? 'dayGridMonth,listWeek,timeGridDay' : 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }
                        : false}
                    longPressDelay={300}
                    buttonText={{
                        today: "Aujourd'hui",
                        month: 'Mois',
                        week: 'Semaine',
                        day: 'Jour',
                        list: 'Liste',
                    }}
                    themeSystem="standard"
                    events={events}
                    editable={canEdit}
                    selectable={canEdit}
                    eventAllow={() => true}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}

                    eventContent={(arg) => {
                        const type = arg.event.extendedProps.type || 'event';
                        return (
                            <div className={`fc-event-pill fc-event-${type}`}>
                                {arg.timeText && <span className="fc-event-time">{arg.timeText}</span>}
                                <span className="fc-event-title truncate">{arg.event.title}</span>
                            </div>
                        );
                    }}
                    eventDidMount={(info) => {
                        const el = info.el;
                        el.setAttribute('role', 'button');
                        el.setAttribute('tabindex', '0');
                        el.setAttribute('aria-label', `Événement : ${info.event.title}, heure : ${info.timeText || 'toute la journée'}`);
                    }}
                    height="auto"
                />
            </div>

            {modal.open && (
                <EventModal
                    event={modal.event}
                    defaultDate={modal.dateStr}
                    users={users}
                    teams={teams}
                    currentUserId={auth.user.id}
                    onClose={() => setModal({ open: false, event: null, dateStr: null })}
                />
            )}
        </AppLayout>
    );
}