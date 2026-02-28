import React, { useState } from 'react'

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-4 bg-red-100 text-red-700 mt-8 rounded flex-col"><h2>Došlo je do greške u kalendaru:</h2><pre className="text-sm mt-2">{this.state.error?.toString()}</pre></div>;
    }
    return this.props.children;
  }
}

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'

import EventModal from './EventModal'

interface EventData {
  title: string;
  description: string;
  datetime: string | Date;
  location: string;
  category?: string;
}

interface Event {
  data: EventData;
}

interface SelectedEvent {
  title: string;
  description: string;
  location: string;
  category?: string;
  date: string;
  time: string;
}

export default function EventCalendar({ events = [] }: { events?: Event[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('Sve');

    // Extract unique categories
    const categories = Array.from(new Set(['Sve', ...events.map(e => e.data.category).filter(Boolean) as string[]]));

    const filteredEvents = activeCategory === 'Sve' 
      ? events 
      : events.filter(e => e.data.category === activeCategory);

    const calendarEvents = filteredEvents.map(event => ({
        title: event.data.title,
        date: new Date(event.data.datetime),
        extendedProps: {
            description: event.data.description,
            location: event.data.location,
            category: event.data.category
        }
    }));

    const handleEventClick = (clickInfo: any) => {
        setSelectedEvent({
            title: clickInfo.event.title,
            description: clickInfo.event.extendedProps.description,
            location: clickInfo.event.extendedProps.location,
            category: clickInfo.event.extendedProps.category,
            date: clickInfo.event.start?.toLocaleDateString(),
            time: clickInfo.event.start?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        });
        setIsModalOpen(true);
    };

    return (
      <ErrorBoundary>
    <div className="event-calendar-container bg-white p-4 md:p-8 rounded-2xl shadow-xl mt-8 mb-16">
      
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
              activeCategory === cat 
              ? 'bg-sky-950 text-white shadow-md transform scale-105' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      
      <FullCalendar
        plugins={[dayGridPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        }}
        initialView="dayGridMonth"
        dayMaxEvents={true}
        events={calendarEvents}
        businessHours={true}
        fixedWeekCount={false}
        height={'auto'}
        contentHeight={600}
        eventDisplay="block"
        eventClick={handleEventClick}
      />
      
      <EventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
      />
    </div>
    </ErrorBoundary>
  )
}