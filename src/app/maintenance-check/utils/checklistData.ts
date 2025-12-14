import { ChecklistSection } from "./types";

export const initialDailyChecklist: ChecklistSection[] = [
  {
    title: "General maintenance",
    items: [
      {
        task: "Ensure lab is clean and organized (verification only; cleaning handled by SA, Review CCTV Camera)",
        status: false,
        remarks: "",
      },
      {
        task: "Check if chairs and tables are properly arranged and undamaged",
        status: false,
        remarks: "",
      },
      { task: "Inspect whiteboard and markers", status: false, remarks: "" },
      {
        task: "Ensure fire extinguisher is accessible and not expired",
        status: false,
        remarks: "",
      },
      {
        task: "Verify emergency lamps and signages are visible and functional",
        status: false,
        remarks: "",
      },
    ],
  },
  {
    title: "Computer Systems",
    items: [
      {
        task: "Power on computers and check if they boot properly",
        status: false,
        remarks: "",
      },
      {
        task: "Test keyboard, mouse, and monitor for each computer",
        status: false,
        remarks: "",
      },
      {
        task: "Verify network connectivity for all computers",
        status: false,
        remarks: "",
      },
      {
        task: "Ensure printer, scanner, and other peripherals are functional",
        status: false,
        remarks: "",
      },
    ],
  },
  {
    title: "Electrical and Networking",
    items: [
      {
        task: "Check air-conditioning unit functionality",
        status: false,
        remarks: "",
      },
      {
        task: "Ensure TV is operational and remote is working",
        status: false,
        remarks: "",
      },
      {
        task: "Test lighting and ensure all bulbs are functional",
        status: false,
        remarks: "",
      },
      {
        task: "Inspect electrical outlets and extension wires for any damage",
        status: false,
        remarks: "",
      },
      {
        task: "Ensure all routers and network switches are operational",
        status: false,
        remarks: "",
      },
    ],
  },
  {
    title: "Security and Safety",
    items: [
      {
        task: "Check windows and doors for proper locking",
        status: false,
        remarks: "",
      },
      {
        task: "Inspect medicine kit and restock if necessary",
        status: false,
        remarks: "",
      },
      { task: "Report any issues immediately", status: false, remarks: "" },
      { task: "Review CCTV Camera", status: false, remarks: "" },
    ],
  },
];

export const initialWeeklyChecklist: ChecklistSection[] = [
  {
    title: "Computer Systems",
    items: [
      {
        task: "Perform antivirus scan on all computers",
        status: false,
        remarks: "",
      },
      {
        task: "Check for and install software updates",
        status: false,
        remarks: "",
      },
      {
        task: "Run disk cleanup and defragmentation (if applicable)",
        status: false,
        remarks: "",
      },
      {
        task: "Deep clean computer keyboards, monitors, and mice",
        status: false,
        remarks: "",
      },
      { task: "Dust off CPU fans and vents", status: false, remarks: "" },
    ],
  },
  {
    title: "Electrical and Networking",
    items: [
      {
        task: "Inspect network stability and check for slowdowns",
        status: false,
        remarks: "",
      },
      {
        task: "Test all electrical sockets and report any issues",
        status: false,
        remarks: "",
      },
      {
        task: "Inspect circuit breakers for any irregularities",
        status: false,
        remarks: "",
      },
      {
        task: "Ensure air-conditioning filters are clean",
        status: false,
        remarks: "",
      },
    ],
  },
  {
    title: "Security and Safety",
    items: [
      {
        task: "Verify that all signages are still visible and intact",
        status: false,
        remarks: "",
      },
      {
        task: "Restock missing items in the medicine kit",
        status: false,
        remarks: "",
      },
      {
        task: "Ensure all security cameras (if available) are working",
        status: false,
        remarks: "",
      },
    ],
  },
];

export const initialMonthlyChecklist: ChecklistSection[] = [
  {
    title: "Computer Systems",
    items: [
      {
        task: "Conduct a full system backup for all important data",
        status: false,
        remarks: "",
      },
      {
        task: "Inspect and clean power supply units for computers",
        status: false,
        remarks: "",
      },
      {
        task: "Replace worn-out peripherals (keyboards, mice, etc.)",
        status: false,
        remarks: "",
      },
      {
        task: "Verify all software licenses and renew if necessary",
        status: false,
        remarks: "",
      },
    ],
  },
  {
    title: "Electrical and Networking",
    items: [
      {
        task: "Inspect air-conditioning unit filters and clean or replace",
        status: false,
        remarks: "",
      },
      {
        task: "Ensure all routers, switches, and access points are working well",
        status: false,
        remarks: "",
      },
      {
        task: "Inspect surge protectors and replace faulty ones",
        status: false,
        remarks: "",
      },
      {
        task: "Test emergency lamps and replace batteries if needed",
        status: false,
        remarks: "",
      },
    ],
  },
  {
    title: "General Lab Maintenance",
    items: [
      {
        task: "Perform deep cleaning of floors, furniture, and all surfaces",
        status: false,
        remarks: "",
      },
      {
        task: "Inspect all doors and windows for security issues",
        status: false,
        remarks: "",
      },
      {
        task: "Conduct a full inventory check using ERMA",
        status: false,
        remarks: "",
      },
      {
        task: "Ensure all computer cables are properly arranged and secured",
        status: false,
        remarks: "",
      },
      {
        task: "Prepare a detailed report on equipment conditions and issues",
        status: false,
        remarks: "",
      },
    ],
  },
];
