export interface ProcessNode {
  tag: string;
  title: string;
  section: string;

  temperature: string;
  pressure: string;
  fluid: string;

  equipmentPage?: string;
  pidPdf?: string;

  driveUrl?: string;

  x: number;
  y: number;
}

export const PROCESS_NODES: ProcessNode[] = [
  {
    tag: "101-F501",
    title: "MEA Regenerator",
    section: "Pretreatment",

    temperature: "121°C",
    pressure: "1.8 barg",
    fluid: "Rich Amine",

    equipmentPage: "/equipment/101-F501",
    pidPdf: "/pid/101-F501.pdf",

    driveUrl:
      "https://drive.google.com/drive/folders/1_WeQYp02-LYO8_KmKuK_wFEYLnf_WwLR",

    x: 20,
    y: 26,
  },

  {
    tag: "102-R03.10",
    title: "Molecular Sieve",
    section: "Dehydration",

    temperature: "22°C",
    pressure: "39 barg",
    fluid: "Dry Gas",

    equipmentPage: "/equipment/102-R03.10",
    pidPdf: "/pid/102-R03.10.pdf",

    driveUrl:
      "https://drive.google.com/drive/folders/1DxRXgW2-O9_z3RVvJO1xdbrXChZZspGL",

    x: 43,
    y: 70,
  },

  {
    tag: "105-K01.20",
    title: "MCR Compressor",
    section: "Liquefaction",

    temperature: "98°C",
    pressure: "44 barg",
    fluid: "Mixed Refrigerant",

    equipmentPage: "/equipment/105-K01.20",
    pidPdf: "/pid/105-K01.20.pdf",

    driveUrl:
      "https://drive.google.com/drive/folders/1LB35_eT9YsONVsPudIL1Ddh6SxdBD-Fw",

    x: 75,
    y: 40,
  },
];
