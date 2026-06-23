import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import frLocale from '@fullcalendar/core/locales/fr';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import EventModal from '@/Components/Calendar/EventModal';

export default function CalendarIndex({ events, users, teams }) {
    const { auth } = usePage().props;
    const [modal, setModal] = useState({ open: false, event: null, dateStr: null });

    const [announce, setAnnounce] = useState('');


    const handleDateClick = (info) => {
        setModal({ open: true, event: null, dateStr: info.dateStr });
    };


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


    const handleEventDrop = async (info) => {
        try {
            await router.patch(route('calendar.move', info.event.id), {
                start_at: info.event.startStr,
                end_at: info.event.endStr || null,
            }, { preserveScroll: true });
            setAnnounce('Événement déplacé avec succès');
        } catch (error) {
            console.error('Erreur lors du déplacement de l’événement :', error);
            if (typeof toast === 'function') {
                toast.error('Impossible de déplacer cet événement.');
            }
            setAnnounce('Erreur lors du déplacement de l’événement');
            info.revert();
        }
    };

    return (
        <AppLayout header="Calendrier">

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">

                <div className="sr-only" aria-live="assertive" role="status">{announce}</div>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    locale={frLocale}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                    }}
                    buttonText={{
                        today: "Aujourd'hui",
                        month: 'Mois',
                        week: 'Semaine',
                        day: 'Jour',
                        list: 'Liste',
                    }}
                    themeSystem="standard"
                    events={events}
                    editable={true}
                    selectable={true}
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