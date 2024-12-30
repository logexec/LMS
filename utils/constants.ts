import { ElementType, JSX } from "react";
import { MdOutlineDashboard } from "react-icons/md";
import { GrDocumentText, GrDocumentUser } from "react-icons/gr";
import { RiDiscountPercentLine } from "react-icons/ri";
import { LuUsers } from "react-icons/lu";
import { PiMoneyWavyThin } from "react-icons/pi";

type navLink = {
  category: string;
  links: link[];
};

type link = {
  label: string;
  url: string;
  icon: ElementType;
};
export const sidenavLinks: navLink[] = [
  {
    category: "Administración General",
    links: [
      {
        label: "Gestionar usuarios",
        url: "/usuarios",
        icon: LuUsers,
      },
    ],
  },
  {
    category: "Descuentos",
    links: [
      {
        label: "Inicio",
        url: "/descuentos",
        icon: MdOutlineDashboard,
      },
      {
        label: "Solicitudes",
        url: "/descuentos/solicitudes",
        icon: GrDocumentText,
      },
      {
        label: "Reportes Personales",
        url: "/descuentos/reportes-personales",
        icon: GrDocumentUser,
      },
      {
        label: "Descuentos Masivos (Faltantes)",
        url: "/descuentos/masivos",
        icon: RiDiscountPercentLine,
      },
    ],
  },
  {
    category: "Gastos",
    links: [
      {
        label: "Inicio",
        url: "/gastos",
        icon: MdOutlineDashboard,
      },
    ],
  },
  {
    category: "Ingresos especiales",
    links: [
      {
        label: "Inicio",
        url: "/ingresos-especiales",
        icon: MdOutlineDashboard,
      },
    ],
  },
  {
    category: "Presupuesto",
    links: [
      {
        label: "Inicio",
        url: "/presupuesto",
        icon: MdOutlineDashboard,
      },
    ],
  },
  {
    category: "Provisiones",
    links: [
      {
        label: "Inicio",
        url: "/provisiones",
        icon: MdOutlineDashboard,
      },
    ],
  },
];

