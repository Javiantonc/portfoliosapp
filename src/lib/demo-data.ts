import { defaultContact, defaultLabelOverrides, defaultPhoto, defaultEffects, defaultSkillsView, defaultStyle, type CV, type SectorId } from './schema/cv'

const techCV: CV = {
  settings: { sector: 'tech', cvLayout: 'auto', portfolioTemplate: 'stage', ...defaultStyle, effects: defaultEffects, skillsView: defaultSkillsView, contact: defaultContact, photo: defaultPhoto, labels: defaultLabelOverrides },
  personal: {
    fullName: 'Lucía Ferrer',
    headline: 'Diseñadora de producto y desarrolladora frontend',
    email: 'lucia.ferrer@ejemplo.com',
    phone: '+34 600 000 000',
    location: 'Valencia, España',
    summary:
      'Diseño y construyo interfaces que se entienden a la primera. Ocho años llevando productos digitales desde el boceto hasta producción, con especial cariño por los sistemas de diseño, la accesibilidad y la animación con propósito.',
    photoUrl: '',
    links: [
      { id: 'l1', label: 'GitHub', url: 'github.com/luciaferrer' },
      { id: 'l2', label: 'LinkedIn', url: 'linkedin.com/in/luciaferrer' },
    ],
  },
  skills: [
    { id: 's1', name: 'React', level: 92 },
    { id: 's2', name: 'TypeScript', level: 88 },
    { id: 's3', name: 'Figma', level: 95 },
    { id: 's4', name: 'Three.js', level: 70 },
    { id: 's5', name: 'Accesibilidad', level: 84 },
    { id: 's6', name: 'Node.js', level: 64 },
  ],
  experience: [
    {
      id: 'e1',
      company: 'Marea Studio',
      role: 'Lead Product Designer',
      startDate: '2022-03',
      endDate: '',
      current: true,
      description:
        'Dirijo el diseño de una plataforma de reservas usada por 300 hoteles. Creé su sistema de diseño y reduje a la mitad el tiempo de entrega de nuevas pantallas.',
    },
    {
      id: 'e2',
      company: 'Nube Labs',
      role: 'Frontend Developer',
      startDate: '2019-01',
      endDate: '2022-02',
      current: false,
      description:
        'Desarrollé el panel de analítica en React y TypeScript. Introduje tests visuales y una librería de componentes compartida entre cuatro equipos.',
    },
    {
      id: 'e3',
      company: 'Freelance',
      role: 'Diseñadora web',
      startDate: '2017-06',
      endDate: '2018-12',
      current: false,
      description: 'Webs y tiendas para pequeños negocios locales, de la identidad visual a la publicación.',
    },
  ],
  education: [
    {
      id: 'ed1',
      institution: 'Universitat Politècnica de València',
      degree: 'Grado en Diseño y Tecnologías Creativas',
      startDate: '2013-09',
      endDate: '2017-06',
    },
    {
      id: 'ed2',
      institution: 'Escuela online de gráficos',
      degree: 'Curso de WebGL y shaders',
      startDate: '2023-01',
      endDate: '2023-04',
    },
  ],
  projects: [
    {
      id: 'p1',
      title: 'Atlas Design System',
      description: 'Sistema de diseño con 80 componentes accesibles, tokens multimarca y documentación viva.',
      url: 'atlas.ejemplo.com',
      tags: ['Figma', 'React', 'Storybook'],
    },
    {
      id: 'p2',
      title: 'Reservas Marea',
      description: 'Rediseño del flujo de reserva: un 23 % más de conversiones en móvil.',
      url: 'marea.ejemplo.com',
      tags: ['UX', 'Next.js'],
    },
    {
      id: 'p3',
      title: 'Orbita',
      description: 'Visualizador 3D de datos climáticos hecho con React Three Fiber.',
      url: 'orbita.ejemplo.com',
      tags: ['Three.js', 'R3F', 'GLSL'],
    },
    {
      id: 'p4',
      title: 'Pulso',
      description: 'App de hábitos con animaciones guiadas por gestos y modo sin conexión.',
      url: 'pulso.ejemplo.com',
      tags: ['React Native', 'Motion'],
    },
  ],
}

type Lite = {
  name: string
  headline: string
  location: string
  email: string
  summary: string
  links?: [string, string][]
  skills: [string, number][]
  exp: [string, string, string, string, string][] // puesto, empresa, inicio, fin('' = actual), descripción
  edu: [string, string, string, string][] // titulación, centro, inicio, fin
  projects: [string, string, string[]][]
}

