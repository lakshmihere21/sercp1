export const EMERGENCY_TYPES = [
  { value: 'medical',          label: 'Medical',          icon: '🏥', severity: 'HIGH',     priority: 4 },
  { value: 'accident',         label: 'Accident',         icon: '🚗', severity: 'HIGH',     priority: 4 },
  { value: 'fire',             label: 'Fire',             icon: '🔥', severity: 'CRITICAL', priority: 5 },
  { value: 'crime',            label: 'Crime',            icon: '🚔', severity: 'CRITICAL', priority: 5 },
  { value: 'women_safety',     label: 'Women Safety',     icon: '👩', severity: 'HIGH',     priority: 4 },
  { value: 'natural_disaster', label: 'Natural Disaster', icon: '🌪️', severity: 'CRITICAL', priority: 5 },
  { value: 'other',            label: 'Other',            icon: '⚠️', severity: 'MEDIUM',   priority: 2 },
];

export const ALERT_STATUSES = [
  { value: 'ACTIVE',              label: 'Active',             color: 'bg-red-100 text-red-700' },
  { value: 'RESPONDER_ASSIGNED',  label: 'Responder Assigned', color: 'bg-blue-100 text-blue-700' },
  { value: 'IN_PROGRESS',         label: 'In Progress',        color: 'bg-orange-100 text-orange-700' },
  { value: 'ARRIVED',             label: 'Arrived',            color: 'bg-purple-100 text-purple-700' },
  { value: 'RESOLVED',            label: 'Resolved',           color: 'bg-green-100 text-green-700' },
  { value: 'CANCELLED',           label: 'Cancelled',          color: 'bg-slate-100 text-slate-500' },
];

export const SEVERITY_LEVELS = [
  { value: 'LOW',      label: 'Low',      color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  { value: 'MEDIUM',   label: 'Medium',   color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  { value: 'HIGH',     label: 'High',     color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-700',       dot: 'bg-red-600' },
];

export const USER_ROLES = {
  CITIZEN:   'citizen',
  RESPONDER: 'responder',
  VOLUNTEER: 'volunteer',
  ADMIN:     'admin',
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const RELATIONSHIPS = ['family', 'friend', 'colleague', 'neighbor', 'other'];

export const RESPONDER_SKILLS = [
  'first_aid', 'fire_rescue', 'search_rescue',
  'medical_support', 'disaster_response', 'cpr', 'trauma_care',
];

export const VEHICLE_TYPES = [
  { value: 'ambulance',       label: 'Ambulance',       icon: '🚑' },
  { value: 'police_vehicle',  label: 'Police Vehicle',  icon: '🚔' },
  { value: 'fire_truck',      label: 'Fire Truck',      icon: '🚒' },
  { value: 'rescue_vehicle',  label: 'Rescue Vehicle',  icon: '🚐' },
];

export const HELPLINE_NUMBERS = [
  { number: '112', name: 'National Emergency', icon: '🆘', category: 'general' },
  { number: '100', name: 'Police',             icon: '👮', category: 'police' },
  { number: '108', name: 'Ambulance',          icon: '🚑', category: 'medical' },
  { number: '101', name: 'Fire Service',       icon: '🚒', category: 'fire' },
  { number: '1091', name: 'Women Helpline',    icon: '👩', category: 'women' },
  { number: '1098', name: 'Child Helpline',    icon: '👶', category: 'child' },
];

export const SOCKET_EVENTS = {
  NEW_EMERGENCY_ALERT:  'NEW_EMERGENCY_ALERT',
  LOCATION_UPDATE:      'LOCATION_UPDATE',
  SEND_MESSAGE:         'SEND_MESSAGE',
  NEW_MESSAGE:          'NEW_MESSAGE',
  TYPING:               'TYPING',
  USER_TYPING:          'USER_TYPING',
  STATUS_UPDATE:        'STATUS_UPDATE',
  ALERT_STATUS_UPDATED: 'ALERT_STATUS_UPDATED',
  RESPONDER_ASSIGNED:   'RESPONDER_ASSIGNED',
  SOS_RECEIVED:         'SOS_RECEIVED',
  ONLINE_COUNT:         'ONLINE_COUNT',
  RESPONDER_STATUS:     'RESPONDER_STATUS',
  JOIN_ALERT_ROOM:      'JOIN_ALERT_ROOM',
  LEAVE_ALERT_ROOM:     'LEAVE_ALERT_ROOM',
};

export const MAP_CONFIG = {
  DEFAULT_CENTER: [19.076, 72.877], // Mumbai
  DEFAULT_ZOOM:   13,
  TILE_URL:       'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION:    '© OpenStreetMap contributors',
};

export const API_TIMEOUT = 30000;
export const MAX_EMERGENCY_CONTACTS = 5;
export const SOS_COUNTDOWN_SECONDS = 5;
export const LOCATION_UPDATE_INTERVAL = 5000;