export const admnUsers = [
  {
    id: "1710576180",
    name: "AYALA LEON LIDIA MERCEDES",
    email: "lidia.ayala@logex.ec",
    roles: ["user"],
    realms: ["user"],
    lastLogin: new Date(2024, 11, 1, 14, 15),
    createdAt: new Date(2024, 0, 7),
  },

  {
    id: "1002366522",
    name: "CARLOSAMA CHACHALO JUAN ROLANDO",
    email: "juan.carlosama@logex.ec",
    roles: ["user"],
    realms: ["user"],
    lastLogin: new Date(2024, 11, 1, 14, 15),
    createdAt: new Date(2024, 0, 7),
  },
  {
    id: "1709539546",
    name: "CEVALLOS CASTRO SANTIAGO ROBERTO",
    email: "santiago.cevallos@logex.ec",
    roles: ["user"],
    realms: ["user"],
    lastLogin: new Date(2024, 11, 1, 14, 15),
    createdAt: new Date(2024, 0, 7),
  },
  {
    id: "1716568926",
    name: "ESPINOSA CIFUENTES LUIS AURELIO",
    email: "luis.espinosa@logex.ec",
    roles: ["user"],
    realms: ["user"],
    lastLogin: new Date(2024, 11, 1, 14, 15),
    createdAt: new Date(2024, 0, 7),
  },
  {
    id: "1723604441",
    name: "HERRERA ROMERO LORENA JACQUELINE",
    email: "lorena.herrera@logex.ec",
    roles: ["user"],
    realms: ["user"],
    lastLogin: new Date(2024, 11, 1, 14, 15),
    createdAt: new Date(2024, 0, 7),
  },
  {
    id: "1713243218",
    name: "IZA MORA NICOLAS ALEXANDER",
    email: "nicolas.iza@logex.ec",
    roles: ["user"],
    realms: ["user"],
    lastLogin: new Date(2024, 11, 1, 14, 15),
    createdAt: new Date(2024, 0, 7),
  },
  {
    id: "1704680121",
    name: "KENYON ESCOBAR JOHN WALLACE",
    email: "jk@logex.ec",
    roles: ["admin"],
    realms: ["user", "root"],
    lastLogin: new Date(2024, 11, 1, 14, 15),
    createdAt: new Date(2024, 0, 7),
  },
  {
    id: "1721362638",
    name: "MERISALDE AGUILAR DIEGO FERNANDO",
    email: "diego.merisalde@logex.ec",
    roles: ["user"],
    realms: ["user"],
    lastLogin: new Date(2024, 11, 1, 14, 15),
    createdAt: new Date(2024, 0, 7),
  },
  {
    id: "1721435392",
    name: "MERIZALDE AGUILAR LUIS EDUARDO",
    email: "luis.merisalde@logex.ec",
    roles: ["user"],
    realms: ["user"],
    lastLogin: new Date(2024, 11, 1, 14, 15),
    createdAt: new Date(2024, 0, 7),
  },
  {
    id: "1715494926",
    name: "PEREIRA CARRILLO CLAUDIA ISABEL",
    email: "claudia.pereira@logex.ec",
    roles: ["user"],
    realms: ["user"],
    lastLogin: new Date(2024, 11, 1, 14, 15),
    createdAt: new Date(2024, 0, 7),
  },
  {
    id: "1751417260",
    name: "QUINTANA GALLARDO ANDREA MICHELLE",
    email: "andrea.quintana@logex.ec",
    roles: ["user"],
    realms: ["user"],
    lastLogin: new Date(2024, 11, 1, 14, 15),
    createdAt: new Date(2024, 0, 7),
  },
  {
    id: "1750211698",
    name: "QUINTANA GALLARDO JOSSELYN ANABEL",
    email: "josselyn.quintana@logex.ec",
    roles: ["user"],
    realms: ["user"],
    lastLogin: new Date(2024, 11, 1, 14, 15),
    createdAt: new Date(2024, 0, 7),
  },
  {
    id: "1723470306",
    name: "RUBIO MORA OMAR FRANCISCO",
    email: "omar.rubio@logex.ec",
    roles: ["user"],
    realms: ["user"],
    lastLogin: new Date(2024, 11, 1, 14, 15),
    createdAt: new Date(2024, 0, 7),
  },
  {
    id: "1003964929",
    name: "TEJADA BALDEON MISHELLE LEONOR",
    email: "mishelle.tejada@logex.ec",
    roles: ["user"],
    realms: ["user"],
    lastLogin: new Date(2024, 11, 1, 14, 15),
    createdAt: new Date(2024, 0, 7),
  },
  {
    id: "1721156279",
    name: "ESTRELLA SOLANO DE LA SALA RICARDO JOSE",
    email: "ricardo.estrella@logex.ec",
    roles: ["admin"],
    realms: ["user", "root", "developer"],
    lastLogin: new Date(2024, 11, 1, 14, 15),
    createdAt: new Date(2024, 0, 7),
  },
];

