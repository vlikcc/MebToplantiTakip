import api from './api';

const attendeeService = {
  addAttendee: async (attendeeData) => {
    const response = await api.post('/attendees/AddAttendee', attendeeData);
    return response.data;
  },
  
  getUserMeetings: async (userId) => {
    const response = await api.get(`/attendees/UserMeetings/${userId}`);
    return response.data;
  },
  
  getMeetingAttendees: async (meetingId) => {
    const response = await api.get(`/attendees/MeetingAttendees/${meetingId}`);
    return response.data;
  }
};

export default attendeeService;