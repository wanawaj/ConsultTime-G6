/**
 * Western Mindanao State University academic colleges and published programs.
 * Main-campus colleges from WMSU Citizen's Charter (4th ed., 2024),
 * supplemented with WMSU college/program pages (see README_WMSU_SOURCES.md).
 * This is a curated registration directory, NOT a live enrollment catalog.
 * Confirm any new programs or campus-specific offerings with the WMSU Registrar.
 */
export const WMSU_PROGRAMS = {
  'College of Agriculture': [
    'BS Agriculture — Animal Science',
    'BS Agriculture — Crop Science',
    'BS Agribusiness',
    'Bachelor of Agricultural Technology',
    'BS Food Technology',
  ],
  'College of Architecture': [
    'BS Architecture',
  ],
  'College of Asian and Islamic Studies': [
    'BA Asian Studies — Southeast Asian Studies',
    'BA Islamic Studies — Political Economy',
    'BS Islamic Studies',
    'Diploma in Arabic Language',
  ],
  'College of Computing Studies': [
    'BS Computer Science',
    'BS Information Technology',
    'Associate in Computer Technology (Ladderized to BSCS)',
    'Associate in Computer Technology (Ladderized to BSIT)',
    'Associate in Computer Technology — Application Development',
    'Associate in Computer Technology — Networking',
  ],
  'College of Criminal Justice Education': [
    'BS Criminology',
  ],
  'College of Engineering': [
    'BS Agricultural and Biosystems Engineering',
    'BS Civil Engineering',
    'BS Civil Engineering — Construction Engineering and Management',
    'BS Civil Engineering — Geotechnical Engineering',
    'BS Civil Engineering — Structural Engineering',
    'BS Civil Engineering — Transportation Engineering',
    'BS Civil Engineering — Water Resources Engineering',
    'BS Computer Engineering',
    'BS Electrical Engineering',
    'BS Electronics Engineering',
    'BS Environmental Engineering',
    'BS Geodetic Engineering',
    'BS Industrial Engineering',
    'BS Mechanical Engineering',
    'BS Sanitary Engineering',
  ],
  'College of Forestry and Environmental Studies': [
    'BS Forestry',
    'BS Environmental Science',
    'BS Agroforestry',
  ],
  'College of Home Economics': [
    'BS Home Economics',
    'BS Home Economics Education',
    'BS Hospitality Management',
    'BS Nutrition and Dietetics',
  ],
  'College of Law': [
    'Juris Doctor',
    'Bachelor of Laws (LLB) — legacy curriculum',
  ],
  'College of Liberal Arts': [
    'BS Accountancy',
    'BA English',
    'BA English Language Studies',
    'BA Filipino',
    'BA History',
    'BA Mass Communication — Broadcasting',
    'BA Mass Communication — Journalism',
    'BA Political Science',
    'BS Economics',
    'BS Psychology',
  ],
  'College of Medicine': [
    'Doctor of Medicine',
  ],
  'College of Nursing': [
    'BS Nursing',
  ],
  'College of Public Administration and Development Studies': [
    'Bachelor of Public Administration',
  ],
  'College of Science and Mathematics': [
    'BS Biology',
    'BS Chemistry',
    'BS Mathematics',
    'BS Physics',
    'BS Statistics',
  ],
  'College of Social Work and Community Development': [
    'BS Social Work',
    'BS Community Development',
  ],
  'College of Sports Science and Physical Education': [
    'Bachelor of Physical Education',
    'BS Exercise and Sports Sciences',
  ],
  'College of Teacher Education': [
    'Bachelor of Culture and Arts Education',
    'Bachelor of Early Childhood Education',
    'Bachelor of Elementary Education',
    'Bachelor of Secondary Education — English',
    'Bachelor of Secondary Education — Filipino',
    'Bachelor of Secondary Education — Mathematics',
    'Bachelor of Secondary Education — Science',
    'Bachelor of Secondary Education — Social Studies',
    'Bachelor of Secondary Education — Values Education',
    'Bachelor of Special Needs Education',
  ],
}

export const WMSU_COLLEGES = Object.keys(WMSU_PROGRAMS)
export const validWmsuProgram = (college, program) =>
  Object.hasOwn(WMSU_PROGRAMS, college) && WMSU_PROGRAMS[college].includes(program)