export const cnqtUsers = [
  {
    id: "1724028459",
    name: "ALMACHE PROAÑO OSCAR PAUL",
    role: "",
  },
  {
    id: "1715033062",
    name: "ALVARADO CONDO RENE PAUL",
    role: "",
  },
  {
    id: "1715938104",
    name: "ANGULO CORTEZ RONER ENRIQUE",
    role: "",
  },
  {
    id: "1722713904",
    name: "BALAREZO CALDERON PABLO SEBASTIAN",
    role: "",
  },
  {
    id: "1724453145",
    name: "BARRE PINARGOTE JAIRO MAURICIO",
    role: "",
  },
  {
    id: "1753921954",
    name: "BEDON ESTRELLA JIMMY DANIEL",
    role: "",
  },
  {
    id: "1312167222",
    name: "BERMEO LOOR DIMAS FABRICIO",
    role: "",
  },
  {
    id: "1722274683",
    name: "BRIONES CHAVEZ SANTO EMILIANO",
    role: "",
  },
  {
    id: "1716007024",
    name: "CACHUMBA CACHUMBA CLAUDIO DANILO",
    role: "",
  },
  {
    id: "1723626675",
    name: "CAGUA HUILCA MIGUEL ANGEL",
    role: "",
  },
  {
    id: "1752436665",
    name: "CAISAGUANO TANDAPILCO DARIO JAVIER",
    role: "",
  },
  {
    id: "1720479375",
    name: "CAIZA MURILLO CHRISTOPHER LEONARDO",
    role: "",
  },
  {
    id: "1725339764",
    name: "CALDERON GUDIÑO RAFAEL ALEJANDRO",
    role: "",
  },
  {
    id: "1003939814",
    name: "CARCELEN MENDEZ JHONNY ALEXANDER",
    role: "",
  },
  {
    id: "0801950569",
    name: "CARCELEN ORTIZ JOSE LUIS",
    role: "",
  },
  {
    id: "0928641794",
    name: "CARDOZO BAZURTO DANILO RICARDO",
    role: "",
  },
  {
    id: "0702910308",
    name: "CARRION GOMEZ JORGE ENRIQUE",
    role: "",
  },
  {
    id: "1723539753",
    name: "CARRION OLIVEROS DANNY SAMUEL",
    role: "",
  },
  {
    id: "1752872109",
    name: "CHACUA CANCHALA OSCAR ALDAIR",
    role: "",
  },
  {
    id: "1721581484",
    name: "CHALUISA MASABANDA BYRON AVELINO",
    role: "",
  },
  {
    id: "0504608829",
    name: "CHAMBA LLASHA MAYCOL JORDAN",
    role: "",
  },
  {
    id: "0504377573",
    name: "CHELA JORGE ERICK SEBASTIAN",
    role: "",
  },
  {
    id: "1754416665",
    name: "CHICA RIVERA TANIA GABRIELA",
    role: "",
  },
  {
    id: "2101128813",
    name: "CHICAIZA JIMENEZ ALEX EDUARDO",
    role: "",
  },
  {
    id: "1722939640",
    name: "CHICAIZA TIPANGUANO EDGAR GERARDO",
    role: "",
  },
  {
    id: "1717359622",
    name: "CHUQUIMARCA MOROCHO DIEGO JAVIER",
    role: "",
  },
  {
    id: "1727626028",
    name: "CHUQUIMARCA PUGA JHONNY XAVIER",
    role: "",
  },
  {
    id: "1722817333",
    name: "CODENA GALLEGOS ANDRES RODRIGO",
    role: "",
  },
  {
    id: "1723519029",
    name: "COLLAGUAZO CHILIGUANO MAURICIO SANTIAGO",
    role: "",
  },
  {
    id: "1715528905",
    name: "CORDOVA VELASCO JORGE WLADIMIR",
    role: "",
  },
  {
    id: "1001978319",
    name: "CUASPA PIARPUZAN JOSE ALIRIO",
    role: "",
  },
  {
    id: "1750487272",
    name: "CUCAS CERON GUSTAVO CRISTIAN",
    role: "",
  },
  {
    id: "1756032445",
    name: "CUMBAL GUACALES ALEX DANILO",
    role: "",
  },
  {
    id: "1756033526",
    name: "CUMBAL GUACALES ROBINSON JAIRO",
    role: "",
  },
  {
    id: "1314131655",
    name: "CUSME CHICHANDA LUIS VICENTE",
    role: "",
  },
  {
    id: "1721554630",
    name: "DELGADO SANTACRUZ CARLOS RENAN",
    role: "",
  },
  {
    id: "1717188062",
    name: "DIAZ IMBAJA LUIS DARWIN",
    role: "",
  },
  {
    id: "1719432963",
    name: "ESCANTA LIQUINCHANA ALEX ARTURO",
    role: "",
  },
  {
    id: "1725861981",
    name: "ESPINOZA PISUÑA EDISON",
    role: "",
  },
  {
    id: "1720775137",
    name: "ESTRELLA TUTASIG ANDRES EDUARDO",
    role: "",
  },
  {
    id: "1715027692",
    name: "FLORES QUITIO KARINA ELIZABETH",
    role: "",
  },
  {
    id: "1725182040",
    name: "GALARZA HUILCA CARLOS ARMANDO",
    role: "",
  },
  {
    id: "1717379356",
    name: "GALARZA HUILCA HECTOR ALEJANDRINO",
    role: "",
  },
  {
    id: "1722964366",
    name: "GALARZA MORETA VICTOR ESTUARDO",
    role: "",
  },
  {
    id: "1729269652",
    name: "GALARZA TORRES BRYAN ISRAEL",
    role: "",
  },
  {
    id: "1723984843",
    name: "GALARZA TORRES EDISON DANIEL",
    role: "",
  },
  {
    id: "1755487830",
    name: "GAROFALO CUCAS RODRIGO DAVID",
    role: "",
  },
  {
    id: "1721405528",
    name: "GARZON CALISPA CARLOS DAVID",
    role: "",
  },
  {
    id: "1105471807",
    name: "GONZALEZ CALDERON ITALO STALIN",
    role: "",
  },
  {
    id: "1750324210",
    name: "GUACALES CUACIALPUD JHON DAVINSON",
    role: "",
  },
  {
    id: "1003827068",
    name: "GUALACATA MARTINEZ EDISON DAVID",
    role: "",
  },
  {
    id: "1721101713",
    name: "GUAÑUNA NAULAGUARI JAIME ROBERTO",
    role: "",
  },
  {
    id: "1754384087",
    name: "GUAPI YUMAGLLA DARWIN IVAN",
    role: "",
  },
  {
    id: "1724392988",
    name: "GUDIÑO DELGADO LEONCIO MARCELO",
    role: "",
  },
  {
    id: "1755763594",
    name: "GUERRERO RAMIREZ EDISON MIGUEL",
    role: "",
  },
  {
    id: "0706373719",
    name: "GUZMAN GUZMAN NIXON LEONIDAS",
    role: "",
  },
  {
    id: "1722178892",
    name: "HERRERA BEJARANO NELSON ANDRES",
    role: "",
  },
  {
    id: "1751669761",
    name: "HERRERA CHANCHICOCHA JHONNY OMAR",
    role: "",
  },
  {
    id: "1722972567",
    name: "HERRERA ROJAS DIEGO ARMANDO",
    role: "",
  },
  {
    id: "1722432992",
    name: "IMBAQUINGO TUGULINAGO CESAR ASCIENCIO",
    role: "",
  },
  {
    id: "1719472464",
    name: "INGA PILLAJO EDISON RICARDO",
    role: "",
  },
  {
    id: "0502764020",
    name: "ITURRALDE HERRERA EDISON MARCELO",
    role: "",
  },
  {
    id: "1314097633",
    name: "JAMA PINARGOTE MARIANO LEONEL",
    role: "",
  },
  {
    id: "0802695387",
    name: "LARA RAMIREZ MAGNER EDGAR",
    role: "",
  },
  {
    id: "0950197244",
    name: "LLANO VEGA ANTHONY LEONARDO",
    role: "",
  },
  {
    id: "1726164732",
    name: "LUNA CASQUETE LUNA CASQUETE LUNA CASQUETE",
    role: "",
  },
  {
    id: "2300212921",
    name: "LUZARRAGA OLVERA JOHAO ALDAIR",
    role: "",
  },
  {
    id: "1315861714",
    name: "MARCILLO DELGADO DIXON ALEXANDER",
    role: "",
  },
  {
    id: "1713487203",
    name: "MASAQUIZA ENRIQUEZ GALO GUILLERMO",
    role: "",
  },
  {
    id: "0604149880",
    name: "MATUTE GUANGACHI LUCIANO DAVID",
    role: "",
  },
  {
    id: "0924895253",
    name: "MENDEZ BERNAZA DALEMBER ADRIAN",
    role: "",
  },
  {
    id: "1724363468",
    name: "MERINO CHAMBA CARLOS ALBERTO",
    role: "",
  },
  {
    id: "0802274571",
    name: "MONTAÑO PEREA JUAN MIGUEL",
    role: "",
  },
  {
    id: "1003133723",
    name: "MORA ESPINOSA GUSTAVO JOSE",
    role: "",
  },
  {
    id: "0504856717",
    name: "MOREANO PILATASIG JEFFERSON OSWALDO",
    role: "",
  },
  {
    id: "1725049538",
    name: "MOREIRA ZAMBRANO JORDY HENRY",
    role: "",
  },
  {
    id: "0503917668",
    name: "MOROCHO UNAPANTA KELVIN DANIEL",
    role: "",
  },
  {
    id: "1722918511",
    name: "MOSCOSO CASTELO PABLO TOMAS",
    role: "",
  },
  {
    id: "2200510200",
    name: "MOSQUERA VERA KEVIN LUIS",
    role: "",
  },
  {
    id: "0803588326",
    name: "NARANJO BRAVO ESTEFANIA ALEXANDRA",
    role: "",
  },
  {
    id: "1722368709",
    name: "NUÑEZ YUCAILLA BRYAN HUMBERTO",
    role: "",
  },
  {
    id: "1106205550",
    name: "OLAYA GUZMAN JUNIOR ALEXANDER",
    role: "",
  },
  {
    id: "1724923386",
    name: "ONOFRE CASTRO MICHAEL VLADIMIR",
    role: "",
  },
  {
    id: "1713137667",
    name: "PABON LARA WILLIAM MAURICIO",
    role: "",
  },
  {
    id: "1725824740",
    name: "PALADINES CALDERON CARLOS ALBERTO",
    role: "",
  },
  {
    id: "1720759735",
    name: "PALLO QUISHPE JOSE ALEJANDRO",
    role: "",
  },
  {
    id: "1723904379",
    name: "PASTILLO LANDETA VICTOR HUGO",
    role: "",
  },
  {
    id: "0804384329",
    name: "PEREA CEVALLOS JONATHAN DAVID",
    role: "",
  },
  {
    id: "1711495794",
    name: "PEREZ PEREZ JUAN CARLOS",
    role: "",
  },
  {
    id: "1719742023",
    name: "PILATAXI VIZCAINO MARCO VINICIO",
    role: "",
  },
  {
    id: "0503797029",
    name: "PINCHA HURTADO EDISON PAUL",
    role: "",
  },
  {
    id: "1721877460",
    name: "PINTO RODRIGUEZ NESTOR DAVID",
    role: "",
  },
  {
    id: "1755596572",
    name: "PISUÑA PAILLACHO JOSE RODRIGO",
    role: "",
  },
  {
    id: "1724873193",
    name: "PISUÑA TOAPANTA DIEGO ANDRES",
    role: "",
  },
  {
    id: "1756116818",
    name: "PISUÑA TOAPANTA LUIS GABRIEL",
    role: "",
  },
  {
    id: "0801199407",
    name: "PLAZA TENORIO SIRIO MANUEL",
    role: "",
  },
  {
    id: "0805158847",
    name: "PLUAS ESCOBAR DENYS ALEJANDRO",
    role: "",
  },
  {
    id: "0919295261",
    name: "PLUAS ROSADO EDISON MODESTO",
    role: "",
  },
  {
    id: "1723904585",
    name: "PUMBA MARTINEZ PABLO EDUARDO",
    role: "",
  },
  {
    id: "1705555457",
    name: "PULIDO CHICAIZA WILMER ELVIS",
    role: "",
  },
  {
    id: "1724695155",
    name: "QUIÑONEZ TORO EDISON ALEJANDRO",
    role: "",
  },
  {
    id: "1720537664",
    name: "RAGUAJIN MORALES RONALDO ESTEBAN",
    role: "",
  },
  {
    id: "1725316713",
    name: "RAMIREZ CORONEL BRIAN EDUARDO",
    role: "",
  },
  {
    id: "1715554682",
    name: "RAMOS MONTALUCA CAMILO ANDRES",
    role: "",
  },
  {
    id: "1724364723",
    name: "REINA SANDOVAL JESUS LUIS",
    role: "",
  },
  {
    id: "1720766989",
    name: "REYES ALVAREZ PAUL",
    role: "",
  },
  {
    id: "1723736234",
    name: "ROCHA GUADALUPE JUAN CARLOS",
    role: "",
  },
  {
    id: "0502954068",
    name: "ROJAS ESPINOZA YUMBERTO ERICK",
    role: "",
  },
  {
    id: "1752692941",
    name: "ROJAS HURTADO LUIS HERNAN",
    role: "",
  },
  {
    id: "1722404471",
    name: "ROMERO HERRERA JORGE FABIÁN",
    role: "",
  },
  {
    id: "1721952559",
    name: "RUANO RAMIREZ BRYAN ALEXANDER",
    role: "",
  },
  {
    id: "1712971082",
    name: "RUSO RIVERA EDGAR ALEXANDER",
    role: "",
  },
  {
    id: "1724309733",
    name: "SAGBIDESPACHO DANIEL EDUARDO",
    role: "",
  },
  {
    id: "1724345705",
    name: "SAGBIDESPACHO MARTIN",
    role: "",
  },
  {
    id: "1714295393",
    name: "SERRANO ALVAREZ JONNY GABRIEL",
    role: "",
  },
  {
    id: "1723437584",
    name: "SILVA VASQUEZ STEVEN NELSON",
    role: "",
  },
  {
    id: "1724262293",
    name: "SOLORZANO PEREZ MIGUEL ARTURO",
    role: "",
  },
  {
    id: "1723209681",
    name: "SOMOSANCA RAMIREZ EDWIN",
    role: "",
  },
  {
    id: "1723118134",
    name: "SOTELO BAQUERA FABIOLA ALEJANDRA",
    role: "",
  },
  {
    id: "1723970538",
    name: "SUAREZ CAMPOVERDE KEVIN ANDRES",
    role: "",
  },
  {
    id: "1721525407",
    name: "SUAREZ GUALDRON DANIEL ENRIQUE",
    role: "",
  },
  {
    id: "1725741414",
    name: "TERRERA SANTA MARTA MAURICIO",
    role: "",
  },
  {
    id: "1724068795",
    name: "TUMBACO YUMANA ESTEBAN",
    role: "",
  },
  {
    id: "1725355600",
    name: "TUMBACO YUMANA VICTOR MANUEL",
    role: "",
  },
  {
    id: "1723879313",
    name: "URCUQUI GUALDRON MICHAEL JAVIER",
    role: "",
  },
  {
    id: "1723451607",
    name: "VALENCIA MOSQUERA NELSON RAMON",
    role: "",
  },
  {
    id: "1725473007",
    name: "VILLALBA TOAPANTA JORGE LUIS",
    role: "",
  },
  {
    id: "1712422531",
    name: "ZAMBRANO TORO SANTIAGO ENRIQUE",
    role: "",
  },
];