function build(sector: SectorId, d: Lite): CV {
  return {
    settings: { sector, cvLayout: 'auto', portfolioTemplate: 'stage', ...defaultStyle, effects: defaultEffects, skillsView: defaultSkillsView, contact: defaultContact, photo: defaultPhoto, labels: defaultLabelOverrides },
    personal: {
      fullName: d.name,
      headline: d.headline,
      email: d.email,
      phone: '+34 600 000 000',
      location: d.location,
      summary: d.summary,
      photoUrl: '',
      links: (d.links ?? []).map(([label, url], i) => ({ id: `${sector}-l${i}`, label, url })),
    },
    skills: d.skills.map(([name, level], i) => ({ id: `${sector}-s${i}`, name, level })),
    experience: d.exp.map(([role, company, startDate, end, description], i) => ({
      id: `${sector}-e${i}`,
      role,
      company,
      startDate,
      endDate: end,
      current: !end,
      description,
    })),
    education: d.edu.map(([degree, institution, startDate, endDate], i) => ({ id: `${sector}-ed${i}`, degree, institution, startDate, endDate })),
    projects: d.projects.map(([title, description, tags], i) => ({ id: `${sector}-p${i}`, title, description, url: '', tags })),
  }
}

export const sectorDemos: Record<SectorId, CV> = {
  tech: techCV,
  creative: build('creative', {
    name: 'Marta Solís',
    headline: 'Directora de arte y fotógrafa',
    location: 'Barcelona, España',
    email: 'marta.solis@ejemplo.com',
    summary: 'Creo identidades y campañas que se recuerdan. Diez años entre estudio, agencia y rodaje, con la fotografía como forma de pensar.',
    links: [['Behance', 'behance.net/martasolis'], ['Instagram', 'instagram.com/martasolis']],
    skills: [['Dirección de arte', 94], ['Fotografía', 90], ['Identidad visual', 86], ['Adobe Creative Cloud', 92], ['Edición de vídeo', 68], ['Tipografía', 80]],
    exp: [
      ['Directora de arte', 'Agencia Brisa', '2021-02', '', 'Lidero un equipo de seis creativos para marcas de moda y alimentación. Tres campañas premiadas en festivales nacionales.'],
      ['Diseñadora gráfica sénior', 'Estudio Norte', '2017-09', '2021-01', 'Identidades para más de 40 clientes, del naming a la señalética.'],
    ],
    edu: [['Grado en Diseño', 'Escola Massana', '2011-09', '2015-06'], ['Máster en Fotografía de Autor', 'IDEP Barcelona', '2016-01', '2016-12']],
    projects: [
      ['Campaña «Mar adentro»', 'Campaña de verano para una marca de baño: foto, vídeo y exterior.', ['Fotografía', 'Campaña']],
      ['Identidad Café Lumbre', 'Marca, packaging e interiorismo gráfico para una cadena de cafeterías.', ['Branding', 'Packaging']],
      ['Serie «Interiores»', 'Proyecto fotográfico personal expuesto en tres galerías.', ['Fotografía']],
      ['Rebranding Teatro Nou', 'Nueva identidad y sistema de carteles para la temporada.', ['Identidad', 'Cartelería']],
    ],
  }),
  health: build('health', {
    name: 'Laura Benítez',
    headline: 'Enfermera de cuidados intensivos',
    location: 'Sevilla, España',
    email: 'laura.benitez@ejemplo.com',
    summary: 'Enfermera con nueve años en UCI y formación en ecografía a pie de cama. Me motivan la seguridad del paciente y enseñar a los equipos nuevos.',
    links: [['LinkedIn', 'linkedin.com/in/laurabenitez']],
    skills: [['Cuidados críticos', 95], ['Ventilación mecánica', 88], ['Ecografía enfermera', 72], ['Soporte vital avanzado', 92], ['Docencia clínica', 78], ['Inglés sanitario', 70]],
    exp: [
      ['Enfermera de UCI', 'Hospital Universitario Virgen del Mar', '2018-05', '', 'UCI polivalente de 24 camas. Referente del protocolo de prevención de úlceras y tutora de residentes.'],
      ['Enfermera de urgencias', 'Hospital Comarcal del Sur', '2016-01', '2018-04', 'Triaje, críticos y coordinación con emergencias extrahospitalarias.'],
    ],
    edu: [['Grado en Enfermería', 'Universidad de Sevilla', '2011-09', '2015-06'], ['Máster en Cuidados Críticos', 'Universidad de Sevilla', '2016-10', '2017-09']],
    projects: [
      ['Protocolo de úlceras por presión', 'Rediseño del protocolo de la unidad: incidencia reducida un 38 % en un año.', ['Calidad', 'Seguridad del paciente']],
      ['Publicación en revista de enfermería', 'Estudio sobre movilización precoz en pacientes ventilados.', ['Investigación']],
      ['Formación en ecografía', 'Taller interno para 60 enfermeras sobre canalización ecoguiada.', ['Docencia']],
    ],
  }),
  legal: build('legal', {
    name: 'Elena Montalbán',
    headline: 'Abogada mercantilista',
    location: 'Madrid, España',
    email: 'elena.montalban@ejemplo.com',
    summary: 'Asesoro a empresas familiares y fondos en operaciones societarias, financiación y reestructuraciones. Colegiada en el ICAM desde 2013.',
    links: [['LinkedIn', 'linkedin.com/in/elenamontalban']],
    skills: [['Derecho mercantil', 95], ['Fusiones y adquisiciones', 90], ['Contratación', 88], ['Reestructuraciones', 76], ['Compliance', 70], ['Inglés jurídico', 92]],
    exp: [
      ['Asociada sénior', 'Ferrán & Ortega Abogados', '2018-01', '', 'Coordino operaciones de M&A de mercado medio y la relación con clientes institucionales.'],
      ['Asociada', 'Bufete Larrea', '2013-09', '2017-12', 'Asesoramiento societario recurrente y due diligence legales.'],
    ],
    edu: [['Grado en Derecho y ADE', 'Universidad Carlos III', '2007-09', '2012-06'], ['Máster de Acceso a la Abogacía', 'Universidad Carlos III', '2012-09', '2013-06']],
    projects: [
      ['Venta de grupo industrial', 'Asesoramiento al vendedor en una operación de 120 M€ con un fondo europeo.', ['M&A', 'Due diligence']],
      ['Refinanciación sindicada', 'Negociación de la deuda de una cadena hotelera con seis entidades.', ['Financiación']],
      ['Programa de compliance', 'Diseño del modelo de prevención penal para una empresa de 900 empleados.', ['Compliance']],
    ],
  }),
  education: build('education', {
    name: 'Daniel Ríos',
    headline: 'Profesor de Física y Química',
    location: 'Zaragoza, España',
    email: 'daniel.rios@ejemplo.com',
    summary: 'Docente de secundaria y bachillerato. Convierto el laboratorio en el centro de la clase y coordino proyectos STEM con otros centros.',
    skills: [['Didáctica de las ciencias', 92], ['Aprendizaje por proyectos', 88], ['Atención a la diversidad', 80], ['Evaluación formativa', 84], ['Competencia digital docente', 86], ['Inglés (CLIL)', 74]],
    exp: [
      ['Profesor de Física y Química', 'IES Ebro', '2019-09', '', 'Tutor de bachillerato y coordinador del proyecto bilingüe de ciencias.'],
      ['Profesor interino', 'IES Moncayo', '2016-09', '2019-06', 'Docencia en ESO y diseño de prácticas de laboratorio.'],
    ],
    edu: [['Grado en Física', 'Universidad de Zaragoza', '2010-09', '2014-06'], ['Máster en Profesorado', 'Universidad de Zaragoza', '2014-10', '2015-06']],
    projects: [
      ['Feria de la Ciencia', 'Organización anual con 400 alumnos de seis centros de la provincia.', ['STEM', 'Divulgación']],
      ['Laboratorio low-cost', 'Kit de experimentos con material reciclado, adoptado por 12 institutos.', ['Innovación']],
      ['Erasmus+ Energía', 'Intercambio con un centro de Finlandia sobre transición energética.', ['Erasmus+', 'Inglés']],
    ],
  }),
  hospitality: build('hospitality', {
    name: 'Javier Aranda',
    headline: 'Jefe de cocina',
    location: 'San Sebastián, España',
    email: 'javier.aranda@ejemplo.com',
    summary: 'Cocinero de producto y temporada. Doce años en cocinas con estrella y en aperturas, dirigiendo equipos de hasta 18 personas.',
    links: [['Instagram', 'instagram.com/javiaranda.cocina']],
    skills: [['Cocina de producto', 95], ['Dirección de equipos', 88], ['Pastelería', 70], ['Escandallos y costes', 84], ['Fermentación', 76], ['APPCC', 90]],
    exp: [
      ['Jefe de cocina', 'Restaurante Itsasoa', '2020-03', '', 'Diseño de cartas de temporada y gestión de un equipo de 14 personas. Recomendado en las principales guías.'],
      ['Segundo de cocina', 'Hotel Monte Ulia', '2015-06', '2020-02', 'Banquetes de hasta 400 comensales y apertura del restaurante gastronómico.'],
    ],
    edu: [['Técnico Superior en Dirección de Cocina', 'Escuela de Hostelería de Leioa', '2009-09', '2011-06'], ['Curso de Cocina Fermentada', 'Basque Culinary Center', '2021-02', '2021-04']],
    projects: [
      ['Menú «Litoral»', 'Menú degustación de diez pases con pescado de lonja y algas locales.', ['Menú degustación']],
      ['Apertura Itsasoa', 'Puesta en marcha de cocina, proveedores y equipo en tres meses.', ['Apertura', 'Gestión']],
      ['Cena benéfica anual', 'Evento para 250 personas a favor del banco de alimentos.', ['Eventos']],
    ],
  }),
  engineering: build('engineering', {
    name: 'Sergio Valdés',
    headline: 'Arquitecto técnico y jefe de obra',
    location: 'Bilbao, España',
    email: 'sergio.valdes@ejemplo.com',
    summary: 'Dirijo obras de edificación residencial y terciaria con foco en plazos, seguridad y eficiencia energética. Especializado en BIM y Passivhaus.',
    links: [['LinkedIn', 'linkedin.com/in/sergiovaldes']],
    skills: [['Dirección de obra', 93], ['BIM / Revit', 86], ['Presto y mediciones', 88], ['Prevención de riesgos', 90], ['Passivhaus', 74], ['AutoCAD', 92]],
    exp: [
      ['Jefe de obra', 'Construcciones Arteaga', '2019-04', '', 'Edificios residenciales de hasta 80 viviendas. Entrega de todas las obras dentro de plazo y presupuesto.'],
      ['Técnico de oficina técnica', 'Ingeniería Nervión', '2015-09', '2019-03', 'Mediciones, presupuestos y modelos BIM para licitaciones.'],
    ],
    edu: [['Grado en Arquitectura Técnica', 'Universidad del País Vasco', '2010-09', '2014-06'], ['Certificación Passivhaus Designer', 'Passivhaus Institut', '2020-01', '2020-05']],
    projects: [
      ['Residencial Ribera', '64 viviendas de consumo casi nulo, certificación A.', ['Edificación', 'Passivhaus']],
      ['Rehabilitación del Mercado Sur', 'Refuerzo estructural y nueva cubierta manteniendo la actividad.', ['Rehabilitación']],
      ['Oficinas Zorrotza', '12.000 m² de oficinas coordinados íntegramente en BIM.', ['BIM', 'Terciario']],
    ],
  }),
  business: build('business', {
    name: 'Clara Pizarro',
    headline: 'Responsable de marketing digital',
    location: 'Málaga, España',
    email: 'clara.pizarro@ejemplo.com',
    summary: 'Hago crecer marcas con datos y creatividad. He liderado equipos de adquisición y CRM en e-commerce y turismo, siempre con objetivos de negocio claros.',
    links: [['LinkedIn', 'linkedin.com/in/clarapizarro']],
    skills: [['Estrategia digital', 92], ['SEO y SEM', 88], ['Analítica', 86], ['CRM y email', 82], ['Gestión de equipos', 84], ['Presupuestos', 78]],
    exp: [
      ['Responsable de marketing digital', 'Viajes Alborán', '2020-06', '', 'Equipo de cinco personas y 1,2 M€ de inversión anual. Ventas online +41 % en dos años.'],
      ['Especialista en performance', 'Moda Sur', '2017-02', '2020-05', 'Campañas de pago en buscadores y redes con un ROAS medio de 6.'],
    ],
    edu: [['Grado en ADE', 'Universidad de Málaga', '2011-09', '2015-06'], ['Máster en Marketing Digital', 'ESIC', '2015-10', '2016-07']],
    projects: [
      ['Relanzamiento de la web', 'Nueva web y embudo de reserva: conversión del 1,4 % al 2,3 %.', ['E-commerce', 'CRO']],
      ['Programa de fidelización', 'Club de clientes con 80.000 socios en el primer año.', ['CRM']],
      ['Campaña «Invierno al sol»', 'Campaña integrada que llenó la temporada baja un 30 % más.', ['Campaña', 'Paid media']],
    ],
  }),
}

export const demoCV = sectorDemos.tech
