export interface Department {
  id: string;
  name: string;
  roles: string[];
}

export const departments: Department[] = [
  {
    id: "executive",
    name: "Executive Leadership",
    roles: [
      "Board of Directors",
      "Managing Director",
    ]
  },
  {
    id: "training-technical",
    name: "Training & Technical Services",
    roles: [
      "Training & Service Manager",
      "Survey Solutions Executive",
      "DB Developer / Application Engineer",
      "Technical Support Executive - Service Center",
      "Remote Sensing & Photogrammetrist",
      "GIS Analyst / Developer",
    ]
  },
  {
    id: "sales",
    name: "Sales & Business Development",
    roles: [
      "Sales Manager",
      "Business Development Executive",
      "Account Executive - Survey, Civil & Construction",
      "Account Executive - Natural Resources & Agriculture",
      "Account Executive - Infrastructure & Business",
      "Account Executive - Health & Human Services",
      "Account Executive - Sales & Marketing",
    ]
  },
  {
    id: "finance-admin",
    name: "Finance & Administration",
    roles: [
      "Finance & Administration Manager",
      "Accountant",
      "Admin Assistant",
      "IT Administrator",
      "Office Assistant",
    ]
  },
  {
    id: "aviation",
    name: "Aviation Operations (RPAS/Drone)",
    roles: [
      "Chief Remote Pilot",
      "Type Specialist",
      "Remote Pilots",
      "RPAS Observers",
    ]
  },
  {
    id: "maintenance",
    name: "Maintenance & Technical Support",
    roles: [
      "Maintenance Controller",
      "Authorized Service & Repair Center",
      "In-House Maintenance",
    ]
  },
  {
    id: "security",
    name: "Security",
    roles: [
      "Head of Security",
    ]
  },
];