export const cuentas = [
  {
    gastos: {
      proyecto: {
        admn: {
          empresa: {
            prebam: {
              cuenta: [
                "AGUA POTABLE - 5.1.1.02.02",
                "ALIMENTACION - 5.1.1.02.04",
                "CAFETERIA - 5.1.1.02.17",
                "CAPACITACION - 5.1.1.01.09",
                "COMBUSTIBLE DIESEL - 5.1.1.02.10",
                "COMBUSTIBLE GASOLINA SUPER EXTRA - 5.1.1.02.81",
                "COMBUSTIBLE GLP (GAS) - 5.1.1.02.62",
                "COURIER - 5.1.1.02.11",
                "CUSTODIA POLICIAL Y OTROS - 5.1.1.02.12",
                "ENERGIA ELECTRICA - 5.1.1.02.18",
                "ESTIBAJE - 5.1.1.02.19",
                "FALTANTES DE INVENTARIOS (ASUME LOGEX) - 5.1.1.02.20",
                "GASTOS LEGALES - 5.1.1.02.68",
                "GASTOS MEDICOS - 5.1.1.01.18",
                "HOSPEDAJE - 5.1.1.02.28",
                "INGRESOS PREBAM (FALTANTES Y OTROS) - 4.2.1.01.07",
                "MANTENIMIENTO DE BODEGAS COMPRAS - 5.1.1.02.82",
                "MANTENIMIENTO DE BODEGAS SERVICIOS - 5.1.1.02.33",
                "MANTENIMIENTO VEHICULOS - 5.1.1.02.35",
                "MATRICULACION VEHICULOS - 5.1.1.02.36",
                "MOVILIZACION - 5.1.1.02.37",
                "PARQUEO Y GARAGE - 5.1.1.02.45",
                "PEAJES - 5.1.1.02.39",
                "PERSONAL EVENTUAL - 5.1.1.02.41",
                "SEGURIDAD INDUSTRIAL - 5.1.1.02.46",
                "SERVICIO DE INTERNET - 5.1.1.02.50",
                "SERVICIOS PRESTADOS - 5.2.1.02.37",
                "SUELDO EN CONTRA MES ANTERIOR - 2.1.5.01.01",
                "SUMINISTROS DE BODEGA - 5.1.1.02.83",
                "SUMINISTROS DE LIMPIEZA - 5.1.1.02.75",
                "SUMINISTROS DE OFICINA - 5.1.1.02.51",
                "TELEFONIA CELULAR - 5.1.1.02.52",
                "TELEFONIA FIJA - 5.1.1.02.53",
                "TRANSPORTE - 5.2.1.02.28",
                "TRANSPORTE VARIOS (OTROS) - 5.1.1.02.57",
                "VIATICOS ROL  - 5.1.1.02.58",
              ],
            },
            sersupport: {
              cuenta: [
                "ALIMENTACION - 5.1.1.02.04",
                "ANTICIPOS DE QUINCENA A EMPLEADOS - 1.1.20.2.03",
                "BONO DE PRODUCTIVIDAD - 5.1.1.01.19",
                "CAFETERIA - 5.1.1.02.17",
                "CAPACITACION - 5.1.1.01.09",
                "COMBUSTIBLE DIESEL - 5.1.1.02.10",
                "COMBUSTIBLE GASOLINA SUPER EXTRA  - 5.1.1.02.81",
                "COMBUSTIBLE GLP (GAS) - 5.1.1.02.62",
                "COURIER - 5.1.1.02.11",
                "CUENTAS POR COBRAR VARIOS DESCUENTOS EMPLEADOS - 1.1.20.4.11",
                "CUSTODIA POLICIAL REEMBOLSO CN - 5.1.1.02.87",
                "CUSTODIA POLICIAL Y OTROS - 5.1.1.02.12",
                "ENERGIA ELECTRICA - 5.1.1.02.18",
                "ESTIBAJE - 5.1.1.02.19",
                "FALTANTES DE INVENTARIOS (ASUME LOGEX) - 5.1.1.02.20",
                "FALTANTES POR COBRAR EMPLEADOS Y TRANSPORTISTAS - 5.1.1.02.22",
                "GASTO TRANSPORTE MATERIALES FEP - 5.1.1.02.79",
                "GASTOS BANCARIOS - 5.1.1.02.23",
                "GASTOS LEGALES - 5.1.1.02.68",
                "GASTOS MEDICOS - 5.1.1.02.25",
                "GASTOS POR DESCUENTOS - 5.1.1.02.86",
                "HOSPEDAJE - 5.1.1.02.28",
                "INGRESOS CRUCE FTE - 4.2.1.01.12",
                "MANTENIMIENTO DE BODEGAS COMPRAS  - 5.1.1.02.82",
                "MANTENIMIENTO DE BODEGAS SERVICIOS - 5.1.1.02.33",
                "MANTENIMIENTO MONTACARGAS - 5.1.1.02.70",
                "MANTENIMIENTO VEHICULOS - 5.1.1.02.35",
                "MATRICULACION VEHICULOS - 5.1.1.02.36",
                "MOVILIZACION - 5.1.1.02.37",
                "MULTAS A EMPLEADOS - 2.1.5.01.08",
                "MULTAS DE TRANSITO  - 1.1.2.02.01",
                "PARQUEO Y GARAGE - 5.1.1.02.45",
                "PEAJES - 5.1.1.02.39",
                "PERSONAL EVENTUAL - 5.1.1.02.41",
                "PRESTAMOS QUIROGRAFARIOS - 2.1.5.01.06",
                "PRESTAMOS Y ANTICIPOS EMPLEADOS - 1.1.20.2.01",
                "RECUPERACION VALORES COMISION DE REPARTO - 4.2.1.01.10",
                "RESTRICCION VEHICULAR - 5.1.1.02.84",
                "RETENCION JUDICIAL - 2.1.5.01.12",
                "SEGURIDAD INDUSTRIAL - 5.1.1.02.46",
                "SERVICIO DE INTERNET - 5.1.1.02.50",
                "SUBSIDIO IESS - 5.1.1.01.01",
                "SUELDO EN CONTRA MES ANTERIOR - 2.1.5.01.01",
                "SUELDOS Y SALARIOS - 5.1.1.01.01",
                "SUMINISTROS DE BODEGA - 5.1.1.02.83",
                "SUMINISTROS DE LIMPIEZA - 5.1.1.02.75",
                "SUMINISTROS DE OFICINA - 5.1.1.02.51",
                "TELEFONIA CELULAR - 5.1.1.02.52",
                "TELEFONIA FIJA - 5.1.1.02.53",
                "TRANSPORTE VARIOS (OTROS) - 5.1.1.02.57",
                "UNIFORMES OPERATIVO - 5.1.1.02.76",
                "ventas logex.com.ec - 2.1.7.01.05",
                "VIATICOS PROVEEDORES - 5.1.1.02.85",
                "VIATICOS ROL  - 5.1.1.02.58",
              ],
            },
          },
          responsable: admnUsers,
        },
        cnqt: {
          responsable: cnqtUsers,
        },
      },
    },
  },
];
